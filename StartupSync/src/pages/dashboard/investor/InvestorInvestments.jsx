import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  IndianRupee,
  Search,
  TrendingUp,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./InvestorInvestments.css";

const initialInvestments = [
  {
    id: 1,
    startup: "FinFlow Technologies",
    initials: "FT",
    industry: "FinTech",
    stage: "Seed",
    investedAmount: 1500000,
    currentValue: 2100000,
    ownership: "3.5%",
    investedDate: "12 March 2026",
    status: "Active",
    growth: 40,
    description:
      "Digital financial infrastructure platform helping small businesses manage payments, cash flow and business finance.",
    location: "Bengaluru, India",
    founders: "Arjun Mehta & Team",
    nextMilestone: "Series A preparation"
  },
  {
    id: 2,
    startup: "AgriNova Labs",
    initials: "AL",
    industry: "AgriTech",
    stage: "Pre-Seed",
    investedAmount: 800000,
    currentValue: 1120000,
    ownership: "5.0%",
    investedDate: "24 February 2026",
    status: "Active",
    growth: 40,
    description:
      "Technology platform connecting farmers with data-driven crop planning and agricultural resources.",
    location: "Pune, India",
    founders: "Rohan Kulkarni & Team",
    nextMilestone: "Pilot expansion"
  },
  {
    id: 3,
    startup: "HealthNest Innovations",
    initials: "HI",
    industry: "HealthTech",
    stage: "Seed",
    investedAmount: 2000000,
    currentValue: 2640000,
    ownership: "4.2%",
    investedDate: "08 January 2026",
    status: "Active",
    growth: 32,
    description:
      "Digital healthcare platform focused on simplifying access to preventive health services.",
    location: "Mumbai, India",
    founders: "Neha Shah & Team",
    nextMilestone: "Market expansion"
  },
  {
    id: 4,
    startup: "GreenGrid Systems",
    initials: "GS",
    industry: "CleanTech",
    stage: "Growth",
    investedAmount: 3000000,
    currentValue: 4200000,
    ownership: "2.8%",
    investedDate: "18 November 2025",
    status: "Active",
    growth: 40,
    description:
      "Clean energy technology company building intelligent energy monitoring and optimization solutions.",
    location: "Hyderabad, India",
    founders: "Vikram Deshmukh & Team",
    nextMilestone: "International expansion"
  },
  {
    id: 5,
    startup: "EduBridge",
    initials: "EB",
    industry: "EdTech",
    stage: "Seed",
    investedAmount: 1000000,
    currentValue: 920000,
    ownership: "3.0%",
    investedDate: "02 September 2025",
    status: "Monitoring",
    growth: -8,
    description:
      "Career development platform connecting students with learning, internship and employment opportunities.",
    location: "Delhi, India",
    founders: "Ananya Kulkarni & Team",
    nextMilestone: "Product restructuring"
  },
  {
    id: 6,
    startup: "CloudMesh Solutions",
    initials: "CM",
    industry: "SaaS",
    stage: "Pre-Seed",
    investedAmount: 600000,
    currentValue: 810000,
    ownership: "4.5%",
    investedDate: "14 July 2025",
    status: "Exited",
    growth: 35,
    description:
      "Cloud infrastructure management platform designed for growing technology teams.",
    location: "Noida, India",
    founders: "Karan Malhotra & Team",
    nextMilestone: "Investment exited"
  }
];

const filterOptions = [
  "All",
  "Active",
  "Monitoring",
  "Exited"
];

function formatCurrency(amount) {
  return `₹${(amount / 100000).toFixed(1)}L`;
}

function InvestorInvestments() {
  const [investments, setInvestments] = useState(
    initialInvestments
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedInvestment, setSelectedInvestment] =
    useState(null);

  const totalInvested = investments.reduce(
    (total, investment) =>
      total + investment.investedAmount,
    0
  );

  const currentValue = investments.reduce(
    (total, investment) =>
      total + investment.currentValue,
    0
  );

  const totalGrowth =
    totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;

  const activeInvestments = investments.filter(
    (investment) => investment.status === "Active"
  ).length;

  const filteredInvestments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return investments.filter((investment) => {
      const matchesFilter =
        activeFilter === "All" ||
        investment.status === activeFilter;

      const matchesSearch =
        !search ||
        investment.startup
          .toLowerCase()
          .includes(search) ||
        investment.industry
          .toLowerCase()
          .includes(search) ||
        investment.stage
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [investments, searchTerm, activeFilter]);

  const handleViewInvestment = (investment) => {
    setSelectedInvestment(investment);
  };

  const handleRemoveInvestment = (id) => {
    setInvestments((current) =>
      current.filter(
        (investment) => investment.id !== id
      )
    );

    setSelectedInvestment(null);
  };

  return (
    <section className="investor-investments-page">
      {/* Header */}

      <div className="investor-investments-header">
        <div>
          <span className="investor-investments-badge">
            Portfolio Management
          </span>

          <h2>My Investments</h2>

          <p>
            Track your startup portfolio, investment performance
            and current holdings.
          </p>
        </div>
      </div>

      {/* Portfolio Stats */}

      <div className="investor-portfolio-stats">
        <div className="investor-portfolio-stat-card">
          <div className="investor-portfolio-stat-icon">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Total Invested</span>
            <strong>{formatCurrency(totalInvested)}</strong>
          </div>
        </div>

        <div className="investor-portfolio-stat-card">
          <div className="investor-portfolio-stat-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Current Value</span>
            <strong>{formatCurrency(currentValue)}</strong>
          </div>
        </div>

        <div className="investor-portfolio-stat-card">
          <div className="investor-portfolio-stat-icon">
            <BarChart3 size={19} />
          </div>

          <div>
            <span>Portfolio Growth</span>
            <strong className="investor-growth-positive">
              +{totalGrowth.toFixed(1)}%
            </strong>
          </div>
        </div>

        <div className="investor-portfolio-stat-card">
          <div className="investor-portfolio-stat-icon">
            <Building2 size={19} />
          </div>

          <div>
            <span>Active Investments</span>
            <strong>{activeInvestments}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}

      <div className="investor-investments-toolbar">
        <div className="investor-investment-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search startups, industries or stages..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="investor-investment-filters">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? "investor-investment-filter-active"
                  : ""
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Result Heading */}

      <div className="investor-investments-result-heading">
        <div>
          <h3>Investment Portfolio</h3>

          <p>
            {filteredInvestments.length} investment
            {filteredInvestments.length !== 1
              ? "s"
              : ""}{" "}
            displayed
          </p>
        </div>
      </div>

      {/* Investment Cards */}

      {filteredInvestments.length > 0 ? (
        <div className="investor-investments-grid">
          {filteredInvestments.map((investment) => {
            const isPositive = investment.growth >= 0;

            return (
              <article
                key={investment.id}
                className="investor-investment-card"
              >
                <div className="investor-investment-card-header">
                  <div className="investor-investment-startup">
                    <div className="investor-investment-logo">
                      {investment.initials}
                    </div>

                    <div>
                      <h4>{investment.startup}</h4>

                      <span>
                        {investment.industry}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`investor-investment-status investor-status-${investment.status.toLowerCase()}`}
                  >
                    {investment.status}
                  </span>
                </div>

                <div className="investor-investment-stage">
                  <span>Stage</span>
                  <strong>{investment.stage}</strong>
                </div>

                <div className="investor-investment-values">
                  <div>
                    <span>Invested</span>
                    <strong>
                      {formatCurrency(
                        investment.investedAmount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Current Value</span>
                    <strong>
                      {formatCurrency(
                        investment.currentValue
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Ownership</span>
                    <strong>{investment.ownership}</strong>
                  </div>
                </div>

                <div className="investor-investment-performance">
                  <div>
                    <span>Performance</span>

                    <strong
                      className={
                        isPositive
                          ? "investor-growth-positive"
                          : "investor-growth-negative"
                      }
                    >
                      {isPositive ? "+" : ""}
                      {investment.growth}%
                    </strong>
                  </div>

                  <div className="investor-performance-track">
                    <span
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Math.abs(investment.growth),
                            8
                          ),
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="investor-investment-meta">
                  <span>
                    <CalendarDays size={13} />
                    {investment.investedDate}
                  </span>

                  <span>
                    <CircleDollarSign size={13} />
                    {investment.ownership}
                  </span>
                </div>

                <button
                  type="button"
                  className="investor-investment-view-button"
                  onClick={() =>
                    handleViewInvestment(investment)
                  }
                >
                  View Investment
                  <ChevronRight size={15} />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="investor-investments-empty">
          <div className="investor-investments-empty-icon">
            <Search size={22} />
          </div>

          <h3>No investments found</h3>

          <p>
            Try changing your search term or investment status
            filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("All");
            }}
          >
            View all investments
          </button>
        </div>
      )}

      {/* Investment Modal */}

      {selectedInvestment && (
        <div
          className="investor-investment-modal-overlay"
          onClick={() => setSelectedInvestment(null)}
        >
          <div
            className="investor-investment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="investor-investment-modal-header">
              <div className="investor-investment-modal-title">
                <div className="investor-investment-logo">
                  {selectedInvestment.initials}
                </div>

                <div>
                  <h3>{selectedInvestment.startup}</h3>
                  <span>
                    {selectedInvestment.industry} ·{" "}
                    {selectedInvestment.stage}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="investor-investment-modal-close"
                onClick={() =>
                  setSelectedInvestment(null)
                }
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="investor-investment-modal-body">
              <p className="investor-investment-description">
                {selectedInvestment.description}
              </p>

              <div className="investor-investment-detail-grid">
                <div>
                  <span>Invested Amount</span>
                  <strong>
                    {formatCurrency(
                      selectedInvestment.investedAmount
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current Value</span>
                  <strong>
                    {formatCurrency(
                      selectedInvestment.currentValue
                    )}
                  </strong>
                </div>

                <div>
                  <span>Ownership</span>
                  <strong>
                    {selectedInvestment.ownership}
                  </strong>
                </div>

                <div>
                  <span>Performance</span>
                  <strong
                    className={
                      selectedInvestment.growth >= 0
                        ? "investor-growth-positive"
                        : "investor-growth-negative"
                    }
                  >
                    {selectedInvestment.growth >= 0
                      ? "+"
                      : ""}
                    {selectedInvestment.growth}%
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedInvestment.location}
                  </strong>
                </div>

                <div>
                  <span>Founders</span>
                  <strong>
                    {selectedInvestment.founders}
                  </strong>
                </div>
              </div>

              <div className="investor-investment-milestone">
                <span>Next Milestone</span>
                <strong>
                  {selectedInvestment.nextMilestone}
                </strong>
              </div>
            </div>

            <div className="investor-investment-modal-actions">
              <button
                type="button"
                className="investor-modal-close-button"
                onClick={() =>
                  setSelectedInvestment(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="investor-modal-details-button"
                onClick={() =>
                  window.alert(
                    "Detailed investment analytics will be connected with the backend later."
                  )
                }
              >
                <ArrowUpRight size={15} />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default InvestorInvestments;