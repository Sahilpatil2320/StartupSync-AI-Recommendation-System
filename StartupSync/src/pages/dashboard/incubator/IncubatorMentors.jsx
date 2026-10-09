import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Filter,
  Globe,
  Lightbulb,
  MapPin,
  MessageSquare,
  Search,
  UserRound,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./IncubatorMentors.css";

const mentorData = [
  {
    id: 1,
    name: "Ananya Kulkarni",
    role: "Product & Startup Strategy Mentor",
    organization: "GrowthBridge Ventures",
    expertise: [
      "Product Strategy",
      "Startup Growth",
      "Business Model"
    ],
    industries: ["SaaS", "FinTech", "EdTech"],
    experience: "11+ Years",
    location: "Pune, Maharashtra",
    availability: "Weekly",
    format: "Hybrid",
    assignedStartups: 4,
    sessionsCompleted: 38,
    status: "Active",
    bio:
      "Helps early-stage founders validate products, improve business models and build sustainable growth strategies."
  },
  {
    id: 2,
    name: "Rahul Deshmukh",
    role: "Technology & Engineering Mentor",
    organization: "TechScale Labs",
    expertise: [
      "Technology",
      "Architecture",
      "Engineering Leadership"
    ],
    industries: ["SaaS", "AI", "Cloud"],
    experience: "14+ Years",
    location: "Bengaluru, Karnataka",
    availability: "Every 2 Weeks",
    format: "Remote",
    assignedStartups: 5,
    sessionsCompleted: 51,
    status: "Active",
    bio:
      "Supports technology startups with scalable architecture, engineering practices and technical product decisions."
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Marketing & Brand Mentor",
    organization: "BrandCraft Studio",
    expertise: [
      "Digital Marketing",
      "Brand Strategy",
      "Go-To-Market"
    ],
    industries: ["Consumer", "EdTech", "HealthTech"],
    experience: "9+ Years",
    location: "Mumbai, Maharashtra",
    availability: "Weekly",
    format: "Hybrid",
    assignedStartups: 3,
    sessionsCompleted: 29,
    status: "Active",
    bio:
      "Works with startups on positioning, customer acquisition, branding and go-to-market planning."
  },
  {
    id: 4,
    name: "Vikram Joshi",
    role: "Finance & Investment Mentor",
    organization: "CapitalEdge Advisors",
    expertise: [
      "Fundraising",
      "Financial Planning",
      "Investor Readiness"
    ],
    industries: ["FinTech", "SaaS", "CleanTech"],
    experience: "16+ Years",
    location: "Mumbai, Maharashtra",
    availability: "Monthly",
    format: "Remote",
    assignedStartups: 6,
    sessionsCompleted: 64,
    status: "Active",
    bio:
      "Guides founders through financial planning, fundraising preparation, investor communication and capital strategy."
  },
  {
    id: 5,
    name: "Meera Joshi",
    role: "Healthcare Innovation Mentor",
    organization: "Health Innovation Network",
    expertise: [
      "Healthcare",
      "Innovation",
      "Regulatory Strategy"
    ],
    industries: ["HealthTech", "MedTech", "Wellness"],
    experience: "12+ Years",
    location: "Hyderabad, Telangana",
    availability: "Every 2 Weeks",
    format: "Remote",
    assignedStartups: 2,
    sessionsCompleted: 23,
    status: "Active",
    bio:
      "Supports healthcare founders with product innovation, market validation and healthcare ecosystem navigation."
  },
  {
    id: 6,
    name: "Amit Patil",
    role: "Operations & Business Mentor",
    organization: "ScaleWorks Consulting",
    expertise: [
      "Operations",
      "Business Strategy",
      "Process Design"
    ],
    industries: ["AgriTech", "Logistics", "SaaS"],
    experience: "10+ Years",
    location: "Kolhapur, Maharashtra",
    availability: "Monthly",
    format: "On-site",
    assignedStartups: 3,
    sessionsCompleted: 31,
    status: "Available",
    bio:
      "Helps founders establish efficient operations, improve processes and prepare their startups for sustainable scaling."
  }
];

const statusOptions = [
  "All Mentors",
  "Active",
  "Available"
];

const formatOptions = [
  "All Formats",
  "Hybrid",
  "Remote",
  "On-site"
];

function IncubatorMentors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Mentors");
  const [formatFilter, setFormatFilter] =
    useState("All Formats");

  const [selectedMentor, setSelectedMentor] =
    useState(null);

  const [assignedMentors, setAssignedMentors] =
    useState([]);

  const filteredMentors = useMemo(() => {
    return mentorData.filter((mentor) => {
      const searchValue = searchTerm
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        mentor.name
          .toLowerCase()
          .includes(searchValue) ||
        mentor.role
          .toLowerCase()
          .includes(searchValue) ||
        mentor.organization
          .toLowerCase()
          .includes(searchValue) ||
        mentor.expertise.some((item) =>
          item.toLowerCase().includes(searchValue)
        );

      const matchesStatus =
        statusFilter === "All Mentors" ||
        mentor.status === statusFilter;

      const matchesFormat =
        formatFilter === "All Formats" ||
        mentor.format === formatFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFormat
      );
    });
  }, [
    searchTerm,
    statusFilter,
    formatFilter
  ]);

  const activeMentors = mentorData.filter(
    (mentor) => mentor.status === "Active"
  ).length;

  const availableMentors = mentorData.filter(
    (mentor) => mentor.status === "Available"
  ).length;

  const totalAssignments = mentorData.reduce(
    (total, mentor) =>
      total + mentor.assignedStartups,
    0
  );

  const totalSessions = mentorData.reduce(
    (total, mentor) =>
      total + mentor.sessionsCompleted,
    0
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Mentors");
    setFormatFilter("All Formats");
  };

  const handleAssignMentor = (mentor) => {
    if (assignedMentors.includes(mentor.id)) {
      alert(
        `${mentor.name} is already assigned to this incubator.`
      );
      return;
    }

    setAssignedMentors((current) => [
      ...current,
      mentor.id
    ]);

    alert(
      `${mentor.name} has been assigned to the incubator.`
    );
  };

  const handleContactMentor = (mentor) => {
    alert(
      `Messaging with ${mentor.name} will be connected to the backend later.`
    );
  };

  return (
    <div className="incubator-mentors-page">

      {/* Header */}
      <div className="incubator-mentors-header">

        <div>
          <span className="incubator-mentors-eyebrow">
            Mentor Network
          </span>

          <h1>Mentor Management</h1>

          <p>
            Discover, manage and connect mentors with
            startups across your incubation programs.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            alert(
              "Mentor invitation will be connected to the backend later."
            )
          }
        >
          <Users size={18} />
          Invite Mentor
        </button>

      </div>

      {/* Stats */}
      <div className="incubator-mentors-stats">

        <div className="incubator-mentor-stat-card">

          <div className="incubator-mentor-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Mentors</span>
            <strong>{mentorData.length}</strong>
            <small>In mentor network</small>
          </div>

        </div>

        <div className="incubator-mentor-stat-card">

          <div className="incubator-mentor-stat-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Active Mentors</span>
            <strong>{activeMentors}</strong>
            <small>Currently supporting startups</small>
          </div>

        </div>

        <div className="incubator-mentor-stat-card">

          <div className="incubator-mentor-stat-icon">
            <Lightbulb size={21} />
          </div>

          <div>
            <span>Startup Assignments</span>
            <strong>{totalAssignments}</strong>
            <small>Current mentor assignments</small>
          </div>

        </div>

        <div className="incubator-mentor-stat-card">

          <div className="incubator-mentor-stat-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Sessions Completed</span>
            <strong>{totalSessions}</strong>
            <small>Mentoring sessions</small>
          </div>

        </div>

      </div>

      {/* Mentor Network Overview */}
      <div className="incubator-mentor-overview">

        <div className="incubator-mentor-overview-content">

          <div className="incubator-mentor-overview-icon">
            <Lightbulb size={22} />
          </div>

          <div>
            <span>Mentor Network</span>

            <h2>
              Connect founders with the right expertise
            </h2>

            <p>
              Match startup teams with experienced mentors
              based on industry, skills, availability and
              mentoring format.
            </p>
          </div>

        </div>

        <div className="incubator-mentor-overview-metrics">

          <div>
            <strong>{availableMentors}</strong>
            <span>Available</span>
          </div>

          <div>
            <strong>{assignedMentors.length}</strong>
            <span>Recently Assigned</span>
          </div>

        </div>

      </div>

      {/* Filters */}
      <div className="incubator-mentor-filter-card">

        <div className="incubator-mentor-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search mentors, expertise or organizations..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

        <div className="incubator-mentor-filter-group">

          <div className="incubator-mentor-filter-control">

            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              {statusOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>

          </div>

          <div className="incubator-mentor-filter-control">

            <select
              value={formatFilter}
              onChange={(event) =>
                setFormatFilter(event.target.value)
              }
            >
              {formatOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>

          </div>

          {(searchTerm ||
            statusFilter !== "All Mentors" ||
            formatFilter !== "All Formats") && (
            <button
              type="button"
              className="incubator-mentor-clear-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* Results */}
      <div className="incubator-mentor-results-header">

        <div>
          <h2>Mentor Directory</h2>

          <span>
            Showing {filteredMentors.length} of{" "}
            {mentorData.length} mentors
          </span>
        </div>

      </div>

      {/* Mentor Cards */}
      {filteredMentors.length > 0 ? (
        <div className="incubator-mentor-grid">

          {filteredMentors.map((mentor) => {
            const isAssigned =
              assignedMentors.includes(mentor.id);

            return (
              <article
                className="incubator-mentor-card"
                key={mentor.id}
              >

                <div className="incubator-mentor-card-top">

                  <div className="incubator-mentor-avatar">
                    {mentor.name.charAt(0)}
                  </div>

                  <div className="incubator-mentor-title">

                    <div className="incubator-mentor-name-row">

                      <h3>{mentor.name}</h3>

                      <span
                        className={`incubator-mentor-status ${
                          mentor.status === "Active"
                            ? "mentor-status-active"
                            : "mentor-status-available"
                        }`}
                      >
                        {mentor.status}
                      </span>

                    </div>

                    <p>{mentor.role}</p>

                    <span className="incubator-mentor-organization">
                      <BriefcaseBusiness size={13} />
                      {mentor.organization}
                    </span>

                  </div>

                </div>

                <div className="incubator-mentor-info">

                  <span>
                    <MapPin size={14} />
                    {mentor.location}
                  </span>

                  <span>
                    <CalendarDays size={14} />
                    {mentor.availability}
                  </span>

                  <span>
                    <Globe size={14} />
                    {mentor.format}
                  </span>

                </div>

                <div className="incubator-mentor-expertise">

                  {mentor.expertise.map(
                    (expertise) => (
                      <span key={expertise}>
                        {expertise}
                      </span>
                    )
                  )}

                </div>

                <div className="incubator-mentor-stats-row">

                  <div>
                    <span>Experience</span>
                    <strong>
                      {mentor.experience}
                    </strong>
                  </div>

                  <div>
                    <span>Startups</span>
                    <strong>
                      {mentor.assignedStartups}
                    </strong>
                  </div>

                  <div>
                    <span>Sessions</span>
                    <strong>
                      {mentor.sessionsCompleted}
                    </strong>
                  </div>

                </div>

                <div className="incubator-mentor-actions">

                  <button
                    type="button"
                    className="incubator-mentor-view-button"
                    onClick={() =>
                      setSelectedMentor(mentor)
                    }
                  >
                    View Profile
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    className={`incubator-mentor-assign-button ${
                      isAssigned
                        ? "mentor-assigned"
                        : ""
                    }`}
                    onClick={() =>
                      handleAssignMentor(mentor)
                    }
                  >
                    {isAssigned
                      ? "Assigned"
                      : "Assign"}
                  </button>

                </div>

              </article>
            );
          })}

        </div>
      ) : (
        <div className="incubator-mentor-empty">

          <div className="incubator-mentor-empty-icon">
            <Search size={26} />
          </div>

          <h3>No mentors found</h3>

          <p>
            Try changing your search or filter criteria.
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>
      )}

      {/* Mentor Profile Modal */}
      {selectedMentor && (
        <div
          className="incubator-mentor-modal-overlay"
          onClick={() => setSelectedMentor(null)}
        >
          <div
            className="incubator-mentor-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="incubator-mentor-modal-header">

              <div className="incubator-mentor-modal-profile">

                <div className="incubator-mentor-avatar incubator-mentor-modal-avatar">
                  {selectedMentor.name.charAt(0)}
                </div>

                <div>
                  <h2>{selectedMentor.name}</h2>

                  <p>{selectedMentor.role}</p>

                  <span>
                    {selectedMentor.organization}
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="incubator-mentor-modal-close"
                onClick={() =>
                  setSelectedMentor(null)
                }
                aria-label="Close mentor profile"
              >
                <X size={20} />
              </button>

            </div>

            <div className="incubator-mentor-modal-content">

              <p className="incubator-mentor-modal-bio">
                {selectedMentor.bio}
              </p>

              <div className="incubator-mentor-modal-details">

                <div>
                  <span>Experience</span>
                  <strong>
                    {selectedMentor.experience}
                  </strong>
                </div>

                <div>
                  <span>Availability</span>
                  <strong>
                    {selectedMentor.availability}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedMentor.location}
                  </strong>
                </div>

                <div>
                  <span>Format</span>
                  <strong>
                    {selectedMentor.format}
                  </strong>
                </div>

                <div>
                  <span>Assigned Startups</span>
                  <strong>
                    {selectedMentor.assignedStartups}
                  </strong>
                </div>

                <div>
                  <span>Sessions Completed</span>
                  <strong>
                    {selectedMentor.sessionsCompleted}
                  </strong>
                </div>

              </div>

              <div className="incubator-mentor-modal-section">

                <span>Expertise</span>

                <div className="incubator-mentor-modal-tags">

                  {selectedMentor.expertise.map(
                    (item) => (
                      <span key={item}>
                        {item}
                      </span>
                    )
                  )}

                </div>

              </div>

              <div className="incubator-mentor-modal-section">

                <span>Industries</span>

                <div className="incubator-mentor-modal-tags">

                  {selectedMentor.industries.map(
                    (industry) => (
                      <span key={industry}>
                        {industry}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

            <div className="incubator-mentor-modal-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  handleContactMentor(selectedMentor)
                }
              >
                <MessageSquare size={17} />
                Contact Mentor
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleAssignMentor(selectedMentor)
                }
              >
                {assignedMentors.includes(
                  selectedMentor.id
                )
                  ? "Already Assigned"
                  : "Assign Mentor"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default IncubatorMentors;