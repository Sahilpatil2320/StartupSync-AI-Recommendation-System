
import {
  Bookmark,
  Check,
  Filter,
  MapPin,
  Rocket,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { getRecommendations } from "../../../services/aiApi";
import "./MentorStartups.css";

const getUserIdFromToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return decoded.userId || decoded.id || decoded._id || decoded.sub || "";
  } catch {
    return "";
  }
};

const getProfileId = (profile) =>
  String(
    profile?._id ||
      profile?.id ||
      profile?.userId?._id ||
      profile?.userId?.id ||
      profile?.userId ||
      profile?.user?._id ||
      profile?.user?.id ||
      profile?.datasetId ||
      profile?.dataset_id ||
      profile?.startup_id ||
      profile?.founder_id ||
      ""
  );

const getName = (profile) =>
  profile?.startupName ||
  profile?.companyName ||
  profile?.name ||
  profile?.userId?.name ||
  profile?.user?.name ||
  profile?.fullName ||
  "Startup";

const getIndustry = (profile) =>
  profile?.industry || profile?.domain || profile?.sector || "";

const getStage = (profile) =>
  profile?.fundingStage ||
  profile?.startupStage ||
  profile?.stage ||
  profile?.businessStage ||
  "";

const getLocation = (profile) => {
  if (typeof profile?.location === "string") return profile.location;

  if (profile?.location && typeof profile.location === "object") {
    return [
      profile.location.city,
      profile.location.state,
      profile.location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return [profile?.city, profile?.state, profile?.country]
    .filter(Boolean)
    .join(", ");
};

const getDescription = (profile) =>
  profile?.tagline ||
  profile?.description ||
  profile?.startupDescription ||
  profile?.businessDescription ||
  "No startup description provided.";

const getTeamSize = (profile) =>
  profile?.teamSize ??
  profile?.numberOfEmployees ??
  profile?.employees ??
  "";

const getFounded = (profile) =>
  profile?.foundedYear || profile?.founded || profile?.yearFounded || "";

const getNeeds = (profile) => {
  const values =
    profile?.mentoringNeeds ||
    profile?.mentorshipNeeds ||
    profile?.lookingFor ||
    profile?.needs ||
    profile?.supportRequired ||
    profile?.areasOfSupport ||
    [];

  if (Array.isArray(values)) return values.filter(Boolean);
  if (typeof values === "string") {
    return values
      .split(/[,;]/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
};

const getRecommendationItems = (response) => {
  // getRecommendations() returns axios response.data, so the payload may be
  // an array directly or nested several levels under data/recommendations/results.
  const seenArrays = new Set();
  const findArray = (value, depth = 0) => {
    if (depth > 6 || value == null) return null;

    if (Array.isArray(value)) {
      if (value.length && value.some((item) => item && typeof item === "object")) {
        return value;
      }
      return value.length ? value : null;
    }

    if (typeof value !== "object") return null;
    if (seenArrays.has(value)) return null;
    seenArrays.add(value);

    const preferredKeys = [
      "recommendations",
      "results",
      "founders",
      "startups",
      "items",
      "matches",
      "data",
      "response",
      "payload",
    ];

    for (const key of preferredKeys) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const found = findArray(value[key], depth + 1);
        if (found) return found;
      }
    }

    // Some engine versions return a single candidate wrapped in an object.
    if (
      value.id !== undefined ||
      value.dataset_id !== undefined ||
      value.startup_id !== undefined ||
      value.founder_id !== undefined
    ) {
      return [value];
    }

    return null;
  };

  return findArray(response) || [];
};

const getRecommendationId = (item) =>
  String(
    item?.founderId ||
      item?.founder_id ||
      item?.profileId ||
      item?.profile_id ||
      item?.userId ||
      item?.user_id ||
      item?._id ||
      item?.id ||
      ""
  );

const getRecommendationName = (item) =>
  item?.startupName ||
  item?.companyName ||
  item?.name ||
  item?.founder_name ||
  item?.startup_name ||
  item?.founder?.startupName ||
  item?.founder?.name ||
  "";

const getRecommendationScore = (item) => {
  const raw =
    item?.score_percentage ??
    item?.scorePercentage ??
    item?.matchPercentage ??
    item?.match_percentage ??
    item?.matchScore ??
    item?.match_score ??
    item?.similarity_score ??
    item?.similarity ??
    item?.score ??
    item?.confidence ??
    item?.match;

  if (raw === undefined || raw === null || raw === "") return null;
  const score = Number(raw);
  if (!Number.isFinite(score)) return null;

  // Accept either a 0–1 similarity value or a 0–100 percentage.
  return Math.max(0, Math.min(100, score <= 1 ? score * 100 : score));
};

const getProfileCoverageScore = (profile) => {
  const checks = [
    Boolean(getDescription(profile) && getDescription(profile) !== "No startup description provided."),
    Boolean(getIndustry(profile)),
    Boolean(getStage(profile)),
    Boolean(getLocation(profile)),
    getNeeds(profile).length > 0,
    Boolean(getTeamSize(profile)),
    Boolean(getFounded(profile)),
  ];
  return checks.filter(Boolean).length / checks.length;
};

function MentorStartups() {
  const [founders, setFounders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [stage, setStage] = useState("All Stages");
  const [need, setNeed] = useState("All Needs");
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("score");
  const [savedStartups, setSavedStartups] = useState([]);
  const [requestedStartups, setRequestedStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [requestingId, setRequestingId] = useState("");

  const fetchFounders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again to view founder profiles.");
      }

      const response = await api.get("/profiles/founders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const records =
        response.data?.founders ||
        response.data?.data ||
        response.data?.profiles ||
        [];

      if (!Array.isArray(records)) {
        throw new Error("Unexpected response from the founder profiles API.");
      }

      setFounders(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load founder profiles."
      );
      setFounders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setAiLoading(true);
    setAiError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again to view AI recommendations.");
      }

      const userId = getUserIdFromToken(token);

      if (!userId) {
        throw new Error("Could not identify your account from the login token.");
      }

      const response = await getRecommendations("mentor", "founders", userId, 2500);
      const records = getRecommendationItems(response);
      // Keep all AI results; only the first five are displayed in the Top 5 section.
      setRecommendations(records);
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
  }, []);

  useEffect(() => {
    fetchFounders();
    fetchRecommendations();
  }, [fetchFounders, fetchRecommendations]);

  const industries = useMemo(
    () => [
      "All Industries",
      ...new Set(founders.map(getIndustry).filter(Boolean)),
    ],
    [founders]
  );

  const stages = useMemo(
    () => ["All Stages", ...new Set(founders.map(getStage).filter(Boolean))],
    [founders]
  );

  const needs = useMemo(
    () => [
      "All Needs",
      ...new Set(founders.flatMap(getNeeds)),
    ],
    [founders]
  );

  const locations = useMemo(
    () => [
      "All Locations",
      ...new Set(
        founders
          .map(getLocation)
          .filter(Boolean)
          .map((value) => value.split(",").pop().trim())
      ),
    ],
    [founders]
  );

  const scoredFounders = useMemo(() => {
    const normalizeText = (value) => String(value || "").trim().toLowerCase();
    const recommendationRecords = recommendations.map((item, index) => {
      const name =
        getRecommendationName(item) ||
        item?.startup ||
        item?.company ||
        item?.founderName ||
        item?.founder_name ||
        `Startup ${index + 1}`;

      const id =
        getRecommendationId(item) ||
        String(item?.datasetId || item?.dataset_id || item?.startup_id || item?.founder_id || `dataset-startup-${index + 1}`);

      const rawScore = getRecommendationScore(item);
      const description =
        item?.description ||
        item?.startup_description ||
        item?.startupDescription ||
        item?.business_description ||
        item?.businessDescription ||
        item?.tagline ||
        "";

      return {
        ...item,
        _id: item?._id || id,
        id,
        datasetId: item?.datasetId || item?.dataset_id || id,
        startupName: name,
        name,
        industry: item?.industry || item?.sector || item?.domain || item?.predicted_industry || "",
        fundingStage: item?.fundingStage || item?.funding_stage || item?.startupStage || item?.startup_stage || item?.stage || "",
        location: item?.location || item?.city || item?.startup_location || "",
        description,
        tagline: item?.tagline || description,
        mentoringNeeds:
          item?.mentoringNeeds ||
          item?.mentoring_needs ||
          item?.mentorshipNeeds ||
          item?.mentorship_needs ||
          item?.needs ||
          item?.support_required ||
          [],
        teamSize: item?.teamSize ?? item?.team_size ?? item?.employees ?? item?.number_of_employees ?? "",
        foundedYear: item?.foundedYear || item?.founded_year || item?.year_founded || "",
        _rawAiScore: rawScore,
        _aiRecommendationRank: index,
        _hasAiRecommendation: true,
        _isDatasetProfile: item?.registered_account === false || item?.source_type === "dataset" || !item?._id,
        _registeredAccount: item?.registered_account !== false && item?.source_type !== "dataset" && Boolean(item?._id || item?.profileId || item?.profile_id),
      };
    });

    // Match AI dataset rows to registered profiles where IDs or names agree.
    // This lets the Top 5 use the actual AI rows even when dataset IDs are not
    // MongoDB profile IDs, while preserving registered-profile actions.
    const registeredById = new Map();
    const registeredByName = new Map();
    founders.forEach((profile) => {
      const profileId = getProfileId(profile);
      const name = normalizeText(getName(profile));
      if (profileId) registeredById.set(profileId, profile);
      if (name && !registeredByName.has(name)) registeredByName.set(name, profile);
    });

    const mergedRecommendations = recommendationRecords.map((item) => {
      const possibleIds = [
        getRecommendationId(item),
        String(item?.datasetId || ""),
        String(item?.dataset_id || ""),
        String(item?.startup_id || ""),
        String(item?.founder_id || ""),
      ].filter(Boolean);

      let registered = null;
      for (const id of possibleIds) {
        if (registeredById.has(id)) {
          registered = registeredById.get(id);
          break;
        }
      }
      if (!registered) registered = registeredByName.get(normalizeText(getName(item)));

      return registered
        ? {
            ...item,
            ...registered,
            _aiSourceRecord: item,
            _rawAiScore: item._rawAiScore,
            _aiRecommendationRank: item._aiRecommendationRank,
            _hasAiRecommendation: true,
            _isDatasetProfile: false,
            _registeredAccount: true,
          }
        : item;
    });

    // Keep all AI dataset records and all registered founders, deduplicated by
    // normalized name + industry. Dataset records are not discarded merely
    // because they do not have a matching MongoDB account.
    const seen = new Set();
    const combined = [];
    const addUnique = (item, keyPrefix = "") => {
      const stableId = getProfileId(item);
      const nameIndustryKey = [
        normalizeText(getName(item)),
        normalizeText(getIndustry(item)),
      ].join("::");
      if (!normalizeText(getName(item))) return;

      // Dataset rows with different IDs are distinct records, even if their
      // names/industries happen to be identical. Use name+industry only when
      // the source has no stable identifier at all.
      const key = stableId
        ? `id:${stableId}`
        : `name:${nameIndustryKey}`;
      if (seen.has(key)) return;
      seen.add(key);
      combined.push({ ...item, _recordKey: `${keyPrefix}${key}` });
    };

    mergedRecommendations.forEach((item) => addUnique(item, "ai:"));
    founders.forEach((item) => {
      const name = normalizeText(getName(item));
      const industry = normalizeText(getIndustry(item));
      const alreadyPresent = combined.some(
        (candidate) =>
          normalizeText(getName(candidate)) === name &&
          normalizeText(getIndustry(candidate)) === industry
      );
      if (!alreadyPresent) {
        addUnique({
          ...item,
          _hasAiRecommendation: false,
          _isDatasetProfile: false,
          _registeredAccount: true,
          _profileCoverage: getProfileCoverageScore(item),
          _scoreType: "Profile rank",
        }, "registered:");
      }
    });

    const aiMatches = combined
      .filter((item) => item._hasAiRecommendation)
      .sort((a, b) => {
        const aScore = a._rawAiScore;
        const bScore = b._rawAiScore;
        if (Number.isFinite(aScore) && Number.isFinite(bScore) && aScore !== bScore) {
          return bScore - aScore;
        }
        return a._aiRecommendationRank - b._aiRecommendationRank;
      });

    const rawScores = aiMatches
      .map((item) => item._rawAiScore)
      .filter((score) => Number.isFinite(score));
    const minScore = rawScores.length ? Math.min(...rawScores) : 0;
    const maxScore = rawScores.length ? Math.max(...rawScores) : 0;

    const calibratedAi = aiMatches.map((item, index) => {
      let relativeScore;
      if (Number.isFinite(item._rawAiScore) && maxScore > minScore) {
        relativeScore =
          80 + ((item._rawAiScore - minScore) / (maxScore - minScore)) * 18;
      } else {
        // When raw similarities are missing or equal, preserve the engine's
        // ranking order and display a descending relative rank, not a probability.
        relativeScore = Math.max(80, 98 - index * (18 / Math.max(1, aiMatches.length - 1)));
      }
      return {
        ...item,
        _aiScore: Math.round(Math.max(80, Math.min(98, relativeScore))),
        _scoreType: "AI relative rank",
        _hasAiRecommendation: true,
      };
    });

    const nonAi = combined
      .filter((item) => !item._hasAiRecommendation)
      .sort((a, b) => {
        const coverageA = getProfileCoverageScore(a);
        const coverageB = getProfileCoverageScore(b);
        if (coverageA !== coverageB) return coverageB - coverageA;
        return getName(a).localeCompare(getName(b));
      })
      .map((item, index, all) => ({
        ...item,
        _profileCoverage: getProfileCoverageScore(item),
        _aiScore: Math.max(35, Math.min(79, Math.round(79 - (index / Math.max(1, all.length - 1)) * 35))),
        _scoreType: "Profile rank",
      }));

    return [...calibratedAi, ...nonAi];
  }, [founders, recommendations]);

  const recommendedFounders = useMemo(
    () => scoredFounders.filter((founder) => founder._hasAiRecommendation).slice(0, 5),
    [scoredFounders]
  );

  const recommendedIds = useMemo(
    () => new Set(recommendedFounders.map((founder) => founder._recordKey || getProfileId(founder) || getName(founder))),
    [recommendedFounders]
  );

  const remainingFounders = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    const filtered = scoredFounders.filter((founder) => {
      const candidateKey = founder._recordKey || getProfileId(founder) || getName(founder);
      if (recommendedIds.has(candidateKey)) return false;

      const searchableText = [
        getName(founder),
        getIndustry(founder),
        getStage(founder),
        getLocation(founder),
        getDescription(founder),
        ...getNeeds(founder),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const matchesIndustry =
        industry === "All Industries" || getIndustry(founder) === industry;
      const matchesStage =
        stage === "All Stages" || getStage(founder) === stage;
      const matchesNeed =
        need === "All Needs" || getNeeds(founder).includes(need);
      const matchesLocation =
        location === "All Locations" ||
        getLocation(founder).toLowerCase().includes(location.toLowerCase());

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesStage &&
        matchesNeed &&
        matchesLocation
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "score") return (Number(b._aiScore) || 0) - (Number(a._aiScore) || 0);
      if (sortBy === "name") return getName(a).localeCompare(getName(b));
      if (sortBy === "industry")
        return getIndustry(a).localeCompare(getIndustry(b));
      if (sortBy === "stage") return getStage(a).localeCompare(getStage(b));
      if (sortBy === "location")
        return getLocation(a).localeCompare(getLocation(b));
      if (sortBy === "newest")
        return Number(getFounded(b) || 0) - Number(getFounded(a) || 0);
      return 0;
    });
  }, [
    scoredFounders,
    recommendedIds,
    searchTerm,
    industry,
    stage,
    need,
    location,
    sortBy,
  ]);

  const toggleSaved = (id) => {
    setSavedStartups((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const requestMentorship = async (founder) => {
    const id = getProfileId(founder);

    if (founder?._isDatasetProfile || founder?._registeredAccount === false) {
      window.alert("This is an AI dataset profile and is not linked to a registered StartupSync account. You can review the profile, but mentorship requests require a registered founder account.");
      return;
    }

    if (!id) {
      window.alert("This founder profile does not have a valid profile ID.");
      return;
    }

    if (requestedStartups.includes(id)) return;

    try {
      setRequestingId(id);

      const token = localStorage.getItem("startupsync_token");

      await api.post(
        `/connections/founders/${encodeURIComponent(id)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequestedStartups((current) => [...current, id]);
      window.alert("Your mentorship interest has been sent.");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "";
      if (err.response?.status === 409 || /already exists|already sent|pending request/i.test(message)) {
        setRequestedStartups((current) => current.includes(id) ? current : [...current, id]);
        window.alert("A request already exists. This startup is now marked as Request Sent.");
      } else {
        window.alert(message || "Unable to send your mentorship interest. Please try again.");
      }
    } finally {
      setRequestingId("");
    }
  };

  const viewProfile = (founder) => {
    window.alert(
      [
        `Startup: ${getName(founder)}`,
        `Industry: ${getIndustry(founder) || "Not specified"}`,
        `Stage: ${getStage(founder) || "Not specified"}`,
        `Location: ${getLocation(founder) || "Not specified"}`,
        `Team size: ${getTeamSize(founder) || "Not specified"}`,
        `Mentoring needs: ${getNeeds(founder).join(", ") || "Not specified"}`,
        `Description: ${getDescription(founder)}`,
      ].join("\n\n")
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setIndustry("All Industries");
    setStage("All Stages");
    setNeed("All Needs");
    setLocation("All Locations");
    setSortBy("name");
  };

  const hasFilters =
    searchTerm ||
    industry !== "All Industries" ||
    stage !== "All Stages" ||
    need !== "All Needs" ||
    location !== "All Locations" ||
    sortBy !== "name";

  const renderFounderCard = (founder, recommended = false) => {
    const id = getProfileId(founder);
    const isSaved = savedStartups.includes(id);
    const isRequested = requestedStartups.includes(id);
    const score = founder._aiScore;
    const mentoringNeeds = getNeeds(founder);

    return (
      <article className="mentor-startup-card" key={founder._recordKey || id || getName(founder)}>
        <div className="mentor-startup-card-top">
          <div className="mentor-startup-logo">
            {getName(founder).charAt(0).toUpperCase()}
          </div>

          <div
            className="mentor-startup-match"
            title={
              recommended
                ? "Relative ranking derived from the AI recommendation response; not a probability."
                : "Profile-completeness ranking for profiles without an AI result; not a personalized match probability."
            }
          >
            {Number.isFinite(score)
              ? `${score}% ${recommended ? "AI Rank" : "Profile Rank"}`
              : recommended
                ? "AI Recommended"
                : "Profile Listed"}
          </div>
        </div>

        <div className="mentor-startup-main">
          <h3>{getName(founder)}</h3>

          <p className="mentor-startup-tagline">{getDescription(founder)}</p>

          <div className="mentor-startup-meta">
            <span>{getIndustry(founder) || "Industry not specified"}</span>
            <span>{getStage(founder) || "Stage not specified"}</span>
          </div>

          <div className="mentor-startup-location">
            <MapPin size={15} />
            {getLocation(founder) || "Location not provided"}
          </div>

          <p className="mentor-startup-description">{getDescription(founder)}</p>

          <div className="mentor-startup-needs">
            <h4>Looking for mentorship in</h4>
            <div className="mentor-startup-tags">
              {mentoringNeeds.length > 0 ? (
                mentoringNeeds.map((item) => <span key={item}>{item}</span>)
              ) : (
                <span>Needs not specified</span>
              )}
            </div>
          </div>

          <div className="mentor-startup-details">
            <div>
              <UsersRound size={16} />
              <span>
                {getTeamSize(founder)
                  ? `${getTeamSize(founder)} team members`
                  : "Team size not provided"}
              </span>
            </div>

            <div>
              <span className="mentor-startup-detail-dot" />
              <span>
                {getFounded(founder)
                  ? `Founded ${getFounded(founder)}`
                  : "Founded year not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="mentor-startup-actions">
          <button
            type="button"
            className={`mentor-startup-save ${isSaved ? "saved" : ""}`}
            onClick={() => toggleSaved(id)}
            aria-label={isSaved ? "Remove saved startup" : "Save startup"}
          >
            <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            className="mentor-startup-view"
            onClick={() => viewProfile(founder)}
          >
            View Profile
          </button>

          <button
            type="button"
            className={`mentor-startup-request ${
              isRequested ? "requested" : ""
            }`}
            disabled={
              founder?._isDatasetProfile ||
              founder?._registeredAccount === false ||
              isRequested ||
              requestingId === id
            }
            title={
              founder?._isDatasetProfile || founder?._registeredAccount === false
                ? "Dataset profile only; no registered account is linked."
                : "Offer mentorship to this registered founder."
            }
            onClick={() => requestMentorship(founder)}
          >
            {founder?._isDatasetProfile || founder?._registeredAccount === false ? (
              "Dataset Profile"
            ) : isRequested ? (
              <>
                <Check size={17} />
                Request Sent
              </>
            ) : requestingId === id ? (
              "Sending..."
            ) : (
              "Offer Mentorship"
            )}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="mentor-startups-page">
      <section className="mentor-startups-header">
        <div>
          <span className="mentor-startups-badge">Startup Discovery</span>
          <h2>Discover Startups</h2>
          <p>
            Discover AI-recommended founders and find startups that match your
            expertise and mentoring interests.
          </p>
        </div>

        <div className="mentor-startups-summary">
          <strong>{scoredFounders.length || founders.length}</strong>
          <span>Available Startup Profiles</span>
        </div>
      </section>

      <section style={{ margin: "24px 0 14px" }}>
        <h3>Top 5 AI Recommendations</h3>
        <p>Founders recommended for your mentor profile. Scores are relative ranking values, not probabilities.</p>
      </section>

      {aiLoading ? (
        <section className="mentor-startups-empty">
          <p>Loading AI recommendations...</p>
        </section>
      ) : aiError ? (
        <section className="mentor-startups-empty">
          <h3>Recommendations unavailable</h3>
          <p>{aiError}</p>
          <button type="button" className="btn btn-primary" onClick={fetchRecommendations}>
            Retry Recommendations
          </button>
        </section>
      ) : recommendedFounders.length > 0 ? (
        <section className="mentor-startups-grid">
          {recommendedFounders.slice(0, 5).map((founder) =>
            renderFounderCard(founder, true)
          )}
        </section>
      ) : (
        <section className="mentor-startups-empty">
          <div className="mentor-startups-empty-icon">
            <Rocket size={28} />
          </div>
          <h3>No AI recommendations returned</h3>
          <p>
            The recommendation API returned no startup records. Check the AI API response and ensure the founder/startup dataset is loaded.
          </p>
        </section>
      )}

      <section style={{ margin: "32px 0 14px" }}>
        <h3>Explore All Other Startups</h3>
        <p>Search, filter, and sort all remaining dataset and registered startup profiles. Dataset-only profiles are shown separately from registered accounts.</p>
      </section>

      <section className="mentor-startups-toolbar">
        <div className="mentor-startups-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search startups, industries or mentoring needs..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mentor-startups-filter-icon">
          <Filter size={18} />
          <span>Filters and Sorting</span>
        </div>

        <select
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
        >
          {industries.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={stage}
          onChange={(event) => setStage(event.target.value)}
        >
          {stages.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={need}
          onChange={(event) => setNeed(event.target.value)}
        >
          {needs.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        >
          {locations.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort startups"
        >
          <option value="score">Sort: Match Score High to Low</option>
          <option value="name">Sort: Name A–Z</option>
          <option value="industry">Sort: Industry</option>
          <option value="stage">Sort: Stage</option>
          <option value="location">Sort: Location</option>
          <option value="newest">Sort: Newest Founded</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            className="mentor-startups-clear"
            onClick={clearFilters}
          >
            <X size={16} />
            Clear
          </button>
        )}
      </section>

      {loading ? (
        <section className="mentor-startups-empty">
          <p>Loading registered founder profiles...</p>
        </section>
      ) : error ? (
        <section className="mentor-startups-empty">
          <h3>Unable to load startups</h3>
          <p>{error}</p>
        </section>
      ) : remainingFounders.length > 0 ? (
        <>
          <p style={{ margin: "18px 0" }}>
            {remainingFounders.length} other startup
            {remainingFounders.length !== 1 ? "s" : ""} found
          </p>
          <section className="mentor-startups-grid">
            {remainingFounders.map((founder) => renderFounderCard(founder))}
          </section>
        </>
      ) : (
        <section className="mentor-startups-empty">
          <div className="mentor-startups-empty-icon">
            <Search size={28} />
          </div>
          <h3>No other startups found</h3>
          <p>Try changing your search or filters.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </section>
      )}
    </div>
  );
}

export default MentorStartups;