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
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./StudentOpportunities.css";

const opportunityData = [
  {
    id: 1,
    title: "National Startup Hackathon",
    organizer: "Startup India Community",
    type: "Hackathon",
    category: "Technology",
    mode: "Hybrid",
    location: "Pune, Maharashtra",
    date: "October 18, 2026",
    duration: "2 Days",
    participants: "500+",
    match: 96,
    posted: "2 days ago",
    description:
      "Build innovative technology solutions for real-world problems and present your prototype to industry experts.",
    tags: ["Innovation", "Technology", "Startups", "Coding"]
  },
  {
    id: 2,
    title: "Future Founders Workshop",
    organizer: "Innovation Growth Network",
    type: "Workshop",
    category: "Entrepreneurship",
    mode: "Online",
    location: "Online",
    date: "October 24, 2026",
    duration: "1 Day",
    participants: "250+",
    match: 92,
    posted: "3 days ago",
    description:
      "A practical workshop covering startup validation, product development, pitching and early-stage business strategy.",
    tags: ["Startup", "Business", "Pitching", "Founders"]
  },
  {
    id: 3,
    title: "AI & Machine Learning Challenge",
    organizer: "TechNova Labs",
    type: "Competition",
    category: "Artificial Intelligence",
    mode: "Online",
    location: "Online",
    date: "November 5, 2026",
    duration: "7 Days",
    participants: "1,000+",
    match: 89,
    posted: "5 days ago",
    description:
      "Solve machine learning challenges and demonstrate practical AI skills through a competitive project.",
    tags: ["AI", "Machine Learning", "Python", "Data Science"]
  },
  {
    id: 4,
    title: "Student Innovation Summit",
    organizer: "National Innovation Forum",
    type: "Event",
    category: "Innovation",
    mode: "On-site",
    location: "Mumbai, Maharashtra",
    date: "November 12, 2026",
    duration: "2 Days",
    participants: "800+",
    match: 87,
    posted: "1 week ago",
    description:
      "Connect with student innovators, entrepreneurs, mentors and technology professionals at a two-day innovation summit.",
    tags: ["Innovation", "Networking", "Students", "Technology"]
  },
  {
    id: 5,
    title: "Emerging Developer Program",
    organizer: "FutureTech Foundation",
    type: "Program",
    category: "Software Development",
    mode: "Hybrid",
    location: "Bangalore, Karnataka",
    date: "December 1, 2026",
    duration: "8 Weeks",
    participants: "150+",
    match: 94,
    posted: "1 week ago",
    description:
      "An intensive development program for students interested in building production-ready software and collaborating with engineering teams.",
    tags: ["Development", "React", "Node.js", "Career"]
  },
  {
    id: 6,
    title: "Women in Technology Scholarship",
    organizer: "Digital Futures Foundation",
    type: "Scholarship",
    category: "Education",
    mode: "Online",
    location: "India",
    date: "December 15, 2026",
    duration: "Application Based",
    participants: "300+",
    match: 81,
    posted: "2 weeks ago",
    description:
      "A scholarship opportunity supporting students pursuing technology-focused education and professional development.",
    tags: ["Scholarship", "Education", "Technology", "Career"]
  }
];

const categories = [
  "All Categories",
  "Technology",
  "Entrepreneurship",
  "Artificial Intelligence",
  "Innovation",
  "Software Development",
  "Education"
];

const types = [
  "All Types",
  "Hackathon",
  "Workshop",
  "Competition",
  "Event",
  "Program",
  "Scholarship"
];

const modes = [
  "All Modes",
  "Online",
  "Hybrid",
  "On-site"
];

function StudentOpportunities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");
  const [typeFilter, setTypeFilter] =
    useState("All Types");
  const [modeFilter, setModeFilter] =
    useState("All Modes");

  const [savedOpportunities, setSavedOpportunities] =
    useState([]);
  const [registeredOpportunities, setRegisteredOpportunities] =
    useState([]);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState(null);

  const filteredOpportunities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return opportunityData.filter((opportunity) => {
      const matchesSearch =
        !search ||
        opportunity.title.toLowerCase().includes(search) ||
        opportunity.organizer.toLowerCase().includes(search) ||
        opportunity.category.toLowerCase().includes(search) ||
        opportunity.type.toLowerCase().includes(search) ||
        opportunity.tags.some((tag) =>
          tag.toLowerCase().includes(search)
        );

      const matchesCategory =
        categoryFilter === "All Categories" ||
        opportunity.category === categoryFilter;

      const matchesType =
        typeFilter === "All Types" ||
        opportunity.type === typeFilter;

      const matchesMode =
        modeFilter === "All Modes" ||
        opportunity.mode === modeFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesMode
      );
    });
  }, [
    searchTerm,
    categoryFilter,
    typeFilter,
    modeFilter
  ]);

  const toggleSave = (opportunityId) => {
    setSavedOpportunities((current) =>
      current.includes(opportunityId)
        ? current.filter((id) => id !== opportunityId)
        : [...current, opportunityId]
    );
  };

  const handleRegister = (opportunityId) => {
    setRegisteredOpportunities((current) =>
      current.includes(opportunityId)
        ? current
        : [...current, opportunityId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All Categories");
    setTypeFilter("All Types");
    setModeFilter("All Modes");
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
            Discover hackathons, workshops, competitions,
            programs and other opportunities to grow your
            career.
          </p>
        </div>

        <div className="student-opportunities-summary">
          <div>
            <strong>
              {filteredOpportunities.length}
            </strong>
            <span>Available</span>
          </div>

          <div>
            <strong>{savedOpportunities.length}</strong>
            <span>Saved</span>
          </div>

          <div>
            <strong>
              {registeredOpportunities.length}
            </strong>
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
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="student-opportunities-filter-title">
          <Filter size={17} />
          <span>Filter Opportunities</span>
        </div>

        <div className="student-opportunities-filters">
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(event) =>
              setModeFilter(event.target.value)
            }
          >
            {modes.map((mode) => (
              <option key={mode}>{mode}</option>
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

      <div className="student-opportunities-results-header">
        <div>
          <h3>Recommended Opportunities</h3>

          <p>
            Recommendations are currently represented using
            demo frontend data.
          </p>
        </div>

        <span>
          {filteredOpportunities.length} results
        </span>
      </div>

      {filteredOpportunities.length > 0 ? (
        <div className="student-opportunities-grid">
          {filteredOpportunities.map((opportunity) => {
            const isSaved = savedOpportunities.includes(
              opportunity.id
            );

            const isRegistered =
              registeredOpportunities.includes(
                opportunity.id
              );

            return (
              <article
                className="student-opportunity-card"
                key={opportunity.id}
              >
                <div className="student-opportunity-card-top">
                  <div className="student-opportunity-icon">
                    {opportunity.title.charAt(0)}
                  </div>

                  <button
                    type="button"
                    className={`student-opportunity-save ${
                      isSaved
                        ? "student-opportunity-save-active"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSave(opportunity.id)
                    }
                    aria-label={
                      isSaved
                        ? "Remove saved opportunity"
                        : "Save opportunity"
                    }
                  >
                    <Bookmark
                      size={19}
                      fill={
                        isSaved
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                <div className="student-opportunity-type">
                  {opportunity.type}
                </div>

                <div className="student-opportunity-match">
                  {opportunity.match}% Match
                </div>

                <h4>{opportunity.title}</h4>

                <p className="student-opportunity-organizer">
                  {opportunity.organizer}
                </p>

                <div className="student-opportunity-meta">
                  <span>
                    <MapPin size={15} />
                    {opportunity.location}
                  </span>

                  <span>
                    <CalendarDays size={15} />
                    {opportunity.date}
                  </span>

                  <span>
                    <Clock3 size={15} />
                    {opportunity.duration}
                  </span>

                  <span>
                    <UsersRound size={15} />
                    {opportunity.participants}
                  </span>
                </div>

                <div className="student-opportunity-tags">
                  {opportunity.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="student-opportunity-card-footer">
                  <span>
                    {opportunity.mode}
                  </span>

                  <span>
                    {opportunity.posted}
                  </span>
                </div>

                <div className="student-opportunity-actions">
                  <button
                    type="button"
                    className="student-opportunity-view"
                    onClick={() =>
                      setSelectedOpportunity(
                        opportunity
                      )
                    }
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className={`student-opportunity-register ${
                      isRegistered
                        ? "student-opportunity-registered"
                        : ""
                    }`}
                    disabled={isRegistered}
                    onClick={() =>
                      handleRegister(opportunity.id)
                    }
                  >
                    {isRegistered ? (
                      <>
                        <Check size={16} />
                        Registered
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="student-opportunities-empty">
          <div className="student-opportunities-empty-icon">
            <Search size={25} />
          </div>

          <h3>No opportunities found</h3>

          <p>
            Try another search term or clear the filters to
            explore more opportunities.
          </p>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
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
                  <span>
                    {selectedOpportunity.type}
                  </span>

                  <span>
                    {selectedOpportunity.match}% Match
                  </span>
                </div>

                <h3>
                  {selectedOpportunity.title}
                </h3>

                <p>
                  {selectedOpportunity.organizer}
                </p>
              </div>

              <button
                type="button"
                className="student-opportunity-close"
                onClick={() =>
                  setSelectedOpportunity(null)
                }
                aria-label="Close opportunity details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-opportunity-modal-details">
              <div>
                <MapPin size={17} />
                <span>
                  {selectedOpportunity.location}
                </span>
              </div>

              <div>
                <CalendarDays size={17} />
                <span>
                  {selectedOpportunity.date}
                </span>
              </div>

              <div>
                <Clock3 size={17} />
                <span>
                  {selectedOpportunity.duration}
                </span>
              </div>

              <div>
                <UsersRound size={17} />
                <span>
                  {selectedOpportunity.participants}
                </span>
              </div>
            </div>

            <div className="student-opportunity-modal-section">
              <h4>About This Opportunity</h4>

              <p>
                {selectedOpportunity.description}
              </p>
            </div>

            <div className="student-opportunity-modal-section">
              <h4>Categories & Skills</h4>

              <div className="student-opportunity-modal-tags">
                {selectedOpportunity.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="student-opportunity-modal-section">
              <h4>Opportunity Information</h4>

              <div className="student-opportunity-info-grid">
                <div>
                  <span>Category</span>
                  <strong>
                    {selectedOpportunity.category}
                  </strong>
                </div>

                <div>
                  <span>Type</span>
                  <strong>
                    {selectedOpportunity.type}
                  </strong>
                </div>

                <div>
                  <span>Mode</span>
                  <strong>
                    {selectedOpportunity.mode}
                  </strong>
                </div>

                <div>
                  <span>Posted</span>
                  <strong>
                    {selectedOpportunity.posted}
                  </strong>
                </div>
              </div>
            </div>

            <div className="student-opportunity-modal-actions">
              <button
                type="button"
                className="student-opportunity-modal-save"
                onClick={() =>
                  toggleSave(selectedOpportunity.id)
                }
              >
                <Bookmark
                  size={17}
                  fill={
                    savedOpportunities.includes(
                      selectedOpportunity.id
                    )
                      ? "currentColor"
                      : "none"
                  }
                />

                {savedOpportunities.includes(
                  selectedOpportunity.id
                )
                  ? "Saved"
                  : "Save Opportunity"}
              </button>

              <button
                type="button"
                className="student-opportunity-modal-register"
                disabled={registeredOpportunities.includes(
                  selectedOpportunity.id
                )}
                onClick={() =>
                  handleRegister(
                    selectedOpportunity.id
                  )
                }
              >
                {registeredOpportunities.includes(
                  selectedOpportunity.id
                )
                  ? "Registration Submitted"
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