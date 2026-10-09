import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  GraduationCap,
  MapPin,
  Plus,
  Search,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./IncubatorPrograms.css";

const programData = [
  {
    id: 1,
    name: "Startup Acceleration Program",
    description:
      "A structured acceleration program helping early-stage startups validate their business models, strengthen products and prepare for growth.",
    status: "Active",
    duration: "6 Months",
    cohort: "Cohort 2026-A",
    startups: 18,
    capacity: 25,
    applications: 64,
    industry: "Multi-Industry",
    stages: "Pre-Seed, Seed",
    location: "Pune, Maharashtra",
    format: "Hybrid",
    startDate: "January 15, 2026",
    endDate: "July 15, 2026",
    support: [
      "Mentorship",
      "Funding Guidance",
      "Product Development",
      "Investor Connect"
    ]
  },
  {
    id: 2,
    name: "Innovation Incubation Program",
    description:
      "An incubation program designed for innovative founders building technology-driven solutions with strong real-world potential.",
    status: "Active",
    duration: "9 Months",
    cohort: "Cohort 2026-B",
    startups: 12,
    capacity: 20,
    applications: 48,
    industry: "Technology",
    stages: "Idea, Pre-Seed",
    location: "Kolhapur, Maharashtra",
    format: "On-site",
    startDate: "March 1, 2026",
    endDate: "December 1, 2026",
    support: [
      "Workspace",
      "Mentorship",
      "Technical Support",
      "Networking"
    ]
  },
  {
    id: 3,
    name: "Healthcare Startup Accelerator",
    description:
      "A focused accelerator for healthcare startups working on accessible, scalable and technology-enabled healthcare solutions.",
    status: "Active",
    duration: "6 Months",
    cohort: "Cohort 2025-C",
    startups: 14,
    capacity: 15,
    applications: 52,
    industry: "HealthTech",
    stages: "Seed, Growth",
    location: "Mumbai, Maharashtra",
    format: "Hybrid",
    startDate: "September 10, 2025",
    endDate: "March 10, 2026",
    support: [
      "Healthcare Mentors",
      "Market Access",
      "Investor Connect",
      "Regulatory Guidance"
    ]
  },
  {
    id: 4,
    name: "Scale-Up Program",
    description:
      "A growth-focused program supporting established startups with market expansion, strategic partnerships and investment readiness.",
    status: "Active",
    duration: "12 Months",
    cohort: "Cohort 2025-A",
    startups: 10,
    capacity: 12,
    applications: 31,
    industry: "Multi-Industry",
    stages: "Growth",
    location: "Bengaluru, Karnataka",
    format: "Hybrid",
    startDate: "April 5, 2025",
    endDate: "April 5, 2026",
    support: [
      "Growth Strategy",
      "Investor Connect",
      "Market Expansion",
      "Leadership Mentoring"
    ]
  },
  {
    id: 5,
    name: "Student Innovation Program",
    description:
      "A student-focused program helping aspiring founders convert innovative ideas into validated startup concepts.",
    status: "Upcoming",
    duration: "4 Months",
    cohort: "Cohort 2027-A",
    startups: 0,
    capacity: 30,
    applications: 86,
    industry: "Student Innovation",
    stages: "Idea, Pre-Seed",
    location: "Nagpur, Maharashtra",
    format: "Hybrid",
    startDate: "January 10, 2027",
    endDate: "May 10, 2027",
    support: [
      "Idea Validation",
      "Mentorship",
      "Workshops",
      "Prototype Support"
    ]
  },
  {
    id: 6,
    name: "Technology Accelerator",
    description:
      "A technology-focused accelerator supporting SaaS and technology startups with product development and scalable infrastructure.",
    status: "Completed",
    duration: "8 Months",
    cohort: "Cohort 2025-B",
    startups: 16,
    capacity: 18,
    applications: 57,
    industry: "SaaS & Technology",
    stages: "Seed, Growth",
    location: "Hyderabad, Telangana",
    format: "Remote",
    startDate: "July 1, 2025",
    endDate: "February 28, 2026",
    support: [
      "Cloud Support",
      "Technical Mentoring",
      "Product Strategy",
      "Investor Connect"
    ]
  }
];

const statusOptions = [
  "All Programs",
  "Active",
  "Upcoming",
  "Completed"
];

const formatOptions = [
  "All Formats",
  "Hybrid",
  "On-site",
  "Remote"
];

function IncubatorPrograms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Programs");
  const [formatFilter, setFormatFilter] =
    useState("All Formats");

  const [selectedProgram, setSelectedProgram] =
    useState(null);

  const filteredPrograms = useMemo(() => {
    return programData.filter((program) => {
      const searchValue = searchTerm
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        program.name
          .toLowerCase()
          .includes(searchValue) ||
        program.industry
          .toLowerCase()
          .includes(searchValue) ||
        program.cohort
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All Programs" ||
        program.status === statusFilter;

      const matchesFormat =
        formatFilter === "All Formats" ||
        program.format === formatFilter;

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

  const activePrograms = programData.filter(
    (program) => program.status === "Active"
  ).length;

  const upcomingPrograms = programData.filter(
    (program) => program.status === "Upcoming"
  ).length;

  const totalStartups = programData.reduce(
    (total, program) => total + program.startups,
    0
  );

  const totalApplications = programData.reduce(
    (total, program) => total + program.applications,
    0
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Programs");
    setFormatFilter("All Formats");
  };

  const handleCreateProgram = () => {
    alert(
      "Program creation will be connected to the backend later."
    );
  };

  const handleManageProgram = (program) => {
    alert(
      `Program management for "${program.name}" will be connected to the backend later.`
    );
  };

  return (
    <div className="incubator-programs-page">

      {/* Header */}
      <div className="incubator-programs-header">

        <div>
          <span className="incubator-programs-eyebrow">
            Program Management
          </span>

          <h1>Incubation Programs</h1>

          <p>
            Create, manage and monitor startup programs,
            cohorts and incubation initiatives.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreateProgram}
        >
          <Plus size={18} />
          Create Program
        </button>

      </div>

      {/* Statistics */}
      <div className="incubator-programs-stats">

        <div className="incubator-program-stat-card">

          <div className="incubator-program-stat-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>Total Programs</span>
            <strong>{programData.length}</strong>
            <small>Across all cohorts</small>
          </div>

        </div>

        <div className="incubator-program-stat-card">

          <div className="incubator-program-stat-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Active Programs</span>
            <strong>{activePrograms}</strong>
            <small>Currently running</small>
          </div>

        </div>

        <div className="incubator-program-stat-card">

          <div className="incubator-program-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Supported Startups</span>
            <strong>{totalStartups}</strong>
            <small>Across all programs</small>
          </div>

        </div>

        <div className="incubator-program-stat-card">

          <div className="incubator-program-stat-icon">
            <ArrowUpRight size={21} />
          </div>

          <div>
            <span>Applications</span>
            <strong>{totalApplications}</strong>
            <small>Total applications received</small>
          </div>

        </div>

      </div>

      {/* Program Highlights */}
      <div className="incubator-program-highlight">

        <div className="incubator-program-highlight-content">

          <div className="incubator-program-highlight-icon">
            <RocketIcon />
          </div>

          <div>
            <span>Program Overview</span>

            <h2>
              {activePrograms} active programs are
              supporting founders
            </h2>

            <p>
              Manage cohorts, monitor startup capacity and
              connect participating founders with the right
              resources.
            </p>
          </div>

        </div>

        <div className="incubator-program-highlight-metrics">

          <div>
            <strong>{upcomingPrograms}</strong>
            <span>Upcoming</span>
          </div>

          <div>
            <strong>
              {Math.round(
                (totalStartups /
                  programData.reduce(
                    (total, program) =>
                      total + program.capacity,
                    0
                  )) *
                  100
              )}
              %
            </strong>
            <span>Capacity Used</span>
          </div>

        </div>

      </div>

      {/* Filters */}
      <div className="incubator-program-filter-card">

        <div className="incubator-program-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search programs, cohorts or industries..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

        <div className="incubator-program-filter-group">

          <div className="incubator-program-filter-control">

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

          <div className="incubator-program-filter-control">

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
            statusFilter !== "All Programs" ||
            formatFilter !== "All Formats") && (
            <button
              type="button"
              className="incubator-program-clear-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* Results Header */}
      <div className="incubator-program-results-header">

        <div>
          <h2>Programs & Cohorts</h2>

          <span>
            Showing {filteredPrograms.length} of{" "}
            {programData.length} programs
          </span>
        </div>

      </div>

      {/* Program Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="incubator-program-grid">

          {filteredPrograms.map((program) => (
            <article
              className="incubator-program-card"
              key={program.id}
            >

              <div className="incubator-program-card-header">

                <div className="incubator-program-icon">
                  <GraduationCap size={22} />
                </div>

                <span
                  className={`incubator-program-status ${
                    program.status === "Active"
                      ? "program-status-active"
                      : program.status === "Upcoming"
                        ? "program-status-upcoming"
                        : "program-status-completed"
                  }`}
                >
                  {program.status}
                </span>

              </div>

              <div className="incubator-program-card-title">

                <h3>{program.name}</h3>

                <p>{program.description}</p>

              </div>

              <div className="incubator-program-meta">

                <div>
                  <span>Cohort</span>
                  <strong>{program.cohort}</strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>{program.duration}</strong>
                </div>

                <div>
                  <span>Industry</span>
                  <strong>{program.industry}</strong>
                </div>

                <div>
                  <span>Format</span>
                  <strong>{program.format}</strong>
                </div>

              </div>

              <div className="incubator-program-capacity">

                <div className="incubator-program-capacity-header">

                  <span>
                    Startup Capacity
                  </span>

                  <strong>
                    {program.startups}/
                    {program.capacity}
                  </strong>

                </div>

                <div className="incubator-program-progress-track">

                  <div
                    className="incubator-program-progress-fill"
                    style={{
                      width: `${Math.min(
                        (program.startups /
                          program.capacity) *
                          100,
                        100
                      )}%`
                    }}
                  />

                </div>

              </div>

              <div className="incubator-program-location">

                <span>
                  <MapPin size={14} />
                  {program.location}
                </span>

                <span>
                  <CalendarDays size={14} />
                  {program.startDate}
                </span>

              </div>

              <div className="incubator-program-support">

                {program.support.slice(0, 3).map(
                  (item) => (
                    <span key={item}>
                      {item}
                    </span>
                  )
                )}

                {program.support.length > 3 && (
                  <span>
                    +{program.support.length - 3}
                  </span>
                )}

              </div>

              <div className="incubator-program-card-actions">

                <button
                  type="button"
                  className="incubator-program-view-button"
                  onClick={() =>
                    setSelectedProgram(program)
                  }
                >
                  View Details
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  className="incubator-program-manage-button"
                  onClick={() =>
                    handleManageProgram(program)
                  }
                >
                  Manage
                </button>

              </div>

            </article>
          ))}

        </div>
      ) : (
        <div className="incubator-program-empty">

          <div className="incubator-program-empty-icon">
            <Search size={26} />
          </div>

          <h3>No programs found</h3>

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

      {/* Program Details Modal */}
      {selectedProgram && (
        <div
          className="incubator-program-modal-overlay"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="incubator-program-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="incubator-program-modal-header">

              <div className="incubator-program-modal-title">

                <div className="incubator-program-icon">
                  <GraduationCap size={22} />
                </div>

                <div>
                  <h2>{selectedProgram.name}</h2>

                  <span>
                    {selectedProgram.cohort}
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="incubator-program-modal-close"
                onClick={() =>
                  setSelectedProgram(null)
                }
                aria-label="Close program details"
              >
                <X size={20} />
              </button>

            </div>

            <div className="incubator-program-modal-content">

              <div className="incubator-program-modal-status-row">

                <span
                  className={`incubator-program-status ${
                    selectedProgram.status === "Active"
                      ? "program-status-active"
                      : selectedProgram.status === "Upcoming"
                        ? "program-status-upcoming"
                        : "program-status-completed"
                  }`}
                >
                  {selectedProgram.status}
                </span>

                <span className="incubator-program-duration">
                  <Clock3 size={14} />
                  {selectedProgram.duration}
                </span>

              </div>

              <p className="incubator-program-modal-description">
                {selectedProgram.description}
              </p>

              <div className="incubator-program-modal-details">

                <div>
                  <span>Industry</span>
                  <strong>
                    {selectedProgram.industry}
                  </strong>
                </div>

                <div>
                  <span>Startup Stages</span>
                  <strong>
                    {selectedProgram.stages}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedProgram.location}
                  </strong>
                </div>

                <div>
                  <span>Format</span>
                  <strong>
                    {selectedProgram.format}
                  </strong>
                </div>

                <div>
                  <span>Start Date</span>
                  <strong>
                    {selectedProgram.startDate}
                  </strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>
                    {selectedProgram.endDate}
                  </strong>
                </div>

                <div>
                  <span>Applications</span>
                  <strong>
                    {selectedProgram.applications}
                  </strong>
                </div>

                <div>
                  <span>Selected Startups</span>
                  <strong>
                    {selectedProgram.startups}
                  </strong>
                </div>

              </div>

              <div className="incubator-program-modal-capacity">

                <div>
                  <span>
                    Program Capacity
                  </span>

                  <strong>
                    {selectedProgram.startups}/
                    {selectedProgram.capacity}
                  </strong>
                </div>

                <div className="incubator-program-progress-track">

                  <div
                    className="incubator-program-progress-fill"
                    style={{
                      width: `${Math.min(
                        (selectedProgram.startups /
                          selectedProgram.capacity) *
                          100,
                        100
                      )}%`
                    }}
                  />

                </div>

              </div>

              <div className="incubator-program-support-modal">

                <span>Support Offered</span>

                <div>
                  {selectedProgram.support.map(
                    (item) => (
                      <span key={item}>
                        <CheckCircle2 size={14} />
                        {item}
                      </span>
                    )
                  )}
                </div>

              </div>

            </div>

            <div className="incubator-program-modal-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedProgram(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleManageProgram(selectedProgram)
                }
              >
                Manage Program
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/*
  Small local icon component keeps this module independent
  from any uncertain lucide-react icon export.
*/
function RocketIcon() {
  return (
    <RocketFallback />
  );
}

function RocketFallback() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.08-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export default IncubatorPrograms;