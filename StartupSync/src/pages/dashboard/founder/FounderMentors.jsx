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
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getName = (mentor) =>
  mentor.name || mentor.fullName || mentor.user?.name ||
  mentor.userId?.name || mentor.mentor_name || "Mentor";

const getExpertise = (mentor) =>
  mentor.expertise || mentor.mentoringAreas || mentor.skills ||
  mentor.domain || "Expertise not specified";

const getIndustries = (mentor) =>
  [...new Set([
    ...asArray(mentor.industries),
    ...asArray(mentor.industry),
    ...asArray(mentor.preferredDomains),
    ...asArray(mentor.domain),
  ])];

const getExperience = (mentor) => {
  const years = mentor.experienceYears ?? mentor.experience;
  if (years === undefined || years === null || years === "") {
    return "Not specified";
  }
  return typeof years === "number" ? `${years} Years` : String(years);
};

const getMatchScore = (mentor) => {
  const raw =
    mentor.score_percentage ??
    mentor.matchPercentage ??
    mentor.match_percentage ??
    mentor.matchScore ??
    mentor.score ??
    mentor.similarity;

  if (raw === undefined || raw === null || raw === "") return null;

  const number = Number(raw);
  if (!Number.isFinite(number)) return null;

  const percentage = number >= 0 && number <= 1 ? number * 100 : number;
  return Math.max(0, Math.min(100, Number(percentage.toFixed(1))));
};

const getMentorId = (mentor) =>
  String(
    mentor.id || mentor._id || mentor.mentorId ||
    mentor.mentor_id || mentor.userId?._id || mentor.userId || ""
  );

function FounderMentors() {
  const [mentors, setMentors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [formatFilter, setFormatFilter] = useState("All");
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
      if (!token) throw new Error("Please log in again to view mentor profiles.");

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

      setMentors(records.map((mentor) => ({
        ...mentor,
        id: getMentorId(mentor),
        name: getName(mentor),
        expertise: getExpertise(mentor),
        industries: getIndustries(mentor),
        experience: getExperience(mentor),
        location: mentor.location || "Location not provided",
        availability: mentor.availability || "Not specified",
        format: mentor.format || mentor.mentoringFormat ||
          mentor.mentoringMode || "Not specified",
        startups: mentor.startupsMentored ?? mentor.mentoredStartups ?? null,
      })));
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
      if (!token) throw new Error("Please log in again to view AI recommendations.");

      const userId = getUserIdFromToken(token);
      if (!userId) throw new Error("Could not identify your account from the login token.");

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

      setRecommendations(records.slice(0, 5));
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

  const allExpertise = useMemo(
    () => [...new Set(mentors.flatMap((mentor) => asArray(mentor.expertise)))]
      .filter((value) => value && value !== "Expertise not specified")
      .sort(),
    [mentors]
  );

  const allIndustries = useMemo(
    () => [...new Set(mentors.flatMap((mentor) => mentor.industries || []))]
      .filter(Boolean)
      .sort(),
    [mentors]
  );

  const filteredMentors = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return mentors.filter((mentor) => {
      const searchableText = [
        mentor.name,
        mentor.expertise,
        mentor.location,
        ...mentor.industries,
      ].join(" ").toLowerCase();

      return (
        (!search || searchableText.includes(search)) &&
        (expertiseFilter === "All" ||
          asArray(mentor.expertise).includes(expertiseFilter) ||
          mentor.expertise === expertiseFilter) &&
        (industryFilter === "All" ||
          mentor.industries.includes(industryFilter)) &&
        (formatFilter === "All" || mentor.format === formatFilter)
      );
    });
  }, [mentors, searchTerm, expertiseFilter, industryFilter, formatFilter]);

  const recommendedIds = useMemo(
    () => new Set(recommendations.map(getMentorId).filter(Boolean)),
    [recommendations]
  );

  const remainingMentors = useMemo(
    () => filteredMentors.filter((mentor) => !recommendedIds.has(getMentorId(mentor))),
    [filteredMentors, recommendedIds]
  );

  const handleRequest = async (mentorId) => {
    if (!mentorId) {
      window.alert("This recommendation does not have a registered mentor account ID.");
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
      window.alert(
        err.response?.data?.message ||
        "Could not send the mentorship request. Please try again."
      );
    }
  };

  const openProfile = (mentor) => {
    window.alert([
      getName(mentor),
      `Expertise: ${getExpertise(mentor)}`,
      `Industry: ${getIndustries(mentor).join(", ") || "Not specified"}`,
      `Location: ${mentor.location || "Not specified"}`,
      `Experience: ${getExperience(mentor)}`,
      `Availability: ${mentor.availability || "Not specified"}`,
      mentor.bio ? `\nAbout: ${mentor.bio}` : "",
    ].filter(Boolean).join("\n"));
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
        key={mentorId || `${name}-${index}`}
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
            <span>{isRecommended ? "Relative match" : "Match"}</span>
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
          {industries.length ? industries.slice(0, 5).map((industry) => (
            <span key={industry}>{industry}</span>
          )) : <span>Industries not specified</span>}
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
            className={`founder-mentor-request-button ${requested ? "founder-mentor-requested" : ""}`}
            onClick={() => handleRequest(mentorId)}
            disabled={!mentorId || requested}
          >
            {requested ? (
              <><CheckCircle2 size={15} /> Request Sent</>
            ) : "Request Mentorship"}
          </button>
        </div>
      </article>
    );
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
            onClick={fetchRecommendations}
            disabled={aiLoading}
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
        ) : recommendations.length ? (
          <>
            <section className="founder-mentors-grid">
              {recommendations.map((mentor, index) =>
                renderMentorCard(mentor, true, index)
              )}
            </section>
            <p className="founder-mentor-score-note">
              Match scores are ranking scores, not guarantees of a successful
              mentorship. AI dataset records may differ from registered accounts.
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

        <div className="founder-mentors-filter-row">
          <div className="founder-mentors-filter">
            <Lightbulb size={15} />
            <select
              value={expertiseFilter}
              onChange={(event) => setExpertiseFilter(event.target.value)}
            >
              <option value="All">All Expertise</option>
              {allExpertise.map((expertise) => (
                <option key={expertise} value={expertise}>{expertise}</option>
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
                <option key={industry} value={industry}>{industry}</option>
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
              {[...new Set(mentors.map((mentor) => mentor.format))]
                .filter((format) => format && format !== "Not specified")
                .map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
            </select>
          </div>
        </div>
      </section>

      <div className="founder-mentors-results-header">
        <div>
          <h3>All Registered Mentors</h3>
          <p>
            {loading
              ? "Loading mentor profiles..."
              : `${remainingMentors.length} mentor${remainingMentors.length === 1 ? "" : "s"} found`}
          </p>
        </div>
      </div>

      {error && (
        <section className="founder-mentors-empty">
          <p>{error}</p>
          <button type="button" onClick={fetchMentors}>Retry</button>
        </section>
      )}

      {loading ? (
        <section className="founder-mentors-empty">
          Loading mentor profiles from the database...
        </section>
      ) : !error && remainingMentors.length ? (
        <section className="founder-mentors-grid">
          {remainingMentors.map((mentor, index) =>
            renderMentorCard(mentor, false, index)
          )}
        </section>
      ) : !error ? (
        <section className="founder-mentors-empty">
          <Search size={25} />
          <h3>No mentors found</h3>
          <p>Try changing your search or filter criteria.</p>
        </section>
      ) : null}
    </div>
  );
}

export default FounderMentors;
