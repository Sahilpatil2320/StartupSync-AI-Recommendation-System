import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Filter,
  MapPin,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./StudentOpportunities.css";

const API_BASE_URL = "http://localhost:5000/api";

const categories = [
  "All Categories",
  "Technology",
  "Entrepreneurship",
  "Artificial Intelligence",
  "Innovation",
  "Software Development",
  "Education",
];

const types = [
  "All Types",
  "Hackathon",
  "Workshop",
  "Competition",
  "Event",
  "Program",
  "Scholarship",
  "Internship",
  "Job",
  "Other",
];

const modes = ["All Modes", "Online", "Hybrid", "On-site"];

const formatDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getOpportunityId = (opportunity) =>
  String(opportunity._id || opportunity.id);

function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [notice, setNotice] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      throw new Error("Please log in again to access opportunities.");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const config = getAuthConfig();
      const response = await axios.get(
        `${API_BASE_URL}/opportunities`,
        config
      );

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error("Unexpected response from the opportunities API.");
      }

      setOpportunities(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load opportunities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const filteredOpportunities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const tags = Array.isArray(opportunity.tags) ? opportunity.tags : [];
      const organizer =
        typeof opportunity.organizer === "string"
          ? opportunity.organizer
          : opportunity.createdBy?.name || "Unknown organizer";

      const category = opportunity.category || "";
      const type = opportunity.type || "";
      const mode = opportunity.mode || "";

      const matchesSearch =
        !search ||
        (opportunity.title || "").toLowerCase().includes(search) ||
        organizer.toLowerCase().includes(search) ||
        category.toLowerCase().includes(search) ||
        type.toLowerCase().includes(search) ||
        tags.some((tag) => String(tag).toLowerCase().includes(search));

      const matchesCategory =
        categoryFilter === "All Categories" ||
        category === categoryFilter;

      const matchesType =
        typeFilter === "All Types" || type === typeFilter;

      const matchesMode =
        modeFilter === "All Modes" || mode === modeFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesMode
      );
    });
  }, [
    opportunities,
    searchTerm,
    categoryFilter,
    typeFilter,
    modeFilter,
  ]);

  const savedCount = opportunities.filter((item) => item.saved).length;
  const registeredCount = opportunities.filter(
    (item) => item.registered
  ).length;

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setTypeFilter("All Types");
    setModeFilter("All Modes");
  };

  const performAction = async (opportunity, action) => {
    const id = getOpportunityId(opportunity);
    const actionKey = `${id}-${action}`;

    setActionLoading((current) => ({ ...current, [actionKey]: true }));
    setNotice("");
    setError("");

    try {
      const config = getAuthConfig();
      const response = await axios.post(
        `${API_BASE_URL}/opportunities/${encodeURIComponent(id)}/${action}`,
        {},
        config
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Action failed.");
      }

      if (action === "save") {
        const saved = Boolean(response.data.saved);

        setOpportunities((current) =>
          current.map((item) =>
            getOpportunityId(item) === id
              ? { ...item, saved }
              : item
          )
        );

        setSelectedOpportunity((current) =>
          current && getOpportunityId(current) === id
            ? { ...current, saved }
            : current
        );
      }

      if (action === "register") {
        setOpportunities((current) =>
          current.map((item) =>
            getOpportunityId(item) === id
              ? { ...item, registered: true }
              : item
          )
        );

        setSelectedOpportunity((current) =>
          current && getOpportunityId(current) === id
            ? { ...current, registered: true }
            : current
        );
      }

      setNotice(
        response.data.message ||
          (action === "save"
            ? "Saved status updated."
            : "Registration submitted.")
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "The action could not be completed."
      );
    } finally {
      setActionLoading((current) => ({
        ...current,
        [actionKey]: false,
      }));
    }
  };

  const getOrganizer = (opportunity) =>
    opportunity.organizer ||
    opportunity.createdBy?.name ||
    "Unknown organizer";

  const getParticipants = (opportunity) =>
    opportunity.participants || "Not specified";

  const getDuration = (opportunity) =>
    opportunity.duration || "Not specified";

  const getLocation = (opportunity) =>
    opportunity.location || opportunity.mode || "Not specified";

  const getDate = (opportunity) => formatDate(opportunity.date);

  const getPosted = (opportunity) =>
    opportunity.createdAt ? formatDate(opportunity.createdAt) : "Not specified";

  const renderOpportunityCard = (opportunity) => {
    const id = getOpportunityId(opportunity);
    const isSaved = Boolean(opportunity.saved);
    const isRegistered = Boolean(opportunity.registered);
    const saving = Boolean(actionLoading[`${id}-save`]);
    const registering = Boolean(actionLoading[`${id}-register`]);
    const tags = Array.isArray(opportunity.tags) ? opportunity.tags : [];

    return (
      <article className="student-opportunity-card" key={id}>
        <div className="student-opportunity-card-top">
          <div className="student-opportunity-icon">
            {(opportunity.title || "O").charAt(0).toUpperCase()}
          </div>

          <button
            type="button"
            className={`student-opportunity-save ${
              isSaved ? "student-opportunity-save-active" : ""
            }`}
            onClick={() => performAction(opportunity, "save")}
            disabled={saving}
            aria-label={isSaved ? "Remove saved opportunity" : "Save opportunity"}
          >
            <Bookmark size={19} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="student-opportunity-type">
          {opportunity.type || "Opportunity"}
        </div>

        <h4>{opportunity.title}</h4>

        <p className="student-opportunity-organizer">
          {getOrganizer(opportunity)}
        </p>

        <div className="student-opportunity-meta">
          <span>
            <MapPin size={15} />
            {getLocation(opportunity)}
          </span>
          <span>
            <CalendarDays size={15} />
            {getDate(opportunity)}
          </span>
          <span>
            <Clock3 size={15} />
            {getDuration(opportunity)}
          </span>
          <span>
            <UsersRound size={15} />
            {getParticipants(opportunity)}
          </span>
        </div>

        <div className="student-opportunity-tags">
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`}>{tag}</span>
          ))}
        </div>

        <div className="student-opportunity-card-footer">
          <span>{opportunity.mode || "Mode not specified"}</span>
          <span>Posted {getPosted(opportunity)}</span>
        </div>

        <div className="student-opportunity-actions">
          <button
            type="button"
            className="student-opportunity-view"
            onClick={() => setSelectedOpportunity(opportunity)}
          >
            View Details
          </button>

          <button
            type="button"
            className={`student-opportunity-register ${
              isRegistered ? "student-opportunity-registered" : ""
            }`}
            disabled={isRegistered || registering}
            onClick={() => performAction(opportunity, "register")}
          >
            {isRegistered ? (
              <>
                <Check size={16} />
                Registered
              </>
            ) : registering ? (
              "Registering..."
            ) : (
              "Register"
            )}
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="student-opportunities-page">
      <div className="student-opportunities-header">
        <div>
          <span className="student-opportunities-badge">
            <ArrowUpRight size={15} />
            Student Opportunities
          </span>

          <h2>Explore Opportunities</h2>
          <p>
            Discover hackathons, workshops, competitions, programs and other
            opportunities to grow your career.
          </p>
        </div>

        <div className="student-opportunities-summary">
          <div>
            <strong>{filteredOpportunities.length}</strong>
            <span>Available</span>
          </div>
          <div>
            <strong>{savedCount}</strong>
            <span>Saved</span>
          </div>
          <div>
            <strong>{registeredCount}</strong>
            <span>Registered</span>
          </div>
        </div>
      </div>

      <div className="student-opportunities-search-panel">
        <div className="student-opportunities-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search opportunities, organizers, skills..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="student-opportunities-filter-title">
          <Filter size={17} />
          <span>Filter Opportunities</span>
        </div>

        <div className="student-opportunities-filters">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value)}
          >
            {modes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="student-opportunities-clear"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {(error || notice) && (
        <div
          role="status"
          className={error ? "student-opportunities-error" : "student-opportunities-notice"}
        >
          {error || notice}
          {error && (
            <button type="button" onClick={loadOpportunities}>
              Retry
            </button>
          )}
        </div>
      )}

      <div className="student-opportunities-results-header">
        <div>
          <h3>Available Opportunities</h3>
          <p>Opportunities published by registered StartupSync members.</p>
        </div>
        <span>{filteredOpportunities.length} results</span>
      </div>

      {loading ? (
        <div className="student-opportunities-empty">
          <p>Loading opportunities...</p>
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <div className="student-opportunities-grid">
          {filteredOpportunities.map(renderOpportunityCard)}
        </div>
      ) : (
        <div className="student-opportunities-empty">
          <div className="student-opportunities-empty-icon">
            <Search size={25} />
          </div>
          <h3>
            {opportunities.length === 0
              ? "No opportunities published yet"
              : "No opportunities found"}
          </h3>
          <p>
            {opportunities.length === 0
              ? "Check back after a founder, investor, or mentor publishes an opportunity."
              : "Try another search term or clear the filters to explore more opportunities."}
          </p>
          {opportunities.length > 0 && (
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {selectedOpportunity && (
        <div
          className="student-opportunity-modal-overlay"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div
            className="student-opportunity-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-opportunity-modal-header">
              <div>
                <div className="student-opportunity-modal-labels">
                  <span>{selectedOpportunity.type || "Opportunity"}</span>
                </div>
                <h3>{selectedOpportunity.title}</h3>
                <p>{getOrganizer(selectedOpportunity)}</p>
              </div>

              <button
                type="button"
                className="student-opportunity-close"
                onClick={() => setSelectedOpportunity(null)}
                aria-label="Close opportunity details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-opportunity-modal-details">
              <div>
                <MapPin size={17} />
                <span>{getLocation(selectedOpportunity)}</span>
              </div>
              <div>
                <CalendarDays size={17} />
                <span>{getDate(selectedOpportunity)}</span>
              </div>
              <div>
                <Clock3 size={17} />
                <span>{getDuration(selectedOpportunity)}</span>
              </div>
              <div>
                <UsersRound size={17} />
                <span>{getParticipants(selectedOpportunity)}</span>
              </div>
            </div>

            <div className="student-opportunity-modal-section">
              <h4>About This Opportunity</h4>
              <p>
                {selectedOpportunity.description || "No description provided."}
              </p>
            </div>

            <div className="student-opportunity-modal-section">
              <h4>Categories &amp; Skills</h4>
              <div className="student-opportunity-modal-tags">
                {(Array.isArray(selectedOpportunity.tags)
                  ? selectedOpportunity.tags
                  : []
                ).map((tag, index) => (
                  <span key={`${tag}-${index}`}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="student-opportunity-modal-section">
              <h4>Opportunity Information</h4>
              <div className="student-opportunity-info-grid">
                <div>
                  <span>Category</span>
                  <strong>{selectedOpportunity.category || "Not specified"}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{selectedOpportunity.type || "Not specified"}</strong>
                </div>
                <div>
                  <span>Mode</span>
                  <strong>{selectedOpportunity.mode || "Not specified"}</strong>
                </div>
                <div>
                  <span>Posted</span>
                  <strong>{getPosted(selectedOpportunity)}</strong>
                </div>
              </div>
            </div>

            {selectedOpportunity.registrationUrl && (
              <div className="student-opportunity-modal-section">
                <h4>External Registration</h4>
                <a
                  href={selectedOpportunity.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open organizer's registration page
                </a>
              </div>
            )}

            <div className="student-opportunity-modal-actions">
              <button
                type="button"
                className="student-opportunity-modal-save"
                disabled={Boolean(
                  actionLoading[`${getOpportunityId(selectedOpportunity)}-save`]
                )}
                onClick={() => performAction(selectedOpportunity, "save")}
              >
                <Bookmark
                  size={17}
                  fill={selectedOpportunity.saved ? "currentColor" : "none"}
                />
                {selectedOpportunity.saved ? "Saved" : "Save Opportunity"}
              </button>

              <button
                type="button"
                className="student-opportunity-modal-register"
                disabled={
                  Boolean(selectedOpportunity.registered) ||
                  Boolean(
                    actionLoading[
                      `${getOpportunityId(selectedOpportunity)}-register`
                    ]
                  )
                }
                onClick={() => performAction(selectedOpportunity, "register")}
              >
                {selectedOpportunity.registered
                  ? "Registration Submitted"
                  : actionLoading[
                        `${getOpportunityId(selectedOpportunity)}-register`
                      ]
                    ? "Registering..."
                    : "Register Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentOpportunities;