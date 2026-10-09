import {
  Bookmark,
  Check,
  Filter,
  MapPin,
  Search,
  UsersRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./MentorStartups.css";

const startupData = [
  {
    id: 1,
    name: "FinFlow",
    tagline: "Simplifying financial management for growing businesses",
    industry: "FinTech",
    stage: "Seed",
    location: "Pune, Maharashtra",
    teamSize: 6,
    founded: 2024,
    needs: ["Business Strategy", "Fundraising", "Product Growth"],
    description:
      "FinFlow is building a digital platform that helps startups manage financial operations and make better business decisions.",
    match: 95
  },
  {
    id: 2,
    name: "HealthNest",
    tagline: "Accessible digital healthcare for everyone",
    industry: "HealthTech",
    stage: "Pre-Seed",
    location: "Mumbai, Maharashtra",
    teamSize: 4,
    founded: 2025,
    needs: ["Product Strategy", "Market Research", "Go-to-Market"],
    description:
      "HealthNest is developing a technology-driven healthcare platform focused on improving access to essential healthcare services.",
    match: 91
  },
  {
    id: 3,
    name: "AgriNova",
    tagline: "Technology solutions for smarter agriculture",
    industry: "AgriTech",
    stage: "Seed",
    location: "Nagpur, Maharashtra",
    teamSize: 8,
    founded: 2023,
    needs: ["Business Development", "Operations", "Fundraising"],
    description:
      "AgriNova connects agricultural stakeholders with technology-enabled tools for better productivity and resource management.",
    match: 88
  },
  {
    id: 4,
    name: "EduBridge",
    tagline: "Connecting students with practical career opportunities",
    industry: "EdTech",
    stage: "Growth",
    location: "Bengaluru, Karnataka",
    teamSize: 12,
    founded: 2022,
    needs: ["Scaling", "Marketing Strategy", "Leadership"],
    description:
      "EduBridge helps students discover practical learning and career opportunities through a centralized digital platform.",
    match: 86
  },
  {
    id: 5,
    name: "GreenGrid",
    tagline: "Building smarter solutions for sustainable energy",
    industry: "CleanTech",
    stage: "Pre-Seed",
    location: "Hyderabad, Telangana",
    teamSize: 5,
    founded: 2025,
    needs: ["Technology Strategy", "Fundraising", "Partnerships"],
    description:
      "GreenGrid is working on technology solutions designed to support more efficient and sustainable energy usage.",
    match: 83
  },
  {
    id: 6,
    name: "ShopSphere",
    tagline: "Helping local businesses grow online",
    industry: "E-Commerce",
    stage: "Seed",
    location: "Kolhapur, Maharashtra",
    teamSize: 7,
    founded: 2024,
    needs: ["Marketing", "Customer Acquisition", "Business Strategy"],
    description:
      "ShopSphere provides digital tools that help small and local businesses establish and grow their online presence.",
    match: 80
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
  "Idea",
  "Pre-Seed",
  "Seed",
  "Growth"
];

const needOptions = [
  "All Needs",
  "Business Strategy",
  "Fundraising",
  "Product Strategy",
  "Marketing",
  "Technology Strategy",
  "Operations"
];

function MentorStartups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All Industries");
  const [stage, setStage] = useState("All Stages");
  const [need, setNeed] = useState("All Needs");

  const [savedStartups, setSavedStartups] = useState([]);
  const [requestedStartups, setRequestedStartups] = useState([]);

  const filteredStartups = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return startupData.filter((startup) => {
      const matchesSearch =
        !normalizedSearch ||
        startup.name.toLowerCase().includes(normalizedSearch) ||
        startup.tagline.toLowerCase().includes(normalizedSearch) ||
        startup.industry.toLowerCase().includes(normalizedSearch) ||
        startup.needs.some((item) =>
          item.toLowerCase().includes(normalizedSearch)
        );

      const matchesIndustry =
        industry === "All Industries" ||
        startup.industry === industry;

      const matchesStage =
        stage === "All Stages" ||
        startup.stage === stage;

      const matchesNeed =
        need === "All Needs" ||
        startup.needs.includes(need);

      return (
        matchesSearch &&
        matchesIndustry &&
        matchesStage &&
        matchesNeed
      );
    });
  }, [searchTerm, industry, stage, need]);

  const toggleSaved = (startupId) => {
    setSavedStartups((current) =>
      current.includes(startupId)
        ? current.filter((id) => id !== startupId)
        : [...current, startupId]
    );
  };

  const toggleRequest = (startupId) => {
    setRequestedStartups((current) =>
      current.includes(startupId)
        ? current.filter((id) => id !== startupId)
        : [...current, startupId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setIndustry("All Industries");
    setStage("All Stages");
    setNeed("All Needs");
  };

  const hasFilters =
    searchTerm ||
    industry !== "All Industries" ||
    stage !== "All Stages" ||
    need !== "All Needs";

  return (
    <div className="mentor-startups-page">
      <section className="mentor-startups-header">
        <div>
          <span className="mentor-startups-badge">
            Startup Discovery
          </span>

          <h2>Discover Startups</h2>

          <p>
            Find startups that match your expertise and discover
            opportunities to provide meaningful mentorship.
          </p>
        </div>

        <div className="mentor-startups-summary">
          <strong>{filteredStartups.length}</strong>
          <span>Startups Found</span>
        </div>
      </section>

      <section className="mentor-startups-toolbar">
        <div className="mentor-startups-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search startups, industries or mentoring needs..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="mentor-startups-filter-icon">
          <Filter size={18} />
          <span>Filters</span>
        </div>

        <select
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
        >
          {industryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={stage}
          onChange={(event) => setStage(event.target.value)}
        >
          {stageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={need}
          onChange={(event) => setNeed(event.target.value)}
        >
          {needOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            className="mentor-startups-clear"
            onClick={clearFilters}
          >
            <X size={16} />
            Clear
          </button>
        )}
      </section>

      {filteredStartups.length > 0 ? (
        <section className="mentor-startups-grid">
          {filteredStartups.map((startup) => {
            const isSaved = savedStartups.includes(startup.id);
            const isRequested = requestedStartups.includes(startup.id);

            return (
              <article
                className="mentor-startup-card"
                key={startup.id}
              >
                <div className="mentor-startup-card-top">
                  <div className="mentor-startup-logo">
                    {startup.name.charAt(0)}
                  </div>

                  <div className="mentor-startup-match">
                    {startup.match}% Match
                  </div>
                </div>

                <div className="mentor-startup-main">
                  <h3>{startup.name}</h3>

                  <p className="mentor-startup-tagline">
                    {startup.tagline}
                  </p>

                  <div className="mentor-startup-meta">
                    <span>{startup.industry}</span>
                    <span>{startup.stage}</span>
                  </div>

                  <div className="mentor-startup-location">
                    <MapPin size={15} />
                    {startup.location}
                  </div>

                  <p className="mentor-startup-description">
                    {startup.description}
                  </p>

                  <div className="mentor-startup-needs">
                    <h4>Looking for mentorship in</h4>

                    <div className="mentor-startup-tags">
                      {startup.needs.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mentor-startup-details">
                    <div>
                      <UsersRound size={16} />
                      <span>
                        {startup.teamSize} team members
                      </span>
                    </div>

                    <div>
                      <span className="mentor-startup-detail-dot" />
                      <span>Founded {startup.founded}</span>
                    </div>
                  </div>
                </div>

                <div className="mentor-startup-actions">
                  <button
                    type="button"
                    className={`mentor-startup-save ${
                      isSaved ? "saved" : ""
                    }`}
                    onClick={() => toggleSaved(startup.id)}
                    aria-label={
                      isSaved
                        ? "Remove from saved startups"
                        : "Save startup"
                    }
                  >
                    <Bookmark
                      size={18}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    className="mentor-startup-view"
                    onClick={() =>
                      alert(
                        `Startup profile for ${startup.name} will be connected to the backend later.`
                      )
                    }
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    className={`mentor-startup-request ${
                      isRequested ? "requested" : ""
                    }`}
                    onClick={() => toggleRequest(startup.id)}
                  >
                    {isRequested ? (
                      <>
                        <Check size={17} />
                        Request Sent
                      </>
                    ) : (
                      "Offer Mentorship"
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="mentor-startups-empty">
          <div className="mentor-startups-empty-icon">
            <Search size={28} />
          </div>

          <h3>No startups found</h3>

          <p>
            Try changing your search or filters to discover
            more startups.
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

export default MentorStartups;