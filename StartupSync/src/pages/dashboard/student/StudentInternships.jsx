import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  Filter,
  MapPin,
  Search,
  X,
  ExternalLink,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./StudentInternships.css";

const API_URL = "http://localhost:5000/api/opportunities";

const getToken = () => localStorage.getItem("startupsync_token");

const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

const getPostedDate = (date) => {
  if (!date) return "Date not available";

  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  );

  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;

  return new Date(date).toLocaleDateString();
};

function StudentInternships() {
  const [internships, setInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [durationFilter, setDurationFilter] = useState("All Durations");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [recommendationAvailable, setRecommendationAvailable] =
    useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState("");

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = response.data.data || [];

      const internshipItems = data
        .filter((item) => item.type === "Internship")
        .map((item) => ({
          ...item,
          id: item._id,
          company: item.organizer || "Organization not specified",
          role: item.title,
          domain: item.category || "General",
          location: item.location || "Not specified",
          mode: item.mode || "Not specified",
          duration: item.duration || "Not specified",
          stipend: item.stipend || "Not specified",
          description: item.description || "No description provided.",
          skills: Array.isArray(item.tags) ? item.tags : [],
          posted: getPostedDate(item.createdAt),
          saved: Boolean(item.saved),
          registered: Boolean(item.registered),
          match:
            typeof item.match === "number" ? item.match : null,
          recommended: Boolean(item.recommended),
        }));

      setInternships(internshipItems);
      setRecommendationAvailable(
        Boolean(response.data.recommendationAvailable)
      );
      setRecommendationMessage(
        response.data.recommendationMessage || ""
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const filteredInternships = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return internships.filter((item) => {
      const matchesSearch =
        !search ||
        [
          item.company,
          item.role,
          item.domain,
          item.description,
          ...item.skills,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesDomain =
        domainFilter === "All Domains" || item.domain === domainFilter;

      const matchesMode =
        modeFilter === "All Modes" || item.mode === modeFilter;

      const matchesDuration =
        durationFilter === "All Durations" ||
        item.duration === durationFilter;

      const matchesLocation =
        locationFilter === "All Locations" ||
        item.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
        (locationFilter === "Remote" && item.mode === "Online");

      return (
        matchesSearch &&
        matchesDomain &&
        matchesMode &&
        matchesDuration &&
        matchesLocation
      );
    });
  }, [
    internships,
    searchTerm,
    domainFilter,
    modeFilter,
    durationFilter,
    locationFilter,
  ]);

  const recommendedInternships = useMemo(
    () =>
      filteredInternships
        .filter((item) => item.recommended)
        .sort((a, b) => (b.match ?? -1) - (a.match ?? -1))
        .slice(0, 5),
    [filteredInternships]
  );

  const recommendedIds = useMemo(
    () => new Set(recommendedInternships.map((item) => item.id)),
    [recommendedInternships]
  );

  const remainingInternships = useMemo(
    () => filteredInternships.filter((item) => !recommendedIds.has(item.id)),
    [filteredInternships, recommendedIds]
  );

  const savedCount = internships.filter((item) => item.saved).length;
  const appliedCount = internships.filter((item) => item.registered).length;

  const toggleSave = async (internship) => {
    try {
      setBusyId(internship.id);
      setError("");

      await axios.post(
        `${API_URL}/${internship.id}/save`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      await fetchInternships();

      setSelectedInternship((current) =>
        current?.id === internship.id
          ? {
              ...current,
              saved: !current.saved,
            }
          : current
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleApply = async (internship) => {
    if (internship.registered) return;

    try {
      setBusyId(internship.id);
      setError("");

      await axios.post(
        `${API_URL}/${internship.id}/register`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      await fetchInternships();

      setSelectedInternship((current) =>
        current?.id === internship.id
          ? { ...current, registered: true }
          : current
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDomainFilter("All Domains");
    setModeFilter("All Modes");
    setDurationFilter("All Durations");
    setLocationFilter("All Locations");
  };

  const domains = [
    "All Domains",
    ...new Set(internships.map((item) => item.domain).filter(Boolean)),
  ];

  const modes = [
    "All Modes",
    ...new Set(internships.map((item) => item.mode).filter(Boolean)),
  ];

  const durations = [
    "All Durations",
    ...new Set(internships.map((item) => item.duration).filter(Boolean)),
  ];

  const locations = [
    "All Locations",
    ...new Set(
      internships.map((item) =>
        item.mode === "Online" ? "Remote" : item.location
      )
    ),
  ];

  const renderInternshipCard = (internship, isRecommended = false) => (
    <article className="student-internship-card" key={internship.id}>
      <div className="student-internship-card-top">
        <div className="student-company-logo">
          {internship.company.charAt(0).toUpperCase()}
        </div>

        <button
          type="button"
          className={`student-save-button ${
            internship.saved ? "student-save-active" : ""
          }`}
          onClick={() => toggleSave(internship)}
          disabled={busyId === internship.id}
          aria-label={internship.saved ? "Unsave internship" : "Save internship"}
        >
          <Bookmark
            size={19}
            fill={internship.saved ? "currentColor" : "none"}
          />
        </button>
      </div>

      {isRecommended && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            margin: "8px 0",
            padding: "5px 9px",
            borderRadius: 6,
            background: "#ecfdf5",
            color: "#047857",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Check size={14} />
          AI Recommended
          {typeof internship.match === "number" &&
            ` · ${internship.match.toFixed(1)}% similarity`}
        </div>
      )}

      <h4>{internship.role}</h4>
      <p className="student-internship-company">{internship.company}</p>

      <div className="student-internship-meta">
        <span>
          <MapPin size={15} />
          {internship.location}
        </span>
        <span>
          <BriefcaseBusiness size={15} />
          {internship.mode}
        </span>
        <span>
          <Clock3 size={15} />
          {internship.duration}
        </span>
      </div>

      <div className="student-internship-skills">
        {internship.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="student-internship-card-footer">
        <span className="student-internship-posted">
          <CalendarDays size={14} />
          {internship.posted}
        </span>
      </div>

      <div className="student-internship-actions">
        <button
          type="button"
          className="student-view-button"
          onClick={() => setSelectedInternship(internship)}
        >
          View Details
        </button>

        <button
          type="button"
          className={`student-apply-button ${
            internship.registered ? "student-apply-completed" : ""
          }`}
          disabled={internship.registered || busyId === internship.id}
          onClick={() => handleApply(internship)}
        >
          {internship.registered ? (
            <>
              <Check size={16} /> Applied
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </article>
  );

  return (
    <section className="student-internships-page">
      <div className="student-internships-header">
        <div>
          <span className="student-internships-badge">
            <BriefcaseBusiness size={15} />
            Internship Opportunities
          </span>
          <h2>Find Your Next Internship</h2>
          <p>
            Discover internship opportunities published on StartupSync.
          </p>
        </div>

        <div className="student-internships-summary">
          <div>
            <strong>{filteredInternships.length}</strong>
            <span>Opportunities</span>
          </div>
          <div>
            <strong>{savedCount}</strong>
            <span>Saved</span>
          </div>
          <div>
            <strong>{appliedCount}</strong>
            <span>Applied</span>
          </div>
        </div>
      </div>

      <div className="student-internship-search-panel">
        <div className="student-internship-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search by role, company, domain or skill..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="student-internship-filter-title">
          <Filter size={17} />
          <span>Filters</span>
        </div>

        <div className="student-internship-filters">
          <select
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value)}
          >
            {domains.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value)}
          >
            {modes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={durationFilter}
            onChange={(event) => setDurationFilter(event.target.value)}
          >
            {durations.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            {locations.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <button
            type="button"
            className="student-clear-filter-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ color: "#b91c1c", marginBottom: 16 }}>
          {error}
          <button
            type="button"
            onClick={fetchInternships}
            style={{ marginLeft: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="student-internship-empty">
          <h3>Loading internships...</h3>
        </div>
      ) : (
        <>
          {recommendationAvailable && recommendedInternships.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div className="student-internship-results-header">
                <div>
                  <h3>Top 5 AI Recommended Internships</h3>
                  <p>
                    Ranked using your profile and internship details with
                    TF-IDF and Cosine Similarity.
                  </p>
                </div>
                <span>{recommendedInternships.length} recommended</span>
              </div>

              <div className="student-internship-grid">
                {recommendedInternships.map((internship) =>
                  renderInternshipCard(internship, true)
                )}
              </div>
            </section>
          )}

          {!recommendationAvailable && recommendationMessage && (
            <div
              role="status"
              style={{
                padding: 12,
                marginBottom: 20,
                borderRadius: 8,
                background: "#fffbeb",
                color: "#92400e",
              }}
            >
              {recommendationMessage}
            </div>
          )}

          <section>
            <div className="student-internship-results-header">
              <div>
                <h3>
                  {recommendationAvailable
                    ? "All Other Internships"
                    : "Internship Opportunities"}
                </h3>
                <p>
                  {recommendationAvailable
                    ? "Explore the remaining listings below."
                    : "Browse all available internships. AI rankings appear when recommendations are available."}
                </p>
              </div>
              <span>{remainingInternships.length} results</span>
            </div>

            {remainingInternships.length > 0 ? (
              <div className="student-internship-grid">
                {remainingInternships.map((internship) =>
                  renderInternshipCard(internship)
                )}
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="student-internship-empty">
                <div className="student-internship-empty-icon">
                  <Search size={25} />
                </div>
                <h3>
                  {internships.length
                    ? "No internships found"
                    : "No internships available"}
                </h3>
                <p>
                  {internships.length
                    ? "Try changing your search or filters."
                    : "Internships will appear here when an authorized user publishes them."}
                </p>
                <button
                  type="button"
                  className="student-empty-clear-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : !recommendationAvailable &&
              recommendedInternships.length === 0 ? (
              <div className="student-internship-empty">
                <p>All matching internships are shown above.</p>
              </div>
            ) : null}
          </section>
        </>
      )}

      {selectedInternship && (
        <div
          className="student-internship-modal-overlay"
          onClick={() => setSelectedInternship(null)}
        >
          <div
            className="student-internship-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-internship-modal-header">
              <div>
                <h3>{selectedInternship.role}</h3>
                <p>{selectedInternship.company}</p>
              </div>
              <button
                type="button"
                className="student-modal-close"
                onClick={() => setSelectedInternship(null)}
                aria-label="Close internship details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-modal-details">
              <div>
                <MapPin size={17} />
                <span>{selectedInternship.location}</span>
              </div>
              <div>
                <BriefcaseBusiness size={17} />
                <span>{selectedInternship.mode}</span>
              </div>
              <div>
                <Clock3 size={17} />
                <span>{selectedInternship.duration}</span>
              </div>
            </div>

            <div className="student-modal-section">
              <h4>About the Internship</h4>
              <p>{selectedInternship.description}</p>
            </div>

            <div className="student-modal-section">
              <h4>Required Skills</h4>
              <div className="student-modal-skills">
                {selectedInternship.skills.length ? (
                  selectedInternship.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))
                ) : (
                  <p>No specific skills listed.</p>
                )}
              </div>
            </div>

            <div className="student-modal-section">
              <h4>Opportunity Details</h4>
              <div className="student-modal-opportunity-grid">
                <div>
                  <span>Domain</span>
                  <strong>{selectedInternship.domain}</strong>
                </div>
                <div>
                  <span>Posted</span>
                  <strong>{selectedInternship.posted}</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>{selectedInternship.duration}</strong>
                </div>
                <div>
                  <span>Stipend</span>
                  <strong>{selectedInternship.stipend}</strong>
                </div>
              </div>
            </div>

            <div className="student-modal-actions">
              <button
                type="button"
                className="student-modal-save"
                onClick={() => toggleSave(selectedInternship)}
                disabled={busyId === selectedInternship.id}
              >
                <Bookmark
                  size={17}
                  fill={selectedInternship.saved ? "currentColor" : "none"}
                />
                {selectedInternship.saved ? "Saved" : "Save Internship"}
              </button>

              {selectedInternship.registrationUrl ? (
                <a
                  href={selectedInternship.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="student-modal-apply"
                >
                  External Application <ExternalLink size={16} />
                </a>
              ) : (
                <button
                  type="button"
                  className="student-modal-apply"
                  disabled={
                    selectedInternship.registered ||
                    busyId === selectedInternship.id
                  }
                  onClick={() => handleApply(selectedInternship)}
                >
                  {selectedInternship.registered
                    ? "Application Submitted"
                    : "Apply Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentInternships;