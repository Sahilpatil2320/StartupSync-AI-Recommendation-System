import {
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Filter,
  MapPin,
  Rocket,
  Search,
  Users,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./IncubatorStartups.css";

const startupData = [
  {
    id: 1,
    name: "FinFlow Technologies",
    tagline: "Simplifying financial management for growing businesses.",
    founder: "Aarav Sharma",
    industry: "FinTech",
    stage: "Seed",
    location: "Pune, Maharashtra",
    cohort: "Cohort 2026-A",
    program: "Startup Acceleration Program",
    progress: 78,
    teamSize: 8,
    funding: "₹35 Lakhs",
    fundingStage: "Seed",
    joinedDate: "January 2026",
    status: "Active",
    description:
      "FinFlow provides an intelligent financial management platform that helps startups track expenses, manage cash flow and make better financial decisions.",
    nextMilestone: "Launch enterprise dashboard",
    milestoneDate: "October 15, 2026"
  },
  {
    id: 2,
    name: "AgriNova Labs",
    tagline: "Smart technology for modern agriculture.",
    founder: "Sneha Patil",
    industry: "AgriTech",
    stage: "Pre-Seed",
    location: "Kolhapur, Maharashtra",
    cohort: "Cohort 2026-B",
    program: "Innovation Incubation Program",
    progress: 62,
    teamSize: 5,
    funding: "₹18 Lakhs",
    fundingStage: "Pre-Seed",
    joinedDate: "March 2026",
    status: "Active",
    description:
      "AgriNova develops technology-driven solutions for crop monitoring, smart irrigation and data-based farming decisions.",
    nextMilestone: "Complete pilot deployment",
    milestoneDate: "November 5, 2026"
  },
  {
    id: 3,
    name: "HealthNest Innovations",
    tagline: "Making preventive healthcare more accessible.",
    founder: "Rohan Kulkarni",
    industry: "HealthTech",
    stage: "Seed",
    location: "Mumbai, Maharashtra",
    cohort: "Cohort 2025-C",
    program: "Healthcare Startup Accelerator",
    progress: 86,
    teamSize: 11,
    funding: "₹60 Lakhs",
    fundingStage: "Seed",
    joinedDate: "September 2025",
    status: "Active",
    description:
      "HealthNest is building a digital preventive healthcare platform connecting individuals with personalized wellness services.",
    nextMilestone: "Expand to 3 new cities",
    milestoneDate: "October 30, 2026"
  },
  {
    id: 4,
    name: "GreenGrid Systems",
    tagline: "Building smarter and cleaner energy infrastructure.",
    founder: "Vikram Deshmukh",
    industry: "CleanTech",
    stage: "Growth",
    location: "Bengaluru, Karnataka",
    cohort: "Cohort 2025-A",
    program: "Scale-Up Program",
    progress: 94,
    teamSize: 24,
    funding: "₹1.8 Crore",
    fundingStage: "Series A",
    joinedDate: "April 2025",
    status: "Graduating",
    description:
      "GreenGrid develops intelligent energy monitoring and optimization systems for commercial and industrial facilities.",
    nextMilestone: "Complete incubation program",
    milestoneDate: "December 10, 2026"
  },
  {
    id: 5,
    name: "EduBridge",
    tagline: "Connecting students with meaningful opportunities.",
    founder: "Priya Joshi",
    industry: "EdTech",
    stage: "Pre-Seed",
    location: "Nagpur, Maharashtra",
    cohort: "Cohort 2026-B",
    program: "Student Innovation Program",
    progress: 48,
    teamSize: 4,
    funding: "₹10 Lakhs",
    fundingStage: "Pre-Seed",
    joinedDate: "April 2026",
    status: "Active",
    description:
      "EduBridge connects students with internships, projects, mentors and early-career opportunities through a unified platform.",
    nextMilestone: "Reach 5,000 student users",
    milestoneDate: "November 20, 2026"
  },
  {
    id: 6,
    name: "CloudMesh Solutions",
    tagline: "Simplifying cloud infrastructure for startups.",
    founder: "Kunal Mehta",
    industry: "SaaS",
    stage: "Seed",
    location: "Hyderabad, Telangana",
    cohort: "Cohort 2025-B",
    program: "Technology Accelerator",
    progress: 71,
    teamSize: 13,
    funding: "₹45 Lakhs",
    fundingStage: "Seed",
    joinedDate: "July 2025",
    status: "Active",
    description:
      "CloudMesh provides simplified cloud infrastructure management tools designed specifically for startups and small technology teams.",
    nextMilestone: "Release version 2.0",
    milestoneDate: "October 25, 2026"
  }
];

const statusOptions = ["All Statuses", "Active", "Graduating"];

const stageOptions = [
  "All Stages",
  "Pre-Seed",
  "Seed",
  "Growth"
];

const industryOptions = [
  "All Industries",
  "FinTech",
  "AgriTech",
  "HealthTech",
  "CleanTech",
  "EdTech",
  "SaaS"
];

function IncubatorStartups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [industryFilter, setIndustryFilter] =
    useState("All Industries");

  const [selectedStartup, setSelectedStartup] = useState(null);

  const filteredStartups = useMemo(() => {
    return startupData.filter((startup) => {
      const searchValue = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        startup.name.toLowerCase().includes(searchValue) ||
        startup.founder.toLowerCase().includes(searchValue) ||
        startup.industry.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        startup.status === statusFilter;

      const matchesStage =
        stageFilter === "All Stages" ||
        startup.stage === stageFilter;

      const matchesIndustry =
        industryFilter === "All Industries" ||
        startup.industry === industryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStage &&
        matchesIndustry
      );
    });
  }, [
    searchTerm,
    statusFilter,
    stageFilter,
    industryFilter
  ]);

  const activeStartups = startupData.filter(
    (startup) => startup.status === "Active"
  ).length;

  const graduatingStartups = startupData.filter(
    (startup) => startup.status === "Graduating"
  ).length;

  const totalFunding = "₹3.68 Crore";

  const averageProgress = Math.round(
    startupData.reduce(
      (total, startup) => total + startup.progress,
      0
    ) / startupData.length
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setStageFilter("All Stages");
    setIndustryFilter("All Industries");
  };

  const handleContactFounder = (startup) => {
    alert(
      `Founder contact action for ${startup.name} will be connected to the messaging system later.`
    );
  };

  return (
    <div className="incubator-startups-page">

      {/* Page Header */}
      <div className="incubator-startups-header">
        <div>
          <span className="incubator-startups-eyebrow">
            Startup Portfolio
          </span>

          <h1>Incubated Startups</h1>

          <p>
            Track, support and manage startups participating
            in your incubation programs.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            alert(
              "Startup onboarding will be connected to the backend later."
            )
          }
        >
          <Rocket size={18} />
          Add Startup
        </button>
      </div>

      {/* Summary Cards */}
      <div className="incubator-startups-stats">

        <div className="incubator-startup-stat-card">
          <div className="incubator-startup-stat-icon">
            <Rocket size={21} />
          </div>

          <div>
            <span>Total Startups</span>
            <strong>{startupData.length}</strong>
            <small>Currently in portfolio</small>
          </div>
        </div>

        <div className="incubator-startup-stat-card">
          <div className="incubator-startup-stat-icon">
            <Building2 size={21} />
          </div>

          <div>
            <span>Active Startups</span>
            <strong>{activeStartups}</strong>
            <small>Currently incubating</small>
          </div>
        </div>

        <div className="incubator-startup-stat-card">
          <div className="incubator-startup-stat-icon">
            <CircleDollarSign size={21} />
          </div>

          <div>
            <span>Portfolio Funding</span>
            <strong>{totalFunding}</strong>
            <small>Total reported funding</small>
          </div>
        </div>

        <div className="incubator-startup-stat-card">
          <div className="incubator-startup-stat-icon">
            <ChevronRight size={21} />
          </div>

          <div>
            <span>Avg. Progress</span>
            <strong>{averageProgress}%</strong>
            <small>Incubation progress</small>
          </div>
        </div>

      </div>

      {/* Portfolio Overview */}
      <div className="incubator-portfolio-overview">

        <div>
          <div className="incubator-overview-title-row">
            <div>
              <span className="incubator-startups-eyebrow">
                Portfolio Overview
              </span>

              <h2>Startup Progress</h2>
            </div>

            <span className="incubator-graduating-badge">
              {graduatingStartups} graduating
            </span>
          </div>

          <p>
            Monitor the progress of startups and identify
            teams that may need additional support.
          </p>
        </div>

        <div className="incubator-overview-progress">
          <div className="incubator-overview-progress-header">
            <span>Overall incubation progress</span>
            <strong>{averageProgress}%</strong>
          </div>

          <div className="incubator-progress-track">
            <div
              className="incubator-progress-fill"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="incubator-startups-filter-card">

        <div className="incubator-startups-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search startups, founders or industries..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="incubator-startups-filter-group">

          <div className="incubator-filter-control">
            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="incubator-filter-control">
            <select
              value={stageFilter}
              onChange={(event) =>
                setStageFilter(event.target.value)
              }
            >
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="incubator-filter-control">
            <select
              value={industryFilter}
              onChange={(event) =>
                setIndustryFilter(event.target.value)
              }
            >
              {industryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm ||
            statusFilter !== "All Statuses" ||
            stageFilter !== "All Stages" ||
            industryFilter !== "All Industries") && (
            <button
              type="button"
              className="incubator-clear-filter-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* Results */}
      <div className="incubator-startups-results-header">
        <div>
          <h2>Startup Portfolio</h2>
          <span>
            Showing {filteredStartups.length} of{" "}
            {startupData.length} startups
          </span>
        </div>
      </div>

      {/* Startup Cards */}
      {filteredStartups.length > 0 ? (
        <div className="incubator-startups-grid">

          {filteredStartups.map((startup) => (
            <article
              className="incubator-startup-card"
              key={startup.id}
            >

              <div className="incubator-startup-card-top">

                <div className="incubator-startup-logo">
                  {startup.name.charAt(0)}
                </div>

                <div className="incubator-startup-heading">
                  <div className="incubator-startup-name-row">
                    <h3>{startup.name}</h3>

                    <span
                      className={`incubator-status-badge ${
                        startup.status === "Graduating"
                          ? "incubator-status-graduating"
                          : "incubator-status-active"
                      }`}
                    >
                      {startup.status}
                    </span>
                  </div>

                  <p>{startup.tagline}</p>
                </div>

              </div>

              <div className="incubator-startup-meta">

                <span>
                  <Users size={15} />
                  {startup.founder}
                </span>

                <span>
                  <MapPin size={15} />
                  {startup.location}
                </span>

              </div>

              <div className="incubator-startup-tags">
                <span>{startup.industry}</span>
                <span>{startup.stage}</span>
                <span>{startup.cohort}</span>
              </div>

              <div className="incubator-startup-program">
                <div>
                  <span>Program</span>
                  <strong>{startup.program}</strong>
                </div>

                <div>
                  <span>Joined</span>
                  <strong>{startup.joinedDate}</strong>
                </div>
              </div>

              <div className="incubator-startup-progress-section">

                <div className="incubator-startup-progress-header">
                  <span>Incubation Progress</span>
                  <strong>{startup.progress}%</strong>
                </div>

                <div className="incubator-progress-track">
                  <div
                    className="incubator-progress-fill"
                    style={{
                      width: `${startup.progress}%`
                    }}
                  />
                </div>

              </div>

              <div className="incubator-startup-bottom">

                <div>
                  <span>Funding</span>
                  <strong>{startup.funding}</strong>
                </div>

                <div>
                  <span>Team</span>
                  <strong>{startup.teamSize} members</strong>
                </div>

              </div>

              <div className="incubator-startup-actions">

                <button
                  type="button"
                  className="incubator-view-button"
                  onClick={() =>
                    setSelectedStartup(startup)
                  }
                >
                  View Startup
                  <ChevronRight size={17} />
                </button>

                <button
                  type="button"
                  className="incubator-contact-button"
                  onClick={() =>
                    handleContactFounder(startup)
                  }
                >
                  Contact Founder
                </button>

              </div>

            </article>
          ))}

        </div>
      ) : (
        <div className="incubator-startups-empty">

          <div className="incubator-empty-icon">
            <Search size={26} />
          </div>

          <h3>No startups found</h3>

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

      {/* Startup Details Modal */}
      {selectedStartup && (
        <div
          className="incubator-startup-modal-overlay"
          onClick={() => setSelectedStartup(null)}
        >
          <div
            className="incubator-startup-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="incubator-modal-header">

              <div className="incubator-modal-startup-info">

                <div className="incubator-startup-logo incubator-modal-logo">
                  {selectedStartup.name.charAt(0)}
                </div>

                <div>
                  <h2>{selectedStartup.name}</h2>

                  <span>
                    {selectedStartup.industry} •{" "}
                    {selectedStartup.stage}
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="incubator-modal-close"
                onClick={() => setSelectedStartup(null)}
                aria-label="Close startup details"
              >
                <X size={20} />
              </button>

            </div>

            <div className="incubator-modal-content">

              <p className="incubator-modal-description">
                {selectedStartup.description}
              </p>

              <div className="incubator-modal-progress-card">

                <div className="incubator-modal-progress-header">
                  <span>Incubation Progress</span>
                  <strong>
                    {selectedStartup.progress}%
                  </strong>
                </div>

                <div className="incubator-progress-track">
                  <div
                    className="incubator-progress-fill"
                    style={{
                      width: `${selectedStartup.progress}%`
                    }}
                  />
                </div>

              </div>

              <div className="incubator-modal-details-grid">

                <div>
                  <span>Founder</span>
                  <strong>
                    {selectedStartup.founder}
                  </strong>
                </div>

                <div>
                  <span>Team Size</span>
                  <strong>
                    {selectedStartup.teamSize} members
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedStartup.location}
                  </strong>
                </div>

                <div>
                  <span>Program</span>
                  <strong>
                    {selectedStartup.program}
                  </strong>
                </div>

                <div>
                  <span>Funding Stage</span>
                  <strong>
                    {selectedStartup.fundingStage}
                  </strong>
                </div>

                <div>
                  <span>Reported Funding</span>
                  <strong>
                    {selectedStartup.funding}
                  </strong>
                </div>

              </div>

              <div className="incubator-next-milestone">

                <div className="incubator-next-milestone-icon">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <span>Next Milestone</span>
                  <strong>
                    {selectedStartup.nextMilestone}
                  </strong>
                  <small>
                    Target date:{" "}
                    {selectedStartup.milestoneDate}
                  </small>
                </div>

              </div>

            </div>

            <div className="incubator-modal-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedStartup(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleContactFounder(selectedStartup)
                }
              >
                Contact Founder
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default IncubatorStartups;