import { useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Filter,
  IndianRupee,
  Mail,
  MapPin,
  Rocket,
  Search,
  ShieldCheck,
  Users,
  X
} from "lucide-react";

import "./AdminStartups.css";

const initialStartups = [
  {
    id: 1,
    name: "FinFlow Technologies",
    founder: "Aarav Kulkarni",
    industry: "FinTech",
    stage: "Seed",
    location: "Pune, Maharashtra",
    teamSize: 8,
    fundingRequired: "₹75 Lakhs",
    status: "Active",
    verified: true,
    joined: "12 Sep 2026",
    description:
      "A digital financial platform helping small businesses manage payments, cash flow and financial operations."
  },
  {
    id: 2,
    name: "AgriNova Labs",
    founder: "Sneha Patil",
    industry: "AgriTech",
    stage: "Pre-Seed",
    location: "Nashik, Maharashtra",
    teamSize: 5,
    fundingRequired: "₹35 Lakhs",
    status: "Active",
    verified: true,
    joined: "10 Sep 2026",
    description:
      "Technology-driven agriculture solutions focused on improving farm productivity and resource efficiency."
  },
  {
    id: 3,
    name: "GreenGrid Systems",
    founder: "Vikram Deshmukh",
    industry: "CleanTech",
    stage: "Idea",
    location: "Nagpur, Maharashtra",
    teamSize: 4,
    fundingRequired: "₹25 Lakhs",
    status: "Pending",
    verified: false,
    joined: "28 Sep 2026",
    description:
      "A clean energy technology venture developing intelligent solutions for efficient energy management."
  },
  {
    id: 4,
    name: "HealthNest Innovations",
    founder: "Riya Sharma",
    industry: "HealthTech",
    stage: "Seed",
    location: "Bengaluru, Karnataka",
    teamSize: 11,
    fundingRequired: "₹1.2 Crore",
    status: "Active",
    verified: true,
    joined: "07 Sep 2026",
    description:
      "A healthcare technology startup focused on improving access to digital health services."
  },
  {
    id: 5,
    name: "EduBridge",
    founder: "Rahul Patil",
    industry: "EdTech",
    stage: "Growth",
    location: "Kolhapur, Maharashtra",
    teamSize: 15,
    fundingRequired: "₹2 Crore",
    status: "Active",
    verified: true,
    joined: "02 Sep 2026",
    description:
      "An education platform connecting learners with practical learning and career opportunities."
  },
  {
    id: 6,
    name: "CloudMesh Solutions",
    founder: "Amit Desai",
    industry: "SaaS",
    stage: "Pre-Seed",
    location: "Mumbai, Maharashtra",
    teamSize: 6,
    fundingRequired: "₹50 Lakhs",
    status: "Pending",
    verified: false,
    joined: "26 Sep 2026",
    description:
      "A cloud-based business software platform designed to simplify operations for growing organizations."
  },
  {
    id: 7,
    name: "TravelSphere",
    founder: "Meera Joshi",
    industry: "TravelTech",
    stage: "Seed",
    location: "Goa, India",
    teamSize: 9,
    fundingRequired: "₹60 Lakhs",
    status: "Suspended",
    verified: true,
    joined: "22 Aug 2026",
    description:
      "A technology platform helping travelers discover and organize personalized travel experiences."
  },
  {
    id: 8,
    name: "RetailPulse",
    founder: "Karan Mehta",
    industry: "RetailTech",
    stage: "Idea",
    location: "Ahmedabad, Gujarat",
    teamSize: 3,
    fundingRequired: "₹20 Lakhs",
    status: "Active",
    verified: true,
    joined: "30 Aug 2026",
    description:
      "A retail analytics platform helping small and medium businesses understand customer and sales trends."
  }
];

const industryFilters = [
  "All Industries",
  "FinTech",
  "AgriTech",
  "CleanTech",
  "HealthTech",
  "EdTech",
  "SaaS",
  "TravelTech",
  "RetailTech"
];

const stageFilters = [
  "All Stages",
  "Idea",
  "Pre-Seed",
  "Seed",
  "Growth"
];

const statusFilters = [
  "All Status",
  "Active",
  "Pending",
  "Suspended"
];

function AdminStartups() {
  const [startups, setStartups] = useState(initialStartups);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] =
    useState("All Industries");
  const [stageFilter, setStageFilter] =
    useState("All Stages");
  const [statusFilter, setStatusFilter] =
    useState("All Status");
  const [selectedStartup, setSelectedStartup] =
    useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredStartups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return startups.filter((startup) => {
      const matchesSearch =
        !query ||
        startup.name.toLowerCase().includes(query) ||
        startup.founder.toLowerCase().includes(query) ||
        startup.industry.toLowerCase().includes(query) ||
        startup.location.toLowerCase().includes(query);

      const matchesIndustry =
        industryFilter === "All Industries" ||
        startup.industry === industryFilter;

      const matchesStage =
        stageFilter === "All Stages" ||
        startup.stage === stageFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        startup.status === statusFilter;

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesStage &&
        matchesStatus
      );
    });
  }, [
    startups,
    searchQuery,
    industryFilter,
    stageFilter,
    statusFilter
  ]);

  const totalStartups = startups.length;

  const activeStartups = startups.filter(
    (startup) => startup.status === "Active"
  ).length;

  const pendingStartups = startups.filter(
    (startup) => startup.status === "Pending"
  ).length;

  const verifiedStartups = startups.filter(
    (startup) => startup.verified
  ).length;

  const handleVerifyStartup = (id) => {
    setStartups((current) =>
      current.map((startup) =>
        startup.id === id
          ? {
              ...startup,
              verified: true,
              status:
                startup.status === "Pending"
                  ? "Active"
                  : startup.status
            }
          : startup
      )
    );

    setSelectedStartup((current) =>
      current?.id === id
        ? {
            ...current,
            verified: true,
            status:
              current.status === "Pending"
                ? "Active"
                : current.status
          }
        : current
    );
  };

  const handleToggleStatus = (id) => {
    setStartups((current) =>
      current.map((startup) =>
        startup.id === id
          ? {
              ...startup,
              status:
                startup.status === "Suspended"
                  ? "Active"
                  : "Suspended"
            }
          : startup
      )
    );

    setSelectedStartup((current) =>
      current?.id === id
        ? {
            ...current,
            status:
              current.status === "Suspended"
                ? "Active"
                : "Suspended"
          }
        : current
    );
  };

  const handleContactFounder = (startup) => {
    window.alert(
      `Contacting ${startup.founder} for ${startup.name} will be connected to the backend later.`
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setIndustryFilter("All Industries");
    setStageFilter("All Stages");
    setStatusFilter("All Status");
  };

  return (
    <section className="admin-startups-page">
      <div className="admin-startups-header">
        <div>
          <span className="admin-startups-eyebrow">
            Platform Administration
          </span>

          <h1>Startup Management</h1>

          <p>
            Review, verify and manage startups registered on
            StartupSync.
          </p>
        </div>

        <div className="admin-startups-header-badge">
          <ShieldCheck size={18} />
          <span>Administrator Access</span>
        </div>
      </div>

      <div className="admin-startup-stats">
        <div className="admin-startup-stat-card">
          <div className="admin-startup-stat-icon">
            <Rocket size={20} />
          </div>

          <div>
            <span>Total Startups</span>
            <strong>{totalStartups}</strong>
          </div>
        </div>

        <div className="admin-startup-stat-card">
          <div className="admin-startup-stat-icon admin-startup-success">
            <Check size={20} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeStartups}</strong>
          </div>
        </div>

        <div className="admin-startup-stat-card">
          <div className="admin-startup-stat-icon admin-startup-warning">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Pending Review</span>
            <strong>{pendingStartups}</strong>
          </div>
        </div>

        <div className="admin-startup-stat-card">
          <div className="admin-startup-stat-icon admin-startup-verified">
            <Building2 size={20} />
          </div>

          <div>
            <span>Verified</span>
            <strong>{verifiedStartups}</strong>
          </div>
        </div>
      </div>

      <div className="admin-startups-card">
        <div className="admin-startups-toolbar">
          <div className="admin-startup-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search startups, founders, industries..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />
          </div>

          <button
            type="button"
            className={`admin-startup-filter-button ${
              showFilters
                ? "admin-startup-filter-active"
                : ""
            }`}
            onClick={() =>
              setShowFilters((current) => !current)
            }
          >
            <Filter size={17} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="admin-startups-filter-panel">
            <div className="admin-startup-filter-group">
              <label>Industry</label>

              <select
                value={industryFilter}
                onChange={(event) =>
                  setIndustryFilter(event.target.value)
                }
              >
                {industryFilters.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-startup-filter-group">
              <label>Stage</label>

              <select
                value={stageFilter}
                onChange={(event) =>
                  setStageFilter(event.target.value)
                }
              >
                {stageFilters.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-startup-filter-group">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="admin-startup-clear-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="admin-startups-grid">
          {filteredStartups.length > 0 ? (
            filteredStartups.map((startup) => (
              <article
                key={startup.id}
                className="admin-startup-card"
              >
                <div className="admin-startup-card-header">
                  <div className="admin-startup-logo">
                    <Rocket size={21} />
                  </div>

                  <div className="admin-startup-title">
                    <h2>{startup.name}</h2>

                    <span>{startup.industry}</span>
                  </div>

                  <span
                    className={`admin-startup-status admin-startup-status-${startup.status.toLowerCase()}`}
                  >
                    {startup.status}
                  </span>
                </div>

                <p className="admin-startup-description">
                  {startup.description}
                </p>

                <div className="admin-startup-meta">
                  <div>
                    <span>Founder</span>
                    <strong>{startup.founder}</strong>
                  </div>

                  <div>
                    <span>Stage</span>
                    <strong>{startup.stage}</strong>
                  </div>
                </div>

                <div className="admin-startup-details">
                  <span>
                    <MapPin size={14} />
                    {startup.location}
                  </span>

                  <span>
                    <Users size={14} />
                    {startup.teamSize} members
                  </span>

                  <span>
                    <IndianRupee size={14} />
                    {startup.fundingRequired}
                  </span>
                </div>

                <div className="admin-startup-card-footer">
                  <div className="admin-startup-verification">
                    <span
                      className={
                        startup.verified
                          ? "admin-verified-dot"
                          : "admin-pending-dot"
                      }
                    />

                    {startup.verified
                      ? "Verified"
                      : "Verification pending"}
                  </div>

                  <button
                    type="button"
                    className="admin-startup-view-button"
                    onClick={() =>
                      setSelectedStartup(startup)
                    }
                  >
                    View Details
                    <ChevronRight size={15} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="admin-startups-empty">
              <Search size={28} />

              <h2>No startups found</h2>

              <p>
                Try changing your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        <div className="admin-startups-footer">
          Showing <strong>{filteredStartups.length}</strong> of{" "}
          <strong>{startups.length}</strong> startups
        </div>
      </div>

      {selectedStartup && (
        <div
          className="admin-startup-modal-overlay"
          onClick={() => setSelectedStartup(null)}
        >
          <div
            className="admin-startup-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-startup-modal-header">
              <div className="admin-startup-modal-title">
                <div className="admin-startup-modal-logo">
                  <Rocket size={22} />
                </div>

                <div>
                  <h2>{selectedStartup.name}</h2>

                  <span>{selectedStartup.industry}</span>
                </div>
              </div>

              <button
                type="button"
                className="admin-startup-modal-close"
                onClick={() => setSelectedStartup(null)}
                aria-label="Close startup details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-startup-modal-status-row">
              <span
                className={`admin-startup-status admin-startup-status-${selectedStartup.status.toLowerCase()}`}
              >
                {selectedStartup.status}
              </span>

              <span
                className={
                  selectedStartup.verified
                    ? "admin-modal-verified"
                    : "admin-modal-pending"
                }
              >
                {selectedStartup.verified
                  ? "✓ Verified"
                  : "Verification Pending"}
              </span>
            </div>

            <p className="admin-startup-modal-description">
              {selectedStartup.description}
            </p>

            <div className="admin-startup-modal-grid">
              <div>
                <span>Founder</span>
                <strong>{selectedStartup.founder}</strong>
              </div>

              <div>
                <span>Industry</span>
                <strong>{selectedStartup.industry}</strong>
              </div>

              <div>
                <span>Startup Stage</span>
                <strong>{selectedStartup.stage}</strong>
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
                  <MapPin size={14} />
                  {selectedStartup.location}
                </strong>
              </div>

              <div>
                <span>Funding Required</span>
                <strong>
                  <IndianRupee size={14} />
                  {selectedStartup.fundingRequired}
                </strong>
              </div>

              <div>
                <span>Registered</span>
                <strong>{selectedStartup.joined}</strong>
              </div>
            </div>

            <div className="admin-startup-modal-actions">
              <button
                type="button"
                className="admin-startup-secondary-action"
                onClick={() =>
                  handleContactFounder(selectedStartup)
                }
              >
                <Mail size={16} />
                Contact Founder
              </button>

              {!selectedStartup.verified && (
                <button
                  type="button"
                  className="admin-startup-primary-action"
                  onClick={() =>
                    handleVerifyStartup(selectedStartup.id)
                  }
                >
                  <Check size={16} />
                  Verify Startup
                </button>
              )}

              {selectedStartup.verified && (
                <button
                  type="button"
                  className="admin-startup-danger-action"
                  onClick={() =>
                    handleToggleStatus(selectedStartup.id)
                  }
                >
                  {selectedStartup.status === "Suspended"
                    ? "Activate Startup"
                    : "Suspend Startup"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminStartups;