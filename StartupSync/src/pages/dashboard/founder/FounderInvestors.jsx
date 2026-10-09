import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Filter,
  MapPin,
  Search,
  TrendingUp,
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";

import "./FounderInvestors.css";

const investors = [
  {
    id: 1,
    name: "Arjun Capital",
    type: "Angel Investor",
    location: "Mumbai, Maharashtra",
    stages: ["Pre-Seed", "Seed"],
    range: "₹25–50 Lakhs",
    industries: ["Technology", "SaaS", "AI"],
    connections: 34,
    match: 94
  },
  {
    id: 2,
    name: "NextWave Ventures",
    type: "Venture Capital",
    location: "Bengaluru, Karnataka",
    stages: ["Seed", "Series A"],
    range: "₹50 Lakhs–₹1 Crore",
    industries: ["SaaS", "FinTech", "Technology"],
    connections: 82,
    match: 91
  },
  {
    id: 3,
    name: "Innovation Growth Fund",
    type: "Venture Capital",
    location: "Pune, Maharashtra",
    stages: ["Seed", "Series A"],
    range: "₹1 Crore+",
    industries: ["Technology", "AI", "Healthcare"],
    connections: 57,
    match: 88
  },
  {
    id: 4,
    name: "Rahul Mehta",
    type: "Individual Investor",
    location: "Delhi, India",
    stages: ["Idea", "Pre-Seed"],
    range: "₹5–25 Lakhs",
    industries: ["EdTech", "Technology", "SaaS"],
    connections: 26,
    match: 86
  },
  {
    id: 5,
    name: "LaunchBridge Capital",
    type: "Corporate Investor",
    location: "Hyderabad, Telangana",
    stages: ["Seed", "Growth"],
    range: "₹50 Lakhs–₹1 Crore",
    industries: ["Technology", "Enterprise", "SaaS"],
    connections: 71,
    match: 84
  },
  {
    id: 6,
    name: "FutureFounders Network",
    type: "Angel Investor",
    location: "Chennai, Tamil Nadu",
    stages: ["Pre-Seed", "Seed"],
    range: "₹25–50 Lakhs",
    industries: ["Technology", "Consumer", "AI"],
    connections: 43,
    match: 81
  }
];

function FounderInvestors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [rangeFilter, setRangeFilter] = useState("All");
  const [connectedInvestors, setConnectedInvestors] = useState([]);

  const filteredInvestors = useMemo(() => {
    return investors.filter((investor) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        investor.name.toLowerCase().includes(search) ||
        investor.type.toLowerCase().includes(search) ||
        investor.location.toLowerCase().includes(search) ||
        investor.industries.some((industry) =>
          industry.toLowerCase().includes(search)
        );

      const matchesType =
        typeFilter === "All" ||
        investor.type === typeFilter;

      const matchesStage =
        stageFilter === "All" ||
        investor.stages.includes(stageFilter);

      const matchesRange =
        rangeFilter === "All" ||
        investor.range === rangeFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStage &&
        matchesRange
      );
    });
  }, [
    searchTerm,
    typeFilter,
    stageFilter,
    rangeFilter
  ]);

  const handleConnect = (investorId) => {
    setConnectedInvestors((current) =>
      current.includes(investorId)
        ? current
        : [...current, investorId]
    );
  };

  return (
    <div className="founder-investors-page">

      {/* Header */}
      <section className="founder-investors-header">
        <div>
          <span className="founder-investors-badge">
            Investor Discovery
          </span>

          <h2>Find Investors</h2>

          <p>
            Discover investors who match your startup's
            industry, stage and funding requirements.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="founder-investors-filters">

        <div className="founder-investors-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search investors, industries or locations..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="founder-investors-filter-row">

          <div className="founder-investors-filter">
            <Filter size={15} />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="All">All Investor Types</option>
              <option value="Angel Investor">
                Angel Investor
              </option>
              <option value="Venture Capital">
                Venture Capital
              </option>
              <option value="Corporate Investor">
                Corporate Investor
              </option>
              <option value="Individual Investor">
                Individual Investor
              </option>
            </select>
          </div>

          <div className="founder-investors-filter">
            <TrendingUp size={15} />

            <select
              value={stageFilter}
              onChange={(event) =>
                setStageFilter(event.target.value)
              }
            >
              <option value="All">All Stages</option>
              <option value="Idea">Idea</option>
              <option value="Pre-Seed">Pre-Seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Growth">Growth</option>
            </select>
          </div>

          <div className="founder-investors-filter">
            <Building2 size={15} />

            <select
              value={rangeFilter}
              onChange={(event) =>
                setRangeFilter(event.target.value)
              }
            >
              <option value="All">All Investment Ranges</option>
              <option value="₹5–25 Lakhs">
                ₹5–25 Lakhs
              </option>
              <option value="₹25–50 Lakhs">
                ₹25–50 Lakhs
              </option>
              <option value="₹50 Lakhs–₹1 Crore">
                ₹50 Lakhs–₹1 Crore
              </option>
              <option value="₹1 Crore+">
                ₹1 Crore+
              </option>
            </select>
          </div>

        </div>
      </section>

      {/* Result Summary */}
      <div className="founder-investors-results-header">
        <div>
          <h3>Recommended Investors</h3>
          <p>
            {filteredInvestors.length} investor
            {filteredInvestors.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Investor Cards */}
      {filteredInvestors.length > 0 ? (
        <section className="founder-investors-grid">
          {filteredInvestors.map((investor) => {
            const isConnected =
              connectedInvestors.includes(investor.id);

            return (
              <article
                className="founder-investor-card"
                key={investor.id}
              >

                <div className="founder-investor-card-top">

                  <div className="founder-investor-avatar">
                    {investor.name.charAt(0)}
                  </div>

                  <div className="founder-investor-heading">
                    <h4>{investor.name}</h4>

                    <span>{investor.type}</span>
                  </div>

                  <div className="founder-investor-match">
                    <strong>{investor.match}%</strong>
                    <span>Match</span>
                  </div>

                </div>

                <div className="founder-investor-location">
                  <MapPin size={14} />
                  {investor.location}
                </div>

                <div className="founder-investor-details">

                  <div>
                    <span>Investment Range</span>
                    <strong>{investor.range}</strong>
                  </div>

                  <div>
                    <span>Startup Stages</span>
                    <strong>
                      {investor.stages.join(" • ")}
                    </strong>
                  </div>

                </div>

                <div className="founder-investor-industries">
                  {investor.industries.map((industry) => (
                    <span key={industry}>
                      {industry}
                    </span>
                  ))}
                </div>

                <div className="founder-investor-network">
                  <UsersRound size={15} />
                  <span>
                    {investor.connections} ecosystem
                    connections
                  </span>
                </div>

                <div className="founder-investor-actions">

                  <button
                    type="button"
                    className="founder-investor-view-button"
                  >
                    View Profile
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    className={`founder-investor-connect-button ${
                      isConnected
                        ? "founder-investor-connected"
                        : ""
                    }`}
                    onClick={() =>
                      handleConnect(investor.id)
                    }
                    disabled={isConnected}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 size={15} />
                        Request Sent
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>

                </div>

              </article>
            );
          })}
        </section>
      ) : (
        <section className="founder-investors-empty">
          <div className="founder-investors-empty-icon">
            <Search size={25} />
          </div>

          <h3>No investors found</h3>

          <p>
            Try changing your search or filter criteria.
          </p>
        </section>
      )}

    </div>
  );
}

export default FounderInvestors;