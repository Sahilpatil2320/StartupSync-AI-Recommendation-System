
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
  const root = response?.data;

  const candidates = [
    root?.data?.recommendations,
    root?.data?.founders,
    root?.data?.results,
    root?.recommendations,
    root?.founders,
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

    return Math.round(Math.max(0, Math.min(100, score >= 0 && score <= 1 ? score * 100 : score)));
};

function MentorStartups() {
  const [founders, setFounders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [stage, setStage] = useState("All Stages");
  const [need, setNeed] = useState("All Needs");
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("name");
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

      const response = await getRecommendations("mentor", "founders", userId);
      const records = getRecommendationItems(response);

      setRecommendations(records.slice(0, 5));
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

  const recommendedFounders = useMemo(() => {
    const matched = recommendations
      .map((recommendation) => {
        const recommendationId = getRecommendationId(recommendation);
        const recommendationName = getRecommendationName(recommendation)
          .trim()
          .toLowerCase();

        const founder = founders.find((item) => {
          const profileId = getProfileId(item);
          const linkedUserId =
            typeof item.userId === "object"
              ? String(item.userId?._id || item.userId?.id || "")
              : String(item.userId || "");

          const candidateDatasetId = String(item.aiDatasetId || "");
          const idMatches =
            recommendationId &&
            [profileId, linkedUserId, candidateDatasetId].some(
              (id) => id && id === recommendationId
            );

          const nameMatches =
            recommendationName &&
            getName(item).trim().toLowerCase() === recommendationName;

          return idMatches || nameMatches;
        });

        if (!founder) return null;

        return {
          ...founder,
          _aiScore: getRecommendationScore(recommendation),
        };
      })
      .filter(Boolean);

    return matched.filter(
      (founder, index) =>
        matched.findIndex(
          (item) => getProfileId(item) === getProfileId(founder)
        ) === index
    );
  }, [founders, recommendations]);

  const recommendedIds = useMemo(
    () => new Set(recommendedFounders.map(getProfileId)),
    [recommendedFounders]
  );

  const remainingFounders = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    const filtered = founders.filter((founder) => {
      if (recommendedIds.has(getProfileId(founder))) return false;

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
    founders,
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
      <article className="mentor-startup-card" key={id || getName(founder)}>
        <div className="mentor-startup-card-top">
          <div className="mentor-startup-logo">
            {getName(founder).charAt(0).toUpperCase()}
          </div>

          {recommended && (
            <div className="mentor-startup-match">
              {score !== null && score !== undefined
                ? `${score}% AI Match`
                : "AI Recommended"}
            </div>
          )}
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
            disabled={isRequested || requestingId === id}
            onClick={() => requestMentorship(founder)}
          >
            {isRequested ? (
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
          <strong>{founders.length}</strong>
          <span>Registered Startups</span>
        </div>
      </section>

      <section style={{ margin: "24px 0 14px" }}>
        <h3>Top 5 AI Recommendations</h3>
        <p>Founders recommended for your mentor profile.</p>
      </section>

      {aiLoading ? (
        <section className="mentor-startups-empty">
          <p>Loading AI recommendations...</p>
        </section>
      ) : aiError ? (
        <section className="mentor-startups-empty">
          <h3>Recommendations unavailable</h3>
          <p>{aiError}</p>
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
          <h3>No matched AI recommendations</h3>
          <p>
            The AI response did not match registered founder profiles. Check
            that the founder dataset IDs are linked to profiles in the database.
          </p>
        </section>
      )}

      <section style={{ margin: "32px 0 14px" }}>
        <h3>Explore All Other Startups</h3>
        <p>Search, filter, and sort the remaining registered founder profiles.</p>
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