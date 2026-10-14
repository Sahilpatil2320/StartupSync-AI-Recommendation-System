
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
import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./InvestorInvestments.css";

const filterOptions = ["All", "Active", "Monitoring", "Exited"];

const formatCurrency = (amount = 0) => {
  const value = Number(amount) || 0;

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const getRecords = (responseData) => {
  if (Array.isArray(responseData)) return responseData;

  return (
    responseData?.investments ||
    responseData?.data?.investments ||
    responseData?.data ||
    responseData?.records ||
    []
  );
};

const normalizeInvestment = (record) => {
  const startupProfile =
    record.startup ||
    record.founder ||
    record.startupProfile ||
    {};

  const investedAmount = Number(
    record.investedAmount ??
    record.amountInvested ??
    record.amount ??
    record.investmentAmount ??
    0
  );

  const currentValue = Number(
    record.currentValue ??
    record.currentValuation ??
    record.valuation ??
    investedAmount
  );

  const growth =
    investedAmount > 0
      ? ((currentValue - investedAmount) / investedAmount) * 100
      : 0;

  const name =
    typeof startupProfile === "string"
      ? startupProfile
      : startupProfile.startupName ||
        startupProfile.name ||
        startupProfile.companyName ||
        record.startupName ||
        record.companyName ||
        record.name ||
        "Startup";

  const statusValue = String(record.status || "Active");
  const normalizedStatus = {
    active: "Active",
    monitoring: "Monitoring",
    exited: "Exited"
  }[statusValue.toLowerCase()] || statusValue;

  const id =
    record._id ||
    record.id ||
    record.investmentId ||
    `${name}-${record.createdAt || record.investedDate || ""}`;

  const founder =
    typeof startupProfile === "object"
      ? startupProfile.founder ||
        startupProfile.founderName ||
        startupProfile.ownerName ||
        ""
      : "";

  return {
    id,
    startup: name,
    initials: name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    industry:
      record.industry ||
      startupProfile.industry ||
      startupProfile.domain ||
      "Not specified",
    stage:
      record.stage ||
      startupProfile.stage ||
      startupProfile.fundingStage ||
      "Not specified",
    investedAmount,
    currentValue,
    ownership:
      record.ownershipPercentage != null
        ? `${record.ownershipPercentage}%`
        : record.ownership != null
          ? String(record.ownership).includes("%")
            ? String(record.ownership)
            : `${record.ownership}%`
          : "Not provided",
    investedDate: formatDate(
      record.investedDate ||
      record.investmentDate ||
      record.createdAt
    ),
    status: normalizedStatus,
    growth: Number.isFinite(growth) ? growth : 0,
    description:
      record.description ||
      startupProfile.description ||
      startupProfile.problemStatement ||
      "No startup description has been provided.",
    location:
      record.location ||
      startupProfile.location ||
      startupProfile.city ||
      "Not provided",
    founders:
      typeof founder === "string"
        ? founder
        : founder?.name || "Not provided",
    nextMilestone:
      record.nextMilestone ||
      startupProfile.nextMilestone ||
      "Not provided"
  };
};

function InvestorInvestments() {
  const [investments, setInvestments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("startupsync_token");

      if (!token) {
        throw new Error("Please log in to view your investments.");
      }

      const response = await api.get("/investments/mine", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const records = getRecords(response.data);

      if (!Array.isArray(records)) {
        throw new Error(
          "The investment API returned an unexpected response."
        );
      }

      setInvestments(records.map(normalizeInvestment));
    } catch (err) {
      console.error("Unable to load investments:", err);
      setInvestments([]);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load investments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const totalInvested = investments.reduce(
    (total, investment) => total + investment.investedAmount,
    0
  );

  const currentValue = investments.reduce(
    (total, investment) => total + investment.currentValue,
    0
  );

  const totalGrowth =
    totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;

  const activeInvestments = investments.filter(
    (investment) => investment.status.toLowerCase() === "active"
  ).length;

  const filteredInvestments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return investments.filter((investment) => {
      const matchesFilter =
        activeFilter === "All" ||
        investment.status.toLowerCase() === activeFilter.toLowerCase();

      const searchableText = [
        investment.startup,
        investment.industry,
        investment.stage,
        investment.location,
        investment.status
      ]
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!search || searchableText.includes(search));
    });
  }, [investments, searchTerm, activeFilter]);

  const handleViewInvestment = (investment) => {
    setSelectedInvestment(investment);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("All");
  };

  return (
    <section className="investor-investments-page">
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
            <strong
              className={
                totalGrowth >= 0
                  ? "investor-growth-positive"
                  : "investor-growth-negative"
              }
            >
              {totalGrowth > 0 ? "+" : ""}
              {totalGrowth.toFixed(1)}%
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

      <div className="investor-investments-toolbar">
        <div className="investor-investment-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search startups, industries or stages..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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

      {(error || loading) && (
        <div role="status" aria-live="polite">
          {loading ? (
            <p>Loading your investments...</p>
          ) : (
            <>
              <p>{error}</p>
              <button type="button" onClick={loadInvestments}>
                Retry
              </button>
            </>
          )}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="investor-investments-result-heading">
            <div>
              <h3>Investment Portfolio</h3>
              <p>
                {filteredInvestments.length} investment
                {filteredInvestments.length !== 1 ? "s" : ""} displayed
              </p>
            </div>
          </div>

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
                          {investment.initials || "S"}
                        </div>

                        <div>
                          <h4>{investment.startup}</h4>
                          <span>{investment.industry}</span>
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
                          {formatCurrency(investment.investedAmount)}
                        </strong>
                      </div>

                      <div>
                        <span>Current Value</span>
                        <strong>
                          {formatCurrency(investment.currentValue)}
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
                          {investment.growth.toFixed(1)}%
                        </strong>
                      </div>

                      <div className="investor-performance-track">
                        <span
                          style={{
                            width: `${Math.min(
                              Math.max(Math.abs(investment.growth), 8),
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
                      onClick={() => handleViewInvestment(investment)}
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

              <h3>
                {investments.length
                  ? "No investments found"
                  : "No investments available"}
              </h3>

              <p>
                {investments.length
                  ? "Try changing your search term or investment status filter."
                  : "Your investment records will appear here when available."}
              </p>

              {investments.length > 0 && (
                <button type="button" onClick={clearFilters}>
                  View all investments
                </button>
              )}
            </div>
          )}
        </>
      )}

      {selectedInvestment && (
        <div
          className="investor-investment-modal-overlay"
          onClick={() => setSelectedInvestment(null)}
        >
          <div
            className="investor-investment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="investor-investment-modal-header">
              <div className="investor-investment-modal-title">
                <div className="investor-investment-logo">
                  {selectedInvestment.initials || "S"}
                </div>

                <div>
                  <h3>{selectedInvestment.startup}</h3>
                  <span>
                    {selectedInvestment.industry} · {selectedInvestment.stage}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="investor-investment-modal-close"
                onClick={() => setSelectedInvestment(null)}
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
                    {formatCurrency(selectedInvestment.investedAmount)}
                  </strong>
                </div>

                <div>
                  <span>Current Value</span>
                  <strong>
                    {formatCurrency(selectedInvestment.currentValue)}
                  </strong>
                </div>

                <div>
                  <span>Ownership</span>
                  <strong>{selectedInvestment.ownership}</strong>
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
                    {selectedInvestment.growth > 0 ? "+" : ""}
                    {selectedInvestment.growth.toFixed(1)}%
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{selectedInvestment.location}</strong>
                </div>

                <div>
                  <span>Founders</span>
                  <strong>{selectedInvestment.founders}</strong>
                </div>
              </div>

              <div className="investor-investment-milestone">
                <span>Next Milestone</span>
                <strong>{selectedInvestment.nextMilestone}</strong>
              </div>
            </div>

            <div className="investor-investment-modal-actions">
              <button
                type="button"
                className="investor-modal-close-button"
                onClick={() => setSelectedInvestment(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="investor-modal-details-button"
                onClick={() =>
                  window.alert(
                    "Detailed investment analytics are not connected yet."
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