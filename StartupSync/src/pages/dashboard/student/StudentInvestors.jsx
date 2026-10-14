import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { getRecommendations } from "../../../services/aiApi";
import "./StudentInvestors.css";

const API_BASE_URL = "http://localhost:5000/api";

const getInvestorId = (investor) =>
  String(
    investor._id ||
      investor.id ||
      investor.investorId ||
      investor.investor_id ||
      investor.userId?._id ||
      ""
  );

const getInvestorName = (investor) =>
  investor.name ||
  investor.fullName ||
  investor.user?.name ||
  investor.userId?.name ||
  investor.investor_name ||
  "Investor";

const getInvestorIndustries = (investor) => {
  const value =
    investor.industries ||
    investor.industry ||
    investor.preferredIndustries ||
    [];

  return Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
};

const getStages = (investor) => {
  const value =
    investor.investmentStages ||
    investor.stages ||
    investor.investmentStage ||
    investor.stage ||
    [];

  return (Array.isArray(value) ? value : [value]).filter(Boolean);
};

const getMatchPercentage = (investor) => {
  const raw =
    investor.score_percentage ??
    investor.matchPercentage ??
    investor.match_percentage ??
    investor.matchScore ??
    investor.score ??
    investor.similarity ??
    investor.match;

  if (raw === undefined || raw === null || raw === "") return null;

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return null;

  const percentage =
    numeric >= 0 && numeric <= 1 ? numeric * 100 : numeric;

  return Math.max(0, Math.min(100, Number(percentage.toFixed(1))));
};

const getRecommendationList = (response) => {
  const candidates = [
    response?.data?.recommendations,
    response?.recommendations,
    response?.data?.data?.recommendations,
    response?.data?.data,
    response?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

function StudentInvestors() {
  const [investors, setInvestors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);

  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [notice, setNotice] = useState("");

  const [requestedIds, setRequestedIds] = useState([]);
  const [requestingId, setRequestingId] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      throw new Error("Please log in again to view investors.");
    }

    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }, []);

  const loadInvestors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/profiles/investors`,
        getAuthConfig()
      );

      const records =
        response.data?.data?.investors ||
        response.data?.investors ||
        response.data?.profiles ||
        response.data?.data ||
        [];

      if (!Array.isArray(records)) {
        throw new Error("Unexpected response from the investor API.");
      }

      setInvestors(records);
    } catch (err) {
      console.error("Failed to load investors:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load investor profiles."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  const loadRecommendations = useCallback(async () => {
    setAiLoading(true);
    setAiError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in again to view AI recommendations.");
      }

      const tokenPayload = token.split(".")[1];

      if (!tokenPayload) {
        throw new Error("Your login token is invalid. Please log in again.");
      }

      const normalizedPayload = tokenPayload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const decodedPayload = JSON.parse(
        atob(normalizedPayload.padEnd(
          normalizedPayload.length + (4 - normalizedPayload.length % 4) % 4,
          "="
        ))
      );

      const userId =
        decodedPayload.userId ||
        decodedPayload.id ||
        decodedPayload._id ||
        decodedPayload.sub;

      if (!userId) {
        throw new Error("Could not identify your student account.");
      }

      // Uses the existing backend recommendation route:
      // /recommendations/:role/:sourceId/:target
      const response = await getRecommendations(
        "student",
        "investors",
        String(userId)
      );

      const list = getRecommendationList(response);

      setRecommendations(list.slice(0, 5));
    } catch (err) {
      console.error("AI investor recommendations failed:", err);

      setAiError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load AI investor recommendations."
      );

      setRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvestors();
    loadRecommendations();
  }, [loadInvestors, loadRecommendations]);

  const stages = useMemo(
    () =>
      [
        ...new Set(investors.flatMap(getStages)),
      ].sort(),
    [investors]
  );

  const industries = useMemo(
    () => [...new Set(investors.flatMap(getInvestorIndustries))].sort(),
    [investors]
  );

  const filteredInvestors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return investors.filter((investor) => {
      const name = getInvestorName(investor);
      const investorIndustries = getInvestorIndustries(investor);
      const investorStages = getStages(investor);

      const searchable = [
        name,
        investor.firmName,
        investor.organization,
        investor.location,
        investor.description,
        investor.bio,
        ...investorIndustries,
        ...investorStages,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (industryFilter === "All" ||
          investorIndustries.includes(industryFilter)) &&
        (stageFilter === "All" || investorStages.includes(stageFilter))
      );
    });
  }, [investors, searchTerm, industryFilter, stageFilter]);

  // Remove registered investors from the AI section when the same ID
  // appears in both lists. Recommendations with other IDs remain visible.
  const recommendedInvestorIds = useMemo(
    () => new Set(recommendations.map(getInvestorId).filter(Boolean)),
    [recommendations]
  );

  const remainingInvestors = useMemo(
    () =>
      filteredInvestors.filter(
        (investor) => !recommendedInvestorIds.has(getInvestorId(investor))
      ),
    [filteredInvestors, recommendedInvestorIds]
  );

  const requestConnection = async (investor) => {
    const id = getInvestorId(investor);

    if (!id) {
      setError("This investor has no valid account ID for connection requests.");
      return;
    }

    setRequestingId(id);
    setError("");
    setNotice("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/connections/investors/${encodeURIComponent(id)}`,
        {},
        getAuthConfig()
      );

      setRequestedIds((current) =>
        current.includes(id) ? current : [...current, id]
      );

      setNotice(response.data?.message || "Connection request sent.");
    } catch (err) {
      console.error("Connection request failed:", err);

      setError(
        err.response?.data?.message ||
          "Could not send the connection request. Please try again."
      );
    } finally {
      setRequestingId("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStageFilter("All");
    setIndustryFilter("All");
  };

  const renderInvestorCard = (investor, index, isRecommended = false) => {
    const id = getInvestorId(investor);
    const name = getInvestorName(investor);
    const investorIndustries = getInvestorIndustries(investor);
    const investorStages = getStages(investor);
    const match = getMatchPercentage(investor);

    const requested = requestedIds.includes(id);
    const isRequesting = requestingId === id;

    return (
      <article
        className={`student-investor-card ${
          isRecommended ? "student-investor-recommended-card" : ""
        }`}
        key={id || `${name}-${index}`}
      >
        {isRecommended && (
          <div className="student-investor-ai-badge">
            <Sparkles size={14} />
            AI Recommended
            {match !== null && (
              <span>{match}% match</span>
            )}
          </div>
        )}

        <div className="student-investor-card-top">
          <div className="student-investor-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="student-investor-identity">
            <h4>{name}</h4>
            <p>
              {investor.firmName ||
                investor.organization ||
                "Independent Investor"}
            </p>
          </div>
        </div>

        <div className="student-investor-location">
          <MapPin size={15} />
          <span>{investor.location || "Location not specified"}</span>
        </div>

        <p className="student-investor-description">
          {investor.description ||
            investor.bio ||
            "No investor description provided."}
        </p>

        <div className="student-investor-section">
          <span>Industries</span>
          <div className="student-investor-tags">
            {investorIndustries.length ? (
              investorIndustries.slice(0, 5).map((industry, tagIndex) => (
                <span key={`${industry}-${tagIndex}`}>{industry}</span>
              ))
            ) : (
              <small>Not specified</small>
            )}
          </div>
        </div>

        <div className="student-investor-section">
          <span>Investment Stages</span>
          <div className="student-investor-tags">
            {investorStages.length ? (
              investorStages.map((stage, stageIndex) => (
                <span key={`${stage}-${stageIndex}`}>{stage}</span>
              ))
            ) : (
              <small>Not specified</small>
            )}
          </div>
        </div>

        <div className="student-investor-card-footer">
          <span>
            {investor.investmentRange ||
              investor.ticketSize ||
              investor.investmentAmount ||
              "Investment range not specified"}
          </span>
        </div>

        <button
          type="button"
          className="student-investor-connect"
          disabled={!id || requested || isRequesting}
          onClick={() => requestConnection(investor)}
        >
          {requested ? (
            <>
              Request Sent <CheckCircle2 size={16} />
            </>
          ) : isRequesting ? (
            "Sending..."
          ) : (
            <>
              Connect <ArrowRight size={16} />
            </>
          )}
        </button>
      </article>
    );
  };

  return (
    <section className="student-investors-page">
      <header className="student-investors-header">
        <div>
          <span className="student-investors-badge">
            <Users size={15} /> Investor Network
          </span>

          <h2>Explore Investors</h2>

          <p>
            Discover investors, explore their interests, and connect with
            people who support innovation and entrepreneurship.
          </p>
        </div>

        <button
          type="button"
          className="student-investors-refresh"
          onClick={() => {
            loadInvestors();
            loadRecommendations();
          }}
          disabled={loading || aiLoading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="student-investors-summary">
        <div>
          <strong>{loading ? "—" : filteredInvestors.length}</strong>
          <span>Investors Found</span>
        </div>

        <div>
          <strong>{requestedIds.length}</strong>
          <span>Requests Sent</span>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={
            error
              ? "student-investors-message error"
              : "student-investors-message success"
          }
          role="status"
        >
          {error ? (
            <AlertCircle size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}

          <span>{error || notice}</span>

          {error && (
            <button type="button" onClick={loadInvestors}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      <section className="student-investor-ai-section">
        <div className="student-investor-ai-heading">
          <div>
            <h3>
              <Sparkles size={21} />
              Top 5 AI Recommended Investors
            </h3>
            <p>
              Investors suggested by the StartupSync recommendation API.
            </p>
          </div>

          <button
            type="button"
            className="student-investors-refresh"
            onClick={loadRecommendations}
            disabled={aiLoading}
          >
            <RefreshCw size={15} />
            Refresh AI
          </button>
        </div>

        {aiLoading ? (
          <div className="student-investors-empty">
            Loading AI recommendations...
          </div>
        ) : aiError ? (
          <div className="student-investors-empty">
            <AlertCircle size={25} />
            <h3>Recommendations unavailable</h3>
            <p>{aiError}</p>
            <button type="button" onClick={loadRecommendations}>
              Try Again
            </button>
          </div>
        ) : recommendations.length > 0 ? (
          <>
            <div className="student-investors-grid">
              {recommendations.map((investor, index) =>
                renderInvestorCard(investor, index, true)
              )}
            </div>

            <p className="student-investor-ai-note">
              Match percentages are shown only when provided by the API.
              Recommendations may come from a separate dataset; connection
              requests require a valid registered investor account ID.
            </p>
          </>
        ) : (
          <div className="student-investors-empty">
            <Sparkles size={25} />
            <h3>No AI recommendations returned</h3>
            <p>
              The recommendation endpoint returned no investor records for
              this account.
            </p>
          </div>
        )}
      </section>

      {/* Search and filters */}
      <div className="student-investors-filter-panel">
        <div className="student-investors-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search investors, firms, industries..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="student-investors-filters">
          <label>
            <Filter size={15} />
            <select
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value)}
            >
              <option value="All">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>

          <label>
            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
            >
              <option value="All">All Investment Stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="student-investors-clear"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="student-investors-results-heading">
        <div>
          <h3>All Registered Investors</h3>
          <p>Investor profiles returned by the StartupSync backend.</p>
        </div>

        <span>{remainingInvestors.length} results</span>
      </div>

      {loading ? (
        <div className="student-investors-empty">
          Loading investor profiles...
        </div>
      ) : error && investors.length === 0 ? (
        <div className="student-investors-empty">
          <AlertCircle size={25} />
          <h3>Unable to load investors</h3>
          <p>{error}</p>
          <button type="button" onClick={loadInvestors}>
            Try Again
          </button>
        </div>
      ) : remainingInvestors.length > 0 ? (
        <div className="student-investors-grid">
          {remainingInvestors.map((investor, index) =>
            renderInvestorCard(investor, index, false)
          )}
        </div>
      ) : (
        <div className="student-investors-empty">
          <Search size={28} />
          <h3>No additional investors found</h3>
          <p>
            {investors.length
              ? "Try changing your search or filters."
              : "Investor profiles will appear here when available."}
          </p>

          {investors.length > 0 && (
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default StudentInvestors;
