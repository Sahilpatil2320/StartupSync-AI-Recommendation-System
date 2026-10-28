
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Filter,
  Lightbulb,
  MapPin,
  Search,
  UsersRound,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./FounderMentors.css";

const getToken = () => localStorage.getItem("startupsync_token");

const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.userId || payload.id || payload._id || payload.sub || "";
  } catch {
    return "";
  }
};

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const getName = (mentor) =>
  mentor.name ||
  mentor.fullName ||
  mentor.user?.name ||
  mentor.userId?.name ||
  mentor.mentor_name ||
  "Mentor";

const getExpertise = (mentor) => {
  const value =
    mentor.expertise ||
    mentor.mentoringAreas ||
    mentor.skills ||
    mentor.domain;

  return Array.isArray(value)
    ? value.join(", ")
    : value || "Expertise not specified";
};

const getIndustries = (mentor) =>
  [
    ...new Set([
      ...asArray(mentor.industries),
      ...asArray(mentor.industry),
      ...asArray(mentor.preferredDomains),
      ...asArray(mentor.domain),
    ]),
  ];

const getExperience = (mentor) => {
  const years = mentor.experienceYears ?? mentor.experience;

  if (years === undefined || years === null || years === "") {
    return "Not specified";
  }

  return typeof years === "number" ? `${years} years` : String(years);
};

const getMatchScore = (mentor) => {
  const raw =
    mentor._aiScore ??
    mentor.score_percentage ??
    mentor.scorePercentage ??
    mentor.matchPercentage ??
    mentor.match_percentage ??
    mentor.matchScore ??
    mentor.match_score ??
    mentor.similarity_score ??
    mentor.score ??
    mentor.similarity ??
    mentor.confidence ??
    mentor.match;

  if (raw === undefined || raw === null || raw === "") {
    return null;
  }

  const number = Number(raw);
  if (!Number.isFinite(number)) return null;

  const percentage = number >= 0 && number <= 1 ? number * 100 : number;

  return Math.max(0, Math.min(100, Number(percentage.toFixed(1))));
};

const getMentorId = (mentor) =>
  String(
    mentor.id ||
    mentor._id ||
    mentor.mentorId ||
    mentor.mentor_id ||
    mentor.userId?._id ||
    mentor.userId ||
    ""
  );

const getDatasetId = (mentor) =>
  String(
    mentor.mentor_id ||
    mentor.mentorId ||
    mentor.dataset_id ||
    mentor.datasetId ||
    mentor.id ||
    mentor._id ||
    ""
  );

const getSearchText = (mentor) =>
  [
    getName(mentor),
    getExpertise(mentor),
    mentor.location,
    mentor.availability,
    mentor.format,
    ...getIndustries(mentor),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

function FounderMentors() {
  const [mentors, setMentors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [formatFilter, setFormatFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const [requestedMentors, setRequestedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in again to view mentor profiles.");
      }

      const response = await api.get("/profiles/mentors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const records =
        response.data?.mentors ||
        response.data?.profiles ||
        response.data?.data?.mentors ||
        [];

      if (!Array.isArray(records)) {
        throw new Error("Unexpected response from the mentor API.");
      }

      setMentors(
        records.map((mentor) => ({
          ...mentor,
          id: getMentorId(mentor),
          name: getName(mentor),
          expertise: getExpertise(mentor),
          industries: getIndustries(mentor),
          experience: getExperience(mentor),
          location: mentor.location || "Location not provided",
          availability: mentor.availability || "Not specified",
          format:
            mentor.format ||
            mentor.mentoringFormat ||
            mentor.mentoringMode ||
            "Not specified",
          startups:
            mentor.startupsMentored ?? mentor.mentoredStartups ?? null,
          _datasetOnly: false,
        }))
      );
    } catch (err) {
      console.error("Unable to fetch mentor profiles:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load mentor profiles."
      );
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      setAiLoading(true);
      setAiError("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in again to view AI recommendations.");
      }

      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error("Could not identify your account from the login token.");
      }

      const response = await api.get(
        `/recommendations/founder/${encodeURIComponent(userId)}/mentors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const records =
        response.data?.data?.recommendations ||
        response.data?.recommendations ||
        [];

      if (!Array.isArray(records)) {
        throw new Error("Unexpected response from the recommendation API.");
      }

      // Keep the complete returned list. Only the top five are displayed
      // in the recommendation section; the remaining dataset records go below.
      setRecommendations(records);
    } catch (err) {
      console.error("Unable to fetch AI mentor recommendations:", err);
      setAiError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load AI mentor recommendations."
      );
      setRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
    fetchRecommendations();
  }, [fetchMentors, fetchRecommendations]);

  const linkedRecommendations = useMemo(() => {
    return recommendations.map((recommendation) => {
      const recommendationId = getDatasetId(recommendation);
      const recommendationName = getName(recommendation).trim().toLowerCase();

      const linked = mentors.find((mentor) => {
        const datasetMatches =
          recommendationId &&
          String(
            mentor.aiDatasetId ||
            mentor.datasetId ||
            mentor.dataset_id ||
            ""
          ) === recommendationId;

        const nameMatches =
          recommendationName &&
          getName(mentor).trim().toLowerCase() === recommendationName;

        return Boolean(datasetMatches || nameMatches);
      });

      if (linked) {
        return {
          ...linked,
          _aiScore: getMatchScore(recommendation),
          _datasetRecommendation: recommendation,
          _datasetOnly: false,
        };
      }

      return {
        ...recommendation,
        id: "",
        _id: "",
        mentorId: "",
        mentor_id: "",
        name: getName(recommendation),
        expertise: getExpertise(recommendation),
        industries: getIndustries(recommendation),
        location: recommendation.location || "Location not provided",
        experience: getExperience(recommendation),
        availability: recommendation.availability || "Not specified",
        format:
          recommendation.format ||
          recommendation.mentoringFormat ||
          recommendation.mentoringMode ||
          "Not specified",
        _datasetOnly: true,
        _aiScore: getMatchScore(recommendation),
      };
    });
  }, [recommendations, mentors]);

  const topFiveRecommendations = useMemo(
    () => linkedRecommendations.slice(0, 5),
    [linkedRecommendations]
  );

  const topRecommendedRegisteredIds = useMemo(
    () =>
      new Set(
        topFiveRecommendations
          .map(getMentorId)
          .filter(Boolean)
      ),
    [topFiveRecommendations]
  );

  const remainingDiscoveryMentors = useMemo(() => {
    // Registered mentors appear once. If a dataset recommendation matches
    // a registered profile, retain the registered profile in the lower list.
    const registeredRemaining = mentors
      .filter((mentor) => !topRecommendedRegisteredIds.has(getMentorId(mentor)))
      .map((mentor) => {
        const matchingRecommendation = linkedRecommendations.find(
          (recommendation) =>
            !recommendation._datasetOnly &&
            getMentorId(recommendation) === getMentorId(mentor)
        );

        return matchingRecommendation
          ? { ...mentor, _aiScore: matchingRecommendation._aiScore }
          : mentor;
      });

    const registeredIds = new Set(
      registeredRemaining.map(getMentorId).filter(Boolean)
    );

    const topDatasetIds = new Set(
      topFiveRecommendations
        .filter((mentor) => mentor._datasetOnly)
        .map(getDatasetId)
        .filter(Boolean)
    );

    const registeredNames = new Set(
      mentors.map((mentor) => getName(mentor).trim().toLowerCase())
    );

    const remainingDataset = linkedRecommendations
      .slice(5)
      .filter((mentor) => {
        if (!mentor._datasetOnly) return false;

        const datasetId = getDatasetId(mentor);
        const name = getName(mentor).trim().toLowerCase();

        if (datasetId && topDatasetIds.has(datasetId)) return false;
        if (name && registeredNames.has(name)) return false;

        return true;
      });

    // Keep the same discovery list and the same search/filter controls
    // for registered profiles and dataset-only profiles.
    const combined = [...registeredRemaining];

    remainingDataset.forEach((datasetMentor) => {
      const datasetId = getDatasetId(datasetMentor);
      const datasetName = getName(datasetMentor).trim().toLowerCase();

      const alreadyIncluded = combined.some((mentor) => {
        const sameId =
          datasetId &&
          getDatasetId(mentor) &&
          getDatasetId(mentor) === datasetId;

        const sameName =
          datasetName &&
          getName(mentor).trim().toLowerCase() === datasetName;

        return Boolean(sameId || sameName);
      });

      if (!alreadyIncluded) combined.push(datasetMentor);
    });

    const search = searchTerm.trim().toLowerCase();

    const filtered = combined.filter((mentor) => {
      const expertiseValues = asArray(mentor.expertise);
      const industries = getIndustries(mentor);

      return (
        (!search || getSearchText(mentor).includes(search)) &&
        (expertiseFilter === "All" ||
          expertiseValues.includes(expertiseFilter) ||
          mentor.expertise === expertiseFilter) &&
        (industryFilter === "All" ||
          industries.includes(industryFilter)) &&
        (formatFilter === "All" || mentor.format === formatFilter)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === "match") {
        return (getMatchScore(b) ?? -1) - (getMatchScore(a) ?? -1);
      }

      if (sortBy === "experience") {
        const yearsA = Number.parseFloat(a.experience) || 0;
        const yearsB = Number.parseFloat(b.experience) || 0;
        return yearsB - yearsA;
      }

      return getName(a).localeCompare(getName(b));
    });
  }, [
    mentors,
    linkedRecommendations,
    topFiveRecommendations,
    topRecommendedRegisteredIds,
    searchTerm,
    expertiseFilter,
    industryFilter,
    formatFilter,
    sortBy,
  ]);

  const allExpertise = useMemo(
    () =>
      [
        ...new Set(
          [...mentors, ...linkedRecommendations].flatMap((mentor) =>
            asArray(mentor.expertise)
          )
        ),
      ]
        .filter(Boolean)
        .sort(),
    [mentors, linkedRecommendations]
  );

  const allIndustries = useMemo(
    () =>
      [
        ...new Set(
          [...mentors, ...linkedRecommendations].flatMap(getIndustries)
        ),
      ]
        .filter(Boolean)
        .sort(),
    [mentors, linkedRecommendations]
  );

  const allFormats = useMemo(
    () =>
      [
        ...new Set(
          [...mentors, ...linkedRecommendations]
            .map(
              (mentor) =>
                mentor.format ||
                mentor.mentoringFormat ||
                mentor.mentoringMode ||
                "Not specified"
            )
            .filter((format) => format && format !== "Not specified")
        ),
      ].sort(),
    [mentors, linkedRecommendations]
  );

  const totalMentorCount = useMemo(() => {
    const registeredIds = new Set(
      mentors.map(getMentorId).filter(Boolean)
    );

    const registeredNames = new Set(
      mentors.map((mentor) => getName(mentor).trim().toLowerCase())
    );

    const datasetOnly = linkedRecommendations.filter((mentor) => {
      if (!mentor._datasetOnly) return false;

      const id = getDatasetId(mentor);
      const name = getName(mentor).trim().toLowerCase();

      return !(
        (id && registeredIds.has(id)) ||
        (name && registeredNames.has(name))
      );
    });

    const uniqueDataset = new Set(
      datasetOnly.map((mentor) => {
        const id = getDatasetId(mentor);
        return id ? `id:${id}` : `name:${getName(mentor).trim().toLowerCase()}`;
      })
    );

    return mentors.length + uniqueDataset.size;
  }, [mentors, linkedRecommendations]);

  const handleRequest = async (mentorId) => {
    if (!mentorId) {
      window.alert(
        "This dataset profile is not linked to a registered mentor account."
      );
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        setError("Please log in again before requesting mentorship.");
        return;
      }

      await api.post(
        `/connections/mentors/${encodeURIComponent(mentorId)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequestedMentors((current) =>
        current.includes(mentorId) ? current : [...current, mentorId]
      );

      window.alert("Mentorship request sent successfully!");
    } catch (err) {
      console.error("Unable to send mentorship request:", err);

      const message = err.response?.data?.message || err.message || "";

      if (
        err.response?.status === 409 ||
        /already exists|already sent|pending request/i.test(message)
      ) {
        setRequestedMentors((current) =>
          current.includes(mentorId) ? current : [...current, mentorId]
        );
        window.alert(
          "A mentorship request already exists. This mentor is marked as Request Sent."
        );
      } else {
        window.alert(
          message || "Could not send the mentorship request. Please try again."
        );
      }
    }
  };

  const openProfile = (mentor) => {
    window.alert(
      [
        getName(mentor),
        `Expertise: ${getExpertise(mentor)}`,
        `Industry: ${getIndustries(mentor).join(", ") || "Not specified"}`,
        `Location: ${mentor.location || "Not specified"}`,
        `Experience: ${getExperience(mentor)}`,
        `Availability: ${mentor.availability || "Not specified"}`,
        mentor.bio ? `\nAbout: ${mentor.bio}` : "",
        mentor._datasetOnly
          ? "\nThis is an AI dataset profile and is not linked to a registered account."
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  };

  const renderMentorCard = (mentor, isRecommended = false, index = 0) => {
    const mentorId = getMentorId(mentor);
    const name = getName(mentor);
    const industries = getIndustries(mentor);
    const match = getMatchScore(mentor);
    const requested = requestedMentors.includes(mentorId);

    return (
      <article
        className="founder-mentor-card"
        key={
          mentorId ||
          `${mentor._datasetOnly ? "dataset" : "mentor"}-${getDatasetId(mentor) || name}-${index}`
        }
      >
        <div className="founder-mentor-card-top">
          <div className="founder-mentor-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="founder-mentor-heading">
            <h4>{name}</h4>
            <span>{getExpertise(mentor)}</span>
          </div>

          <div className="founder-mentor-match">
            <strong>{match === null ? "—" : `${match}%`}</strong>
            <span>
              {isRecommended
                ? "AI match"
                : mentor._datasetOnly
                  ? "Dataset match"
                  : "Profile"}
            </span>
          </div>
        </div>

        <div className="founder-mentor-location">
          <MapPin size={14} />
          {mentor.location || "Location not provided"}
        </div>

        <div className="founder-mentor-details">
          <div>
            <span>Experience</span>
            <strong>{getExperience(mentor)}</strong>
          </div>
          <div>
            <span>Availability</span>
            <strong>{mentor.availability || "Not specified"}</strong>
          </div>
        </div>

        <div className="founder-mentor-industries">
          {industries.length ? (
            industries.slice(0, 5).map((industry) => (
              <span key={industry}>{industry}</span>
            ))
          ) : (
            <span>Industries not specified</span>
          )}
        </div>

        <div className="founder-mentor-network">
          <Award size={15} />
          <span>
            {mentor.startups === null || mentor.startups === undefined
              ? "Mentor profile"
              : `Mentored ${mentor.startups} startups`}
          </span>
        </div>

        <div className="founder-mentor-format">
          <Lightbulb size={14} />
          <span>{mentor.format || "Mentoring format not specified"}</span>
        </div>

        {mentor._datasetOnly && (
          <div className="founder-mentor-dataset-notice">
            AI dataset profile — not linked to a registered StartupSync account.
          </div>
        )}

        <div className="founder-mentor-actions">
          <button
            type="button"
            className="founder-mentor-view-button"
            onClick={() => openProfile(mentor)}
          >
            View Profile <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className={`founder-mentor-request-button ${requested ? "founder-mentor-requested" : ""
              }`}
            onClick={() => handleRequest(mentorId)}
            disabled={!mentorId || requested || mentor._datasetOnly}
            title={
              mentor._datasetOnly
                ? "This dataset entry is not linked to a registered mentor account."
                : undefined
            }
          >
            {requested ? (
              <>
                <CheckCircle2 size={15} /> Request Sent
              </>
            ) : mentor._datasetOnly ? (
              "No registered account"
            ) : (
              "Request Mentorship"
            )}
          </button>
        </div>
      </article>
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setExpertiseFilter("All");
    setIndustryFilter("All");
    setFormatFilter("All");
    setSortBy("name");
  };

  return (
    <div className="founder-mentors-page">
      <section className="founder-mentors-header">
        <div>
          <span className="founder-mentors-badge">Mentor Discovery</span>
          <h2>Find Mentors</h2>
          <p>
            Connect with experienced professionals who can guide your startup
            through important growth stages.
          </p>
        </div>

        <div className="founder-mentors-total-card">
          <span>Total Mentors</span>
          <strong>{totalMentorCount}</strong>
          <p>Registered + dataset profiles</p>
        </div>
      </section>

      <section className="founder-mentor-ai-section">
        <div className="founder-mentor-ai-heading">
          <div>
            <h3>Top 5 AI Recommendations</h3>
            <p>Suggested by the StartupSync AI recommendation engine</p>
          </div>

          <button
            type="button"
            className="founder-mentor-refresh-button"
            onClick={() => {
              fetchRecommendations();
              fetchMentors();
            }}
            disabled={aiLoading || loading}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {aiLoading ? (
          <div className="founder-mentors-empty">
            Loading AI mentor recommendations...
          </div>
        ) : aiError ? (
          <div className="founder-mentors-empty">
            <AlertCircle size={20} />
            <p>{aiError}</p>
            <button type="button" onClick={fetchRecommendations}>
              Try Again
            </button>
          </div>
        ) : topFiveRecommendations.length ? (
          <>
            <section className="founder-mentors-grid">
              {topFiveRecommendations.map((mentor, index) =>
                renderMentorCard(mentor, true, index)
              )}
            </section>

            <p className="founder-mentor-score-note">
              Match scores are ranking scores, not guarantees of a successful
              mentorship. Dataset profiles may not be linked to registered
              accounts.
            </p>
          </>
        ) : (
          <div className="founder-mentors-empty">
            No AI mentor recommendations are available for this account yet.
          </div>
        )}
      </section>

      <section className="founder-mentors-filters">
        <div className="founder-mentors-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search mentors, expertise or industries..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <h4 className="founder-mentors-filter-title">
          <Filter size={17} /> Filters and Sorting
        </h4>

        <div className="founder-mentors-filter-row">
          <div className="founder-mentors-filter">
            <Lightbulb size={15} />
            <select
              value={expertiseFilter}
              onChange={(event) => setExpertiseFilter(event.target.value)}
            >
              <option value="All">All Expertise</option>
              {allExpertise.map((expertise) => (
                <option key={expertise} value={expertise}>
                  {expertise}
                </option>
              ))}
            </select>
          </div>

          <div className="founder-mentors-filter">
            <Filter size={15} />
            <select
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value)}
            >
              <option value="All">All Industries</option>
              {allIndustries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div className="founder-mentors-filter">
            <UsersRound size={15} />
            <select
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
            >
              <option value="All">All Formats</option>
              {allFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          <div className="founder-mentors-filter">
            <Filter size={15} />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name">Sort: Name A–Z</option>
              <option value="match">Sort: Match score</option>
              <option value="experience">Sort: Experience</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="founder-mentor-refresh-button"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </section>

      <section className="founder-mentors-results-section">
        <div className="founder-mentors-results-header">
          <div>
            <h3>All Other Mentors</h3>
            <p>
              {loading
                ? "Loading mentor profiles..."
                : `${remainingDiscoveryMentors.length} mentors match your search and filters. Registered profiles and remaining AI dataset records are shown together.`}
            </p>
          </div>
        </div>

        {error && (
          <section className="founder-mentors-empty">
            <p>{error}</p>
            <button type="button" onClick={fetchMentors}>
              Retry
            </button>
          </section>
        )}

        {loading || aiLoading ? (
          <section className="founder-mentors-empty">
            Loading registered and dataset mentor profiles...
          </section>
        ) : remainingDiscoveryMentors.length ? (
          <section className="founder-mentors-grid">
            {remainingDiscoveryMentors.map((mentor, index) =>
              renderMentorCard(mentor, false, index)
            )}
          </section>
        ) : !error ? (
          <section className="founder-mentors-empty">
            <Search size={25} />
            <h3>No more mentors found</h3>
            <p>Try changing your search or filters.</p>
          </section>
        ) : null}
      </section>
    </div>
  );
}

export default FounderMentors;