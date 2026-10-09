import {
  Bookmark,
  Check,
  ExternalLink,
  Filter,
  MapPin,
  Rocket,
  Search,
  UsersRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./InvestorDiscoverStartups.css";

const startups = [
  {
    id: 1,
    name: "FinFlow",
    tagline: "Simplifying financial management for growing businesses.",
    industry: "FinTech",
    stage: "Seed",
    fundingStage: "Seed",
    location: "Pune, Maharashtra",
    fundingSought: "₹75 Lakhs",
    teamSize: 8,
    founded: 2025,
    match: 94
  },
  {
    id: 2,
    name: "HealthNest",
    tagline: "Making preventive healthcare more accessible and affordable.",
    industry: "HealthTech",
    stage: "Pre-Seed",
    fundingStage: "Pre-Seed",
    location: "Bengaluru, Karnataka",
    fundingSought: "₹40 Lakhs",
    teamSize: 5,
    founded: 2026,
    match: 91
  },
  {
    id: 3,
    name: "AgriNova",
    tagline: "Smart farming solutions for modern Indian agriculture.",
    industry: "AgriTech",
    stage: "Seed",
    fundingStage: "Seed",
    location: "Nagpur, Maharashtra",
    fundingSought: "₹1.2 Crore",
    teamSize: 11,
    founded: 2024,
    match: 89
  },
  {
    id: 4,
    name: "EduBridge",
    tagline: "Connecting students with practical career opportunities.",
    industry: "EdTech",
    stage: "Growth",
    fundingStage: "Series A",
    location: "Mumbai, Maharashtra",
    fundingSought: "₹3 Crore",
    teamSize: 24,
    founded: 2023,
    match: 86
  },
  {
    id: 5,
    name: "GreenGrid",
    tagline: "Building smarter energy solutions for sustainable communities.",
    industry: "CleanTech",
    stage: "Seed",
    fundingStage: "Seed",
    location: "Hyderabad, Telangana",
    fundingSought: "₹90 Lakhs",
    teamSize: 12,
    founded: 2024,
    match: 84
  },
  {
    id: 6,
    name: "ShopSphere",
    tagline: "Helping local retailers build stronger digital businesses.",
    industry: "E-Commerce",
    stage: "Pre-Seed",
    fundingStage: "Pre-Seed",
    location: "Kolhapur, Maharashtra",
    fundingSought: "₹30 Lakhs",
    teamSize: 6,
    founded: 2026,
    match: 81
  }
];

const industryOptions = [
  "All Industries",
  "FinTech",
  "HealthTech",
  "AgriTech",
  "EdTech",
  "CleanTech",
  "E-Commerce"
];

const stageOptions = [
  "All Stages",
  "Pre-Seed",
  "Seed",
  "Growth"
];

const fundingOptions = [
  "All Funding Stages",
  "Pre-Seed",
  "Seed",
  "Series A"
];

const locationOptions = [
  "All Locations",
  "Maharashtra",
  "Karnataka",
  "Telangana"
];

function InvestorDiscoverStartups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [stage, setStage] = useState("All Stages");
  const [fundingStage, setFundingStage] =
    useState("All Funding Stages");
  const [location, setLocation] = useState("All Locations");

  const [savedStartups, setSavedStartups] = useState([]);
  const [connectedStartups, setConnectedStartups] = useState([]);

  const filteredStartups = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return startups.filter((startup) => {
      const matchesSearch =
        !search ||
        startup.name.toLowerCase().includes(search) ||
        startup.tagline.toLowerCase().includes(search) ||
        startup.industry.toLowerCase().includes(search) ||
        startup.location.toLowerCase().includes(search);

      const matchesIndustry =
        industry === "All Industries" ||
        startup.industry === industry;

      const matchesStage =
        stage === "All Stages" ||
        startup.stage === stage;

      const matchesFunding =
        fundingStage === "All Funding Stages" ||
        startup.fundingStage === fundingStage;

      const matchesLocation =
        location === "All Locations" ||
        startup.location.includes(location);

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesStage &&
        matchesFunding &&
        matchesLocation
      );
    });
  }, [
    searchTerm,
    industry,
    stage,
    fundingStage,
    location
  ]);

  const toggleSave = (startupId) => {
    setSavedStartups((current) =>
      current.includes(startupId)
        ? current.filter((id) => id !== startupId)
        : [...current, startupId]
    );
  };

  const toggleConnect = (startupId) => {
    setConnectedStartups((current) =>
      current.includes(startupId)
        ? current.filter((id) => id !== startupId)
        : [...current, startupId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setIndustry("All Industries");
    setStage("All Stages");
    setFundingStage("All Funding Stages");
    setLocation("All Locations");
  };

  const hasFilters =
    searchTerm ||
    industry !== "All Industries" ||
    stage !== "All Stages" ||
    fundingStage !== "All Funding Stages" ||
    location !== "All Locations";

  return (
    <div className="investor-discover-page">

      {/* Page Header */}
      <section className="investor-discover-header">
        <div>
          <span className="investor-discover-badge">
            <Rocket size={15} />
            Startup Discovery
          </span>

          <h2>Discover Startups</h2>

          <p>
            Explore promising startups, review their profiles,
            and discover investment opportunities that match
            your preferences.
          </p>
        </div>

        <div className="investor-discover-summary">
          <strong>{filteredStartups.length}</strong>
          <span>Startups Found</span>
        </div>
      </section>

      {/* Search */}
      <section className="investor-search-panel">

        <div className="investor-search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search startups, industries or locations..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              className="investor-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        <div className="investor-filter-title">
          <Filter size={17} />
          <span>Filters</span>
        </div>

        <div className="investor-filter-grid">

          <select
            value={industry}
            onChange={(event) =>
              setIndustry(event.target.value)
            }
          >
            {industryOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={stage}
            onChange={(event) =>
              setStage(event.target.value)
            }
          >
            {stageOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={fundingStage}
            onChange={(event) =>
              setFundingStage(event.target.value)
            }
          >
            {fundingOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
          >
            {locationOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="investor-clear-filters"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Startup Cards */}
      {filteredStartups.length > 0 ? (
        <section className="investor-startup-grid">
          {filteredStartups.map((startup) => {
            const isSaved = savedStartups.includes(startup.id);
            const isConnected =
              connectedStartups.includes(startup.id);

            return (
              <article
                className="investor-startup-card"
                key={startup.id}
              >

                <div className="startup-card-top">

                  <div className="startup-logo">
                    <Rocket size={23} />
                  </div>

                  <div className="startup-card-title">
                    <h3>{startup.name}</h3>

                    <span>{startup.industry}</span>
                  </div>

                  <button
                    type="button"
                    className={`startup-save-button ${
                      isSaved
                        ? "startup-save-active"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSave(startup.id)
                    }
                    aria-label={
                      isSaved
                        ? "Remove from saved startups"
                        : "Save startup"
                    }
                  >
                    <Bookmark
                      size={19}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="startup-match">
                  <span>Profile Match</span>
                  <strong>{startup.match}%</strong>
                </div>

                <p className="startup-tagline">
                  {startup.tagline}
                </p>

                <div className="startup-details">

                  <div className="startup-detail">
                    <MapPin size={16} />
                    <span>{startup.location}</span>
                  </div>

                  <div className="startup-detail">
                    <UsersRound size={16} />
                    <span>
                      {startup.teamSize} team members
                    </span>
                  </div>

                  <div className="startup-detail">
                    <span className="startup-detail-label">
                      Stage
                    </span>
                    <span>{startup.stage}</span>
                  </div>

                  <div className="startup-detail">
                    <span className="startup-detail-label">
                      Funding
                    </span>
                    <span>{startup.fundingSought}</span>
                  </div>

                  <div className="startup-detail">
                    <span className="startup-detail-label">
                      Founded
                    </span>
                    <span>{startup.founded}</span>
                  </div>
                </div>

                <div className="startup-card-actions">

                  <button
                    type="button"
                    className="btn btn-secondary startup-view-button"
                    onClick={() =>
                      alert(
                        `Startup profile for ${startup.name} will be connected to the backend later.`
                      )
                    }
                  >
                    View Profile
                    <ExternalLink size={16} />
                  </button>

                  <button
                    type="button"
                    className={`btn startup-connect-button ${
                      isConnected
                        ? "startup-connected"
                        : "btn-primary"
                    }`}
                    onClick={() =>
                      toggleConnect(startup.id)
                    }
                  >
                    {isConnected ? (
                      <>
                        <Check size={16} />
                        Interest Sent
                      </>
                    ) : (
                      "Express Interest"
                    )}
                  </button>

                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="investor-empty-state">

          <div className="investor-empty-icon">
            <Search size={28} />
          </div>

          <h3>No startups found</h3>

          <p>
            We couldn't find startups matching your current
            search and filters.
          </p>

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

export default InvestorDiscoverStartups;