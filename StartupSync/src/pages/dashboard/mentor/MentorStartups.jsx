// File: StartupSync/src/pages/dashboard/mentor/MentorStartups.jsx

import {
  Bookmark,
  Check,
  ExternalLink,
  Filter,
  MapPin,
  Rocket,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { getRecommendations } from "../../../services/aiApi";
import "./MentorStartups.css";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getUserIdFromToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));

    return String(
      decoded.userId || decoded.id || decoded._id || decoded.sub || ""
    );
  } catch {
    return "";
  }
};

const getProfileId = (profile) =>
  String(
    profile?._id ||
      profile?.id ||
      profile?.profileId ||
      profile?.profile_id ||
      profile?.founderId ||
      profile?.founder_id ||
      ""
  );

const getUserId = (profile) => {
  const value = profile?.userId || profile?.user || profile?.user_id;

  if (value && typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value || "");
};

const getName = (profile) =>
  profile?.startupName ||
  profile?.companyName ||
  profile?.startup_name ||
  profile?.founder_name ||
  profile?.founderName ||
  profile?.fullName ||
  profile?.name ||
  profile?.founder?.startupName ||
  profile?.founder?.name ||
  profile?.userId?.name ||
  profile?.user?.name ||
  "Startup";

const getIndustry = (profile) =>
  profile?.industry || profile?.domain || profile?.sector || "";

const getStage = (profile) =>
  profile?.fundingStage ||
  profile?.startupStage ||
  profile?.startup_stage ||
  profile?.businessStage ||
  profile?.stage ||
  "";

const getLocation = (profile) => {
  if (typeof profile?.location === "string") {
    return profile.location;
  }

  if (profile?.location && typeof profile.location === "object") {
    return [
      profile.location.city,
      profile.location.state,
      profile.location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return [
    profile?.city,
    profile?.state,
    profile?.country,
    profile?.headquarters,
  ]
    .filter(Boolean)
    .join(", ");
};

const getDescription = (profile) =>
  profile?.tagline ||
  profile?.description ||
  profile?.startupDescription ||
  profile?.startup_description ||
  profile?.businessDescription ||
  profile?.companyDescription ||
  profile?.overview ||
  "No startup description provided.";

const getTeamSize = (profile) =>
  profile?.teamSize ??
  profile?.team_size ??
  profile?.numberOfEmployees ??
  profile?.employees ??
  "";

const getFounded = (profile) =>
  profile?.foundedYear ||
  profile?.founded_year ||
  profile?.yearFounded ||
  profile?.founded ||
  "";

const getNeeds = (profile) => {
  const values =
    profile?.mentoringNeeds ||
    profile?.mentorshipNeeds ||
    profile?.mentoring_needs ||
    profile?.lookingFor ||
    profile?.needs ||
    profile?.supportRequired ||
    profile?.areasOfSupport ||
    profile?.expertiseNeeded ||
    [];

  if (Array.isArray(values)) {
    return values
      .map((item) =>
        typeof item === "string" ? item : item?.name || item?.label || ""
      )
      .filter(Boolean);
  }

  if (typeof values === "string") {
    return values
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getRecommendationItems = (response) => {
  const root = response?.data;

  const candidates = [
    root?.data?.recommendations,
    root?.data?.founders,
    root?.data?.startups,
    root?.data?.results,
    root?.recommendations,
    root?.founders,
    root?.startups,
    root?.results,
    root?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getRecommendationId = (item) =>
  String(
    item?.founderId ||
      item?.founder_id ||
      item?.profileId ||
      item?.profile_id ||
      item?.userId ||
      item?.user_id ||
      item?.aiDatasetId ||
      item?.datasetId ||
      item?._id ||
      item?.id ||
      ""
  );

const getRecommendationName = (item) =>
  item?.startupName ||
  item?.companyName ||
  item?.startup_name ||
  item?.founder_name ||
  item?.founderName ||
  item?.name ||
  item?.founder?.startupName ||
  item?.founder?.name ||
  "";

const getRecommendationScore = (item) => {
  const raw =
    item?._aiScore ??
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

  if (raw === undefined || raw === null || raw === "") {
    return null;
  }

  const score = Number(raw);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.round(
    Math.max(0, Math.min(100, score >= 0 && score <= 1 ? score * 100 : score))
  );
};

const getStableKey = (profile) => {
  const id =
    profile?._recommendationId ||
    profile?.aiDatasetId ||
    profile?.datasetId ||
    getProfileId(profile);

  if (id) {
    return `id:${String(id)}`;
  }

  return [
    getName(profile),
    getIndustry(profile),
    getLocation(profile),
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
};

const deduplicateProfiles = (profiles) => {
  const seenIds = new Set();
  const seenNames = new Set();

  return profiles.filter((profile) => {
    const id = getStableKey(profile);
    const name = getName(profile).trim().toLowerCase();
    const nameKey = name ? `${name}|${getIndustry(profile).toLowerCase()}` : "";

    if (id && seenIds.has(id)) {
      return false;
    }

    if (nameKey && seenNames.has(nameKey)) {
      return false;
    }

    if (id) {
      seenIds.add(id);
    }

    if (nameKey) {
      seenNames.add(nameKey);
    }

    return true;
  });
};

/*
 * Match an AI dataset record with a registered founder when identifiers or
 * names provide a reasonable match. The dataset record remains available even
 * when no registered account matches it.
 */
const matchRegisteredFounder = (record, founders) => {
  const recommendationIds = [
    getRecommendationId(record),
    String(record?.aiDatasetId || ""),
    String(record?.datasetId || ""),
    String(record?.founder?._id || ""),
    String(record?.founder?.id || ""),
  ].filter(Boolean);

  const recommendationName = getRecommendationName(record)
    .trim()
    .toLowerCase();

  return (
    founders.find((founder) => {
      const founderIds = [
        getProfileId(founder),
        getUserId(founder),
        String(founder?.aiDatasetId || ""),
        String(founder?.datasetId || ""),
      ].filter(Boolean);

      const idMatches = recommendationIds.some((id) =>
        founderIds.includes(id)
      );

      const nameMatches =
        recommendationName &&
        getName(founder).trim().toLowerCase() === recommendationName;

      return idMatches || nameMatches;
    }) || null
  );
};

const normalizeRecommendation = (record, founders) => {
  const nestedRecord =
    record?.founder || record?.startup || record?.profile || record;

  const registeredFounder = matchRegisteredFounder(record, founders);

  return {
    ...nestedRecord,
    _recommendationId: getRecommendationId(record),
    _aiScore: getRecommendationScore(record),
    _isRegistered: Boolean(registeredFounder),
    _registeredProfile: registeredFounder,
    _sourceRecord: record,
  };
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

function MentorStartups() {
  const navigate = useNavigate();

  const [founders, setFounders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [stage, setStage] = useState("All Stages");
  const [need, setNeed] = useState("All Needs");
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("name");

  const [savedStartups, setSavedStartups] = useState([]);
  const [requestedStartups, setRequestedStartups] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [requestingId, setRequestingId] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  /* ----------------------------- Load founders ---------------------------- */

  const fetchFounders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again to view founder profiles.");
      }

      const response = await api.get("/profiles/founders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const root = response?.data;

      const records =
        root?.founders ||
        root?.profiles ||
        root?.data?.founders ||
        root?.data?.profiles ||
        root?.data;

      if (!Array.isArray(records)) {
        throw new Error(
          "The founder profiles API returned an unexpected response."
        );
      }

      setFounders(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load registered founder profiles."
      );
      setFounders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* --------------------------- Load AI results --------------------------- */

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

      const response = await getRecommendations(
        "mentor",
        "founders",
        userId
      );

      const records = getRecommendationItems(response);

      if (!records.length) {
        setRecommendations([]);
        setAiError(
          "The recommendation service returned no records. Check the AI API response and dataset endpoint."
        );
        return;
      }

      // Keep the full returned result list.
      // Only the first five are displayed in the recommendation section.
      setRecommendations(records);
    } catch (err) {
      setRecommendations([]);
      setAiError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load AI recommendations."
      );
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFounders();
    fetchRecommendations();
  }, [fetchFounders, fetchRecommendations]);

  /* ----------------------- Prepare recommendation list ------------------- */

  const normalizedRecommendations = useMemo(
    () =>
      recommendations.map((record) =>
        normalizeRecommendation(record, founders)
      ),
    [recommendations, founders]
  );

  const recommendedStartups = useMemo(
    () => deduplicateProfiles(normalizedRecommendations).slice(0, 5),
    [normalizedRecommendations]
  );

  const recommendedKeys = useMemo(
    () => new Set(recommendedStartups.map(getStableKey)),
    [recommendedStartups]
  );

  /*
   * Remaining list:
   * 1. Recommendations after the first five.
   * 2. Registered founder profiles.
   * 3. Remove duplicates already displayed in the first five.
   */
  const allRemainingProfiles = useMemo(() => {
    const extraRecommendations = normalizedRecommendations.slice(5);

    const registeredProfiles = founders.map((founder) => ({
      ...founder,
      _isRegistered: true,
      _registeredProfile: founder,
      _aiScore: null,
    }));

    const combined = deduplicateProfiles([
      ...extraRecommendations,
      ...registeredProfiles,
    ]);

    return combined.filter(
      (profile) => !recommendedKeys.has(getStableKey(profile))
    );
  }, [normalizedRecommendations, founders, recommendedKeys]);

  /* ------------------------------ Filters -------------------------------- */

  const industries = useMemo(
    () => [
      "All Industries",
      ...new Set(
        [...recommendedStartups, ...allRemainingProfiles]
          .map(getIndustry)
          .filter(Boolean)
      ),
    ],
    [recommendedStartups, allRemainingProfiles]
  );

  const stages = useMemo(
    () => [
      "All Stages",
      ...new Set(
        [...recommendedStartups, ...allRemainingProfiles]
          .map(getStage)
          .filter(Boolean)
      ),
    ],
    [recommendedStartups, allRemainingProfiles]
  );

  const needs = useMemo(
    () => [
      "All Needs",
      ...new Set(
        [...recommendedStartups, ...allRemainingProfiles].flatMap(getNeeds)
      ),
    ],
    [recommendedStartups, allRemainingProfiles]
  );

  const locations = useMemo(
    () => [
      "All Locations",
      ...new Set(
        [...recommendedStartups, ...allRemainingProfiles]
          .map(getLocation)
          .filter(Boolean)
          .map((value) => value.split(",").pop().trim())
      ),
    ],
    [recommendedStartups, allRemainingProfiles]
  );

  const remainingStartups = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = allRemainingProfiles.filter((startup) => {
      const searchableText = [
        getName(startup),
        getIndustry(startup),
        getStage(startup),
        getLocation(startup),
        getDescription(startup),
        ...getNeeds(startup),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);

      const matchesIndustry =
        industry === "All Industries" || getIndustry(startup) === industry;

      const matchesStage =
        stage === "All Stages" || getStage(startup) === stage;

      const matchesNeed =
        need === "All Needs" || getNeeds(startup).includes(need);

      const matchesLocation =
        location === "All Locations" ||
        getLocation(startup).toLowerCase().includes(location.toLowerCase());

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesStage &&
        matchesNeed &&
        matchesLocation
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return getName(a).localeCompare(getName(b));
      }

      if (sortBy === "industry") {
        return getIndustry(a).localeCompare(getIndustry(b));
      }

      if (sortBy === "stage") {
        return getStage(a).localeCompare(getStage(b));
      }

      if (sortBy === "location") {
        return getLocation(a).localeCompare(getLocation(b));
      }

      if (sortBy === "newest") {
        return Number(getFounded(b) || 0) - Number(getFounded(a) || 0);
      }

      return 0;
    });
  }, [
    allRemainingProfiles,
    searchTerm,
    industry,
    stage,
    need,
    location,
    sortBy,
  ]);

  /* ------------------------------- Actions ------------------------------- */

  const toggleSaved = (profile) => {
    const key = getStableKey(profile);

    setSavedStartups((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  /*
   * Reuses the shared PublicProfile.jsx.
   * PublicProfile reads the selected record from location.state.profile.
   */
  const viewProfile = (profile) => {
    const selectedProfile = profile._registeredProfile
      ? {
          ...profile,
          ...profile._registeredProfile,
          _aiScore: profile._aiScore,
        }
      : profile;

    const profileId =
      getProfileId(selectedProfile) ||
      profile._recommendationId ||
      getStableKey(selectedProfile);

    navigate(
      `/dashboard/mentor/profile-view/founder/${encodeURIComponent(profileId)}`,
      {
        state: {
          profile: selectedProfile,
        },
      }
    );
  };

  const requestMentorship = async (profile) => {
    const registeredProfile = profile._registeredProfile;
    const targetId = getProfileId(registeredProfile || profile);

    if (!profile._isRegistered || !registeredProfile) {
      window.alert(
        "This startup is a dataset-only record. You can view its profile, but a mentorship request requires a registered founder account."
      );
      return;
    }

    if (!targetId || requestingId) return;

    if (requestedStartups[targetId]) return;

    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      window.alert("Please log in again to send a mentorship request.");
      return;
    }

    try {
      setRequestingId(targetId);

      const response = await api.post(
        `/connections/founders/${encodeURIComponent(targetId)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const request =
        response?.data?.connection ||
        response?.data?.data ||
        response?.data;

      setRequestedStartups((current) => ({
        ...current,
        [targetId]: {
          requestId: request?._id || request?.id || "",
          status: "pending",
        },
      }));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to send the mentorship request.";

      if (
        err.response?.status === 409 ||
        /already exists|already sent|pending request/i.test(message)
      ) {
        setRequestedStartups((current) => ({
          ...current,
          [targetId]: {
            requestId: "",
            status: "pending",
          },
        }));
      } else {
        window.alert(message);
      }
    } finally {
      setRequestingId("");
    }
  };

  /*
   * Cancellation calls the existing backend route if it supports DELETE
   * /connections/:requestId. Backend support must exist for cancellation.
   */
  const cancelMentorshipRequest = async (profile) => {
    const registeredProfile = profile._registeredProfile;
    const targetId = getProfileId(registeredProfile || profile);
    const request = requestedStartups[targetId];

    if (!targetId || !request || cancellingId) return;

    if (!request.requestId) {
      window.alert(
        "The request ID is unavailable. Refresh and reload request status before cancelling."
      );
      return;
    }

    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      window.alert("Please log in again.");
      return;
    }

    try {
      setCancellingId(targetId);

      await api.delete(`/connections/${encodeURIComponent(request.requestId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequestedStartups((current) => {
        const updated = { ...current };
        delete updated[targetId];
        return updated;
      });
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Unable to cancel the request. Confirm that the backend supports DELETE /connections/:requestId."
      );
    } finally {
      setCancellingId("");
    }
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
    Boolean(searchTerm) ||
    industry !== "All Industries" ||
    stage !== "All Stages" ||
    need !== "All Needs" ||
    location !== "All Locations" ||
    sortBy !== "name";

  /* ------------------------------ Card UI -------------------------------- */

  const renderStartupCard = (startup, recommended = false) => {
    const stableKey = getStableKey(startup);
    const isSaved = savedStartups.includes(stableKey);

    const registeredProfile = startup._registeredProfile;
    const targetId = getProfileId(registeredProfile || startup);

    const request = targetId ? requestedStartups[targetId] : null;
    const isRequested = Boolean(request);
    const isRequesting = requestingId === targetId;
    const isCancelling = cancellingId === targetId;

    const score = startup._aiScore;
    const mentoringNeeds = getNeeds(startup);

    return (
      <article className="mentor-startup-card" key={stableKey}>
        <div className="mentor-startup-card-top">
          <div className="mentor-startup-logo">
            {getName(startup).charAt(0).toUpperCase()}
          </div>

          {recommended ? (
            <div className="mentor-startup-match">
              {score !== null && score !== undefined
                ? `${score}% AI Match`
                : "AI Recommended"}
            </div>
          ) : (
            <div
              className="mentor-startup-match mentor-startup-other-badge"
            >
              {startup._isRegistered ? "Registered" : "Dataset Profile"}
            </div>
          )}
        </div>

        <div className="mentor-startup-main">
          <h3>{getName(startup)}</h3>

          <p className="mentor-startup-tagline">
            {getDescription(startup)}
          </p>

          <div className="mentor-startup-meta">
            <span>{getIndustry(startup) || "Industry not specified"}</span>
            <span>{getStage(startup) || "Stage not specified"}</span>
          </div>

          <div className="mentor-startup-location">
            <MapPin size={15} />
            {getLocation(startup) || "Location not provided"}
          </div>

          <p className="mentor-startup-description">
            {getDescription(startup)}
          </p>

          <div className="mentor-startup-needs">
            <h4>Looking for mentorship in</h4>

            <div className="mentor-startup-tags">
              {mentoringNeeds.length > 0 ? (
                mentoringNeeds.map((item) => (
                  <span key={item}>{item}</span>
                ))
              ) : (
                <span>Needs not specified</span>
              )}
            </div>
          </div>

          <div className="mentor-startup-details">
            <div>
              <UsersRound size={16} />
              <span>
                {getTeamSize(startup)
                  ? `${getTeamSize(startup)} team members`
                  : "Team size not provided"}
              </span>
            </div>

            <div>
              <span className="mentor-startup-detail-dot" />
              <span>
                {getFounded(startup)
                  ? `Founded ${getFounded(startup)}`
                  : "Founded year not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="mentor-startup-actions">
          <button
            type="button"
            className={`mentor-startup-save ${isSaved ? "saved" : ""}`}
            onClick={() => toggleSaved(startup)}
            aria-label={isSaved ? "Remove saved startup" : "Save startup"}
            title={isSaved ? "Remove saved startup" : "Save startup"}
          >
            <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            className="mentor-startup-view"
            onClick={() => viewProfile(startup)}
          >
            <ExternalLink size={14} />
            View Profile
          </button>

          {isRequested ? (
            <div className="mentor-startup-request-actions">
              <button
                type="button"
                className="mentor-startup-request requested"
                disabled
              >
                <Check size={16} />
                Request Sent
              </button>

              {request?.requestId && (
                <button
                  type="button"
                  className="mentor-startup-cancel"
                  title="Cancel mentorship request"
                  aria-label="Cancel mentorship request"
                  disabled={isCancelling}
                  onClick={() => cancelMentorshipRequest(startup)}
                >
                  {isCancelling ? "…" : <X size={16} />}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="mentor-startup-request"
              disabled={!startup._isRegistered || isRequesting}
              title={
                startup._isRegistered
                  ? "Offer mentorship"
                  : "Dataset-only profiles cannot receive requests"
              }
              onClick={() => requestMentorship(startup)}
            >
              {isRequesting
                ? "Sending..."
                : startup._isRegistered
                  ? "Offer Mentorship"
                  : "Dataset Profile"}
            </button>
          )}
        </div>
      </article>
    );
  };

  /* -------------------------------- Render ------------------------------- */

  return (
    <div className="mentor-startups-page">
      <section className="mentor-startups-header">
        <div>
          <span className="mentor-startups-badge">
            AI-Powered Discovery
          </span>

          <h2>Discover Startups</h2>

          <p>
            Discover AI-recommended startups, explore available founder
            profiles, and connect with registered founders who need mentorship.
          </p>
        </div>

        <div className="mentor-startups-summary">
          <strong>
            {founders.length + recommendations.length}
          </strong>
          <span>Available Records</span>
        </div>
      </section>

      {/* Top five AI recommendations */}

      <section className="mentor-startups-section-heading">
        <div>
          <h3>Top 5 AI Recommendations</h3>
          <p>
            Your highest-ranked startup recommendations appear first.
          </p>
        </div>

        <button
          type="button"
          className="mentor-startups-refresh"
          onClick={fetchRecommendations}
          disabled={aiLoading}
        >
          {aiLoading ? "Loading..." : "Refresh Recommendations"}
        </button>
      </section>

      {aiLoading ? (
        <section className="mentor-startups-empty">
          <p>Loading AI recommendations...</p>
        </section>
      ) : recommendedStartups.length > 0 ? (
        <section className="mentor-startups-grid">
          {recommendedStartups.map((startup) =>
            renderStartupCard(startup, true)
          )}
        </section>
      ) : (
        <section className="mentor-startups-empty">
          <div className="mentor-startups-empty-icon">
            <Rocket size={28} />
          </div>

          <h3>No AI recommendations available</h3>

          <p>
            {aiError ||
              "The recommendation service returned no startup records."}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchRecommendations}
          >
            Try Again
          </button>
        </section>
      )}

      {/* All other dataset and registered records */}

      <section className="mentor-startups-section-heading mentor-startups-all-heading">
        <div>
          <h3>Explore All Other Startups</h3>
          <p>
            Browse remaining AI dataset records and registered profiles.
            Profiles already displayed above are excluded.
          </p>
        </div>
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
          aria-label="Filter by industry"
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
          aria-label="Filter by startup stage"
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
          aria-label="Filter by mentoring need"
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
          aria-label="Filter by location"
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
      ) : error && founders.length === 0 && recommendations.length === 0 ? (
        <section className="mentor-startups-empty">
          <h3>Unable to load startup profiles</h3>
          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchFounders}
          >
            Retry
          </button>
        </section>
      ) : remainingStartups.length > 0 ? (
        <>
          <p className="mentor-startups-results-count">
            {remainingStartups.length} other profile
            {remainingStartups.length === 1 ? "" : "s"} found
          </p>

          <section className="mentor-startups-grid">
            {remainingStartups.map((startup) =>
              renderStartupCard(startup)
            )}
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