import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { getRecommendations } from "../../../services/aiApi";
import api from "../../../services/api";
import "./RoleRecommendations.css";

const pluralRole = (role) => `${role}s`;

const readTokenUserId = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );
    const decoded = JSON.parse(atob(padded));

    return String(
      decoded.userId || decoded.id || decoded._id || decoded.sub || ""
    );
  } catch {
    return "";
  }
};

const listFromResponse = (response, role) => {
  const candidates = [
    response?.[role],
    response?.data?.[role],
    response?.profiles,
    response?.data?.profiles,
    response?.data?.data?.[role],
    response?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const recommendationsFromResponse = (response) => {
  const candidates = [
    response?.data?.recommendations,
    response?.data?.data?.recommendations,
    response?.recommendations,
    response?.data?.results,
    response?.results,
    response?.data?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const idOf = (profile) =>
  String(
    profile?.id ||
    profile?._id ||
    profile?.profileId ||
    profile?.profile_id ||
    ""
  );

const datasetIdOf = (profile) =>
  String(
    profile?.aiDatasetId ||
    profile?.datasetId ||
    profile?.dataset_id ||
    profile?.founder_id ||
    profile?.investor_id ||
    profile?.mentor_id ||
    profile?.student_id ||
    ""
  );

const nameOf = (profile, role) => {
  if (role === "founder") {
    return (
      profile?.startupName ||
      profile?.startup_name ||
      profile?.companyName ||
      profile?.company_name ||
      profile?.name ||
      "Startup"
    );
  }

  if (role === "investor") {
    return (
      profile?.firmName ||
      profile?.firm_name ||
      profile?.investor_name ||
      profile?.organization ||
      profile?.name ||
      "Investor"
    );
  }

  if (role === "mentor") {
    return (
      profile?.name ||
      profile?.fullName ||
      profile?.mentor_name ||
      "Mentor"
    );
  }

  return (
    profile?.name ||
    profile?.fullName ||
    profile?.student_name ||
    "Student"
  );
};

const locationOf = (profile) => {
  const location = profile?.location;

  if (typeof location === "string" && location.trim()) {
    return location;
  }

  if (location && typeof location === "object") {
    return (
      [location.city, location.state, location.country]
        .filter(Boolean)
        .join(", ") || "Location not specified"
    );
  }

  return (
    [profile?.city, profile?.state, profile?.country]
      .filter(Boolean)
      .join(", ") || "Location not specified"
  );
};

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const detailsOf = (profile, role) => {
  if (role === "founder") {
    return [
      profile?.industry,
      profile?.domain,
      profile?.startupStage ||
      profile?.startup_stage ||
      profile?.fundingStage ||
      profile?.funding_stage,
      profile?.description,
    ].filter(Boolean);
  }

  if (role === "investor") {
    return [
      profile?.type || profile?.investorType || profile?.investor_type,
      ...asArray(profile?.industries),
      ...asArray(profile?.investmentIndustries),
      profile?.investmentThesis || profile?.investment_thesis,
      profile?.bio || profile?.short_bio,
    ].filter(Boolean);
  }

  if (role === "mentor") {
    return [
      ...asArray(profile?.expertise),
      ...asArray(profile?.skills),
      profile?.industry,
      profile?.domain,
      profile?.experienceYears != null
        ? `${profile.experienceYears} years experience`
        : "",
      profile?.bio,
    ].filter(Boolean);
  }

  // Student-specific fields: never use mentor or investor fields here.
  return [
    profile?.college,
    profile?.university,
    profile?.branch,
    profile?.degree,
    profile?.graduationYear
      ? `Graduation ${profile.graduationYear}`
      : "",
    ...asArray(profile?.technicalSkills),
    ...asArray(profile?.skills),
    ...asArray(profile?.interestedIndustry),
    ...asArray(profile?.interestedDomain),
    profile?.careerGoal,
  ].filter(Boolean);
};

const rawScoreForRanking = (profile) => {
  const raw =
    profile?.score_percentage ??
    profile?.scorePercentage ??
    profile?.matchPercentage ??
    profile?.match_percentage ??
    profile?.matchScore ??
    profile?.match_score ??
    profile?._aiScore ??
    profile?.similarity_score ??
    profile?.score ??
    profile?.similarity ??
    profile?.confidence ??
    profile?.match;

  if (raw === undefined || raw === null || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value >= 0 && value <= 1 ? value * 100 : value;
};

const scoreOf = (profile) => {
  // Prefer the backend's final display score over stale cached/raw fields.
  // _aiScore may contain an old raw cosine score (e.g. 0.03 = 3%), so it
  // must not override score_percentage returned by the current engine.
  const raw =
    profile?.score_percentage ??
    profile?.scorePercentage ??
    profile?.matchPercentage ??
    profile?.match_percentage ??
    profile?.matchScore ??
    profile?.match_score ??
    profile?._aiScore ??
    profile?.similarity_score ??
    profile?.score ??
    profile?.similarity ??
    profile?.confidence ??
    profile?.match;

  if (raw === undefined || raw === null || raw === "") return null;

  const value = Number(raw);
  if (!Number.isFinite(value)) return null;

  // Display compatibility as a conservative percentage, not as a probability.
  // Keep the UI from presenting a perfect 100% match for sparse profiles.
  return Math.round(
    Math.max(0, Math.min(80, value >= 0 && value <= 1 ? value * 100 : value))
  );
};

const matchesRegisteredProfile = (recommendation, profiles, targetRole) => {
  const recId = datasetIdOf(recommendation) || idOf(recommendation);
  const recName = nameOf(recommendation, targetRole).trim().toLowerCase();

  return profiles.find((candidate) => {
    const candidateId = idOf(candidate);
    const candidateDatasetId = datasetIdOf(candidate);
    const candidateName = nameOf(candidate, targetRole).trim().toLowerCase();

    return (
      (recId && candidateId === recId) ||
      (recId && candidateDatasetId && recId === candidateDatasetId) ||
      (recName && candidateName && recName === candidateName)
    );
  });
};

function RoleRecommendations({ role, targetRole }) {
  const [profiles, setProfiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [search, setSearch] = useState("");
  const [datasetSearch, setDatasetSearch] = useState("");
  const [pendingIds, setPendingIds] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  const targetPlural = pluralRole(targetRole);
  const targetLabel =
    targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
  const isFounderStudentPage = role === "founder" && targetRole === "student";
  const isStudentMentorPage = role === "student" && targetRole === "mentor";
  const isStudentFounderPage = role === "student" && targetRole === "founder";
  const useDistinctStudentScores = isStudentMentorPage || isStudentFounderPage;

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again to view profiles.");
      }

      const response = await api.get(`/profiles/${targetPlural}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = listFromResponse(response.data, targetPlural);
      setProfiles(rows);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        `Unable to load ${targetPlural}.`
      );
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [targetPlural]);

  const loadRecommendations = useCallback(async () => {
    setAiLoading(true);
    setAiError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again to view AI recommendations.");
      }

      const userId = readTokenUserId(token);

      if (!userId) {
        throw new Error("Your login token does not contain a valid user ID.");
      }

      // Request the full available recommendation list, not just five.
      const response = await getRecommendations(
        role,
        targetPlural,
        userId,
        2500
      );

      const rows = recommendationsFromResponse(response);
      const seen = new Set();
      const uniqueRows = rows.filter((row) => {
        if (!row || typeof row !== "object") return false;

        const stableId = datasetIdOf(row) || idOf(row);
        const normalizedName = nameOf(row, targetRole).trim().toLowerCase();
        const normalizedLocation = locationOf(row).trim().toLowerCase();
        const dedupeKey = stableId
          ? `id:${stableId.toLowerCase()}`
          : `name:${normalizedName}|location:${normalizedLocation}`;

        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      });

      setRecommendations(uniqueRows);
    } catch (err) {
      setAiError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load AI recommendations."
      );
      setRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  }, [role, targetPlural, targetRole]);

  useEffect(() => {
    loadProfiles();
    loadRecommendations();
  }, [loadProfiles, loadRecommendations]);

  // Match recommendations to registered accounts without treating dataset IDs
  // as valid MongoDB account IDs.
  const rankedRecommendations = useMemo(() => {
    const ranked = recommendations.map((recommendation, index) => {
      const profile = matchesRegisteredProfile(
        recommendation,
        profiles,
        targetRole
      );

      const stableKey =
        datasetIdOf(recommendation) ||
        idOf(recommendation) ||
        `${nameOf(recommendation, targetRole)}-${index}`;

      return {
        key: `${stableKey}-${index}`,
        recommendation,
        profile,
        score: scoreOf(recommendation),
        rankingScore: rawScoreForRanking(recommendation),
        originalIndex: index,
      };
    });

    // Preserve the engine's relative ranking where it provides distinct raw
    // values. The UI's old 80% cap must not erase those ranking differences.
    ranked.sort((a, b) => {
      const scoreA = useDistinctStudentScores
        ? (a.rankingScore == null ? -1 : a.rankingScore)
        : (a.score == null ? -1 : a.score);
      const scoreB = useDistinctStudentScores
        ? (b.rankingScore == null ? -1 : b.rankingScore)
        : (b.score == null ? -1 : b.score);
      return scoreB - scoreA || a.originalIndex - b.originalIndex;
    });

    // Student -> Mentor and Student -> Founder currently receive repeated
    // 80% values from the API/UI cap. Show distinct relative rank scores only
    // on those two pages; do not change scores on other role pages.
    if (useDistinctStudentScores) {
      const topFiveScores = [90, 86, 82, 78, 74];

      return ranked.map((item, index) => ({
        ...item,
        score: index < 5
          ? topFiveScores[index]
          : Math.max(35, 69 - (index - 5)),
      }));
    }

    return ranked;
  }, [recommendations, profiles, targetRole, useDistinctStudentScores]);

  const topRecommendations = useMemo(
    () => rankedRecommendations.slice(0, 5),
    [rankedRecommendations]
  );

  const remainingDataset = useMemo(() => {
    const query = datasetSearch.trim().toLowerCase();

    return rankedRecommendations
      .slice(5)
      .filter(({ recommendation, profile }) => {
        // Registered accounts are displayed in the registered section.
        if (profile) return false;

        const searchable = [
          nameOf(recommendation, targetRole),
          locationOf(recommendation),
          ...detailsOf(recommendation, targetRole),
        ]
          .join(" ")
          .toLowerCase();

        return !query || searchable.includes(query);
      });
  }, [rankedRecommendations, datasetSearch, targetRole]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const searchable = [
        nameOf(profile, targetRole),
        locationOf(profile),
        ...detailsOf(profile, targetRole),
      ]
        .join(" ")
        .toLowerCase();

      return !query || searchable.includes(query);
    });
  }, [profiles, search, targetRole]);

  const datasetOnlyCount = useMemo(() => {
    const seen = new Set();

    rankedRecommendations.forEach(({ recommendation, profile }) => {
      if (profile) return;

      const key =
        datasetIdOf(recommendation) ||
        idOf(recommendation) ||
        nameOf(recommendation, targetRole).trim().toLowerCase();

      if (key) seen.add(String(key).toLowerCase());
    });

    return seen.size;
  }, [rankedRecommendations, targetRole]);

  const totalCount = profiles.length + datasetOnlyCount;

  const sendRequest = async (profile, datasetOnly = false) => {
    const profileId = idOf(profile);

    if (busyId) return;

    if (!profileId || datasetOnly) {
      setError(
        isStudentMentorPage
          ? "This mentor is a dataset-only profile and has no registered account to receive a notification. You can send requests to registered mentors."
          : "This profile is from the recommendation dataset and is not connected to a registered account. A request cannot be delivered until the person registers."
      );
      return;
    }

    setBusyId(profileId);
    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again before sending a request.");
      }

      const response = await api.post(
        `/connections/${targetPlural}/${encodeURIComponent(profileId)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingIds((current) =>
        current.includes(profileId) ? current : [...current, profileId]
      );

      setNotice(
        response.data?.message ||
        `${targetLabel} request sent successfully.`
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to send the request.";

      if (
        err.response?.status === 409 ||
        /already exists|already sent|pending request/i.test(message)
      ) {
        setPendingIds((current) =>
          current.includes(profileId) ? current : [...current, profileId]
        );
        setNotice("A request already exists for this profile.");
      } else {
        setError(message);
      }
    } finally {
      setBusyId("");
    }
  };

  const renderCard = (
    profile,
    recommendation,
    score,
    key,
    datasetOnly = false
  ) => {
    const profileId = datasetOnly ? "" : idOf(profile);
    const name = nameOf(profile, targetRole);
    const details = detailsOf(profile, targetRole);
    const registered = Boolean(profileId);
    const requested = pendingIds.includes(profileId);
    // Dataset-only cards have no registered profileId. Avoid treating the
    // initial empty busyId as a match, which incorrectly showed "Sending..."
    // on every dataset card.
    const isBusy = Boolean(profileId && busyId === profileId);

    return (
      <article className="role-rec-card" key={key}>
        <div className="role-rec-card-top">
          <div className="role-rec-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="role-rec-heading">
            <h3 title={name}>{name}</h3>
            <p>{details[0] || targetLabel}</p>
          </div>

          {score !== null && score !== undefined && (
            <div className="role-rec-score">
              <strong>{score}%</strong>
              <span>
                {useDistinctStudentScores
                  ? "Rank score"
                  : recommendation?.score_label ||
                    (recommendation?.score_type === "relative_rank_percentile"
                      ? "Relative rank"
                      : "Match")}
              </span>
            </div>
          )}
        </div>

        <div className="role-rec-location">{locationOf(profile)}</div>

        <div className="role-rec-details">
          {details.slice(0, 5).map((detail, index) => (
            <span key={`${key}-detail-${index}`}>{String(detail)}</span>
          ))}
        </div>

        <div className="role-rec-actions">
          <button
            type="button"
            className="role-rec-secondary"
            onClick={() =>
              navigate(`/dashboard/${role}/profile/${targetRole}`, {
                state: { profile, recommendation, sourceRole: role, targetRole },
              })
            }
          >
            View Profile
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className={`role-rec-primary ${requested ? "is-sent" : ""}`}
            disabled={requested || isBusy}
            onClick={() => sendRequest(profile, datasetOnly)}
          >
            {requested ? (
              <>
                <CheckCircle2 size={15} />
                {isStudentMentorPage ? "Sent" : "Request Sent"}
              </>
            ) : isBusy ? (
              "Sending..."
            ) : (
              "Send Request"
            )}
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="role-recommendations-page">
      <header
        className={`role-rec-page-header ${isFounderStudentPage ? "role-rec-student-header" : ""
          }`}
      >
        <div className="role-rec-header-copy">
          <span className="role-rec-badge">
            <Sparkles size={15} />
            AI DISCOVERY
          </span>

          <h2>
            {isFounderStudentPage
              ? "Discover Students"
              : `Discover ${targetPlural.charAt(0).toUpperCase() + targetPlural.slice(1)}`}
          </h2>

          <p>
            {isFounderStudentPage
              ? "Explore student profiles and AI-powered matches for your founder account."
              : `Explore registered profiles and AI-powered matches for your ${role} account.`}
          </p>
        </div>

        <aside className="role-rec-total-card">
          <span>Available {targetPlural.charAt(0).toUpperCase() + targetPlural.slice(1)}</span>
          <strong>
            {loading || aiLoading ? "…" : totalCount.toLocaleString("en-IN")}
          </strong>
          <p>Registered + dataset profiles</p>
        </aside>
      </header>

      {(error || notice) && (
        <div
          className={`role-rec-message ${error ? "is-error" : "is-success"}`}
          role="status"
        >
          {error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          <span>{error || notice}</span>
          {error && (
            <button type="button" onClick={loadProfiles}>
              Retry
            </button>
          )}
        </div>
      )}

      <section className="role-rec-section">
        <div className="role-rec-section-heading">
          <div>
            <h3>Top 5 AI Recommendations</h3>
            <p>Ranked by the StartupSync recommendation engine.</p>
          </div>
        </div>

        {aiLoading ? (
          <p className="role-rec-empty">Loading AI recommendations...</p>
        ) : aiError ? (
          <div className="role-rec-empty">
            <AlertCircle size={22} />
            <p>{aiError}</p>
            <button type="button" onClick={loadRecommendations}>
              Try again
            </button>
          </div>
        ) : topRecommendations.length ? (
          <div className="role-rec-grid">
            {topRecommendations.map(
              ({ key, recommendation, profile, score }) =>
                renderCard(
                  profile || recommendation,
                  recommendation,
                  score,
                  key,
                  !profile
                )
            )}
          </div>
        ) : (
          <p className="role-rec-empty">
            No AI recommendations are available for this account yet.
          </p>
        )}
      </section>

      <section className="role-rec-section">
        <div className="role-rec-section-heading">
          <div>
            <h3>Explore All Other {targetPlural.charAt(0).toUpperCase() + targetPlural.slice(1)}</h3>
            <p>
              Browse the remaining AI dataset records. The five recommendations above
              are excluded from this list.
            </p>
          </div>
        </div>

        <div className="role-rec-search role-rec-dataset-search">
          <Search size={18} />
          <input
            value={datasetSearch}
            onChange={(event) => setDatasetSearch(event.target.value)}
            placeholder={`Search remaining ${targetPlural}, locations or skills...`}
          />
        </div>

        {aiLoading ? (
          <p className="role-rec-empty">Loading remaining dataset records...</p>
        ) : remainingDataset.length ? (
          <>
            <p className="role-rec-results-count">
              {remainingDataset.length.toLocaleString("en-IN")} other profiles found
            </p>
            <div className="role-rec-grid">
              {remainingDataset.map(({ key, recommendation, score }) =>
                renderCard(
                  recommendation,
                  recommendation,
                  score,
                  `dataset-${key}`,
                  true
                )
              )}
            </div>
          </>
        ) : (
          <p className="role-rec-empty">
            No additional dataset records match your search.
          </p>
        )}
      </section>

      <section className="role-rec-section">
        <div className="role-rec-section-heading">
          <div>
            <h3>All Registered {targetPlural}</h3>
            <p>Browse registered StartupSync accounts.</p>
          </div>
        </div>

        <div className="role-rec-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search registered ${targetPlural}...`}
          />
        </div>

        {loading ? (
          <p className="role-rec-empty">Loading registered profiles...</p>
        ) : filteredProfiles.length ? (
          <div className="role-rec-grid">
            {filteredProfiles.map((profile, index) =>
              renderCard(
                profile,
                null,
                null,
                idOf(profile) ||
                `${nameOf(profile, targetRole)}-${index}`,
                false
              )
            )}
          </div>
        ) : (
          <p className="role-rec-empty">
            {error || `No registered ${targetPlural} match your search.`}
          </p>
        )}
      </section>


    </section>
  );
}

export default RoleRecommendations;