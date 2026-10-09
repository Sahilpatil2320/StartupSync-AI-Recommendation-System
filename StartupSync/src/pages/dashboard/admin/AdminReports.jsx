import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  IndianRupee,
  Rocket,
  TrendingUp,
  Users,
  X
} from "lucide-react";

import "./AdminReports.css";

const monthlyActivity = [
  { month: "Apr", users: 120, startups: 18, applications: 64 },
  { month: "May", users: 175, startups: 25, applications: 91 },
  { month: "Jun", users: 230, startups: 31, applications: 128 },
  { month: "Jul", users: 295, startups: 39, applications: 164 },
  { month: "Aug", users: 360, startups: 48, applications: 207 },
  { month: "Sep", users: 438, startups: 61, applications: 268 }
];

const roleDistribution = [
  { role: "Students", value: 42 },
  { role: "Founders", value: 22 },
  { role: "Mentors", value: 14 },
  { role: "Investors", value: 9 },
  { role: "Incubators", value: 7 },
  { role: "Admins", value: 2 },
  { role: "Other", value: 4 }
];

const industryDistribution = [
  { industry: "FinTech", startups: 14 },
  { industry: "EdTech", startups: 11 },
  { industry: "HealthTech", startups: 9 },
  { industry: "AgriTech", startups: 8 },
  { industry: "SaaS", startups: 7 },
  { industry: "CleanTech", startups: 6 },
  { industry: "Other", startups: 6 }
];

const reportCards = [
  {
    id: "users",
    title: "User Activity Report",
    description:
      "User registrations, active accounts and role distribution.",
    icon: Users
  },
  {
    id: "startups",
    title: "Startup Report",
    description:
      "Startup registrations, verification and industry activity.",
    icon: Rocket
  },
  {
    id: "applications",
    title: "Opportunity Report",
    description:
      "Applications, interviews and successful placements.",
    icon: Activity
  },
  {
    id: "investments",
    title: "Investment Report",
    description:
      "Investment activity and funding information.",
    icon: IndianRupee
  }
];

function AdminReports() {
  const [period, setPeriod] = useState("6 Months");
  const [selectedReport, setSelectedReport] = useState(null);

  const currentActivity =
    monthlyActivity[monthlyActivity.length - 1];

  const previousActivity =
    monthlyActivity[monthlyActivity.length - 2];

  const userGrowth = Math.round(
    ((currentActivity.users - previousActivity.users) /
      previousActivity.users) *
      100
  );

  const startupGrowth = Math.round(
    ((currentActivity.startups -
      previousActivity.startups) /
      previousActivity.startups) *
      100
  );

  const applicationGrowth = Math.round(
    ((currentActivity.applications -
      previousActivity.applications) /
      previousActivity.applications) *
      100
  );

  const totalRoles = useMemo(
    () =>
      roleDistribution.reduce(
        (total, item) => total + item.value,
        0
      ),
    []
  );

  const maxActivityValue = Math.max(
    ...monthlyActivity.map((item) => item.users)
  );

  const handleExport = (reportName = "Platform Report") => {
    window.alert(
      `${reportName} export will be connected to the backend later.`
    );
  };

  return (
    <section className="admin-reports-page">
      {/* Header */}

      <div className="admin-reports-header">
        <div>
          <span className="admin-reports-eyebrow">
            Platform Analytics
          </span>

          <h1>Reports & Analytics</h1>

          <p>
            Monitor StartupSync activity and review platform
            performance from one place.
          </p>
        </div>

        <div className="admin-reports-actions">
          <div className="admin-report-period">
            <CalendarDays size={16} />

            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value)
              }
            >
              <option>30 Days</option>
              <option>3 Months</option>
              <option>6 Months</option>
              <option>12 Months</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-report-export-button"
            onClick={() => handleExport()}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview cards */}

      <div className="admin-report-overview-grid">
        <div className="admin-report-overview-card">
          <div className="admin-report-card-top">
            <div className="admin-report-icon">
              <Users size={20} />
            </div>

            <span className="admin-report-growth">
              +{userGrowth}%
            </span>
          </div>

          <span>Total Users</span>

          <strong>
            {currentActivity.users.toLocaleString()}
          </strong>

          <p>Compared with previous month</p>
        </div>

        <div className="admin-report-overview-card">
          <div className="admin-report-card-top">
            <div className="admin-report-icon admin-report-icon-green">
              <Rocket size={20} />
            </div>

            <span className="admin-report-growth">
              +{startupGrowth}%
            </span>
          </div>

          <span>Startups</span>

          <strong>{currentActivity.startups}</strong>

          <p>Registered on the platform</p>
        </div>

        <div className="admin-report-overview-card">
          <div className="admin-report-card-top">
            <div className="admin-report-icon admin-report-icon-purple">
              <Activity size={20} />
            </div>

            <span className="admin-report-growth">
              +{applicationGrowth}%
            </span>
          </div>

          <span>Applications</span>

          <strong>
            {currentActivity.applications}
          </strong>

          <p>Opportunity applications</p>
        </div>

        <div className="admin-report-overview-card">
          <div className="admin-report-card-top">
            <div className="admin-report-icon admin-report-icon-orange">
              <IndianRupee size={20} />
            </div>

            <span className="admin-report-neutral">
              Platform Demo
            </span>
          </div>

          <span>Tracked Funding</span>

          <strong>₹4.8 Cr</strong>

          <p>Investment activity recorded</p>
        </div>
      </div>

      {/* Activity chart */}

      <div className="admin-report-main-grid">
        <div className="admin-report-panel admin-report-activity-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>Platform Activity</h2>

              <p>
                Monthly user, startup and application activity.
              </p>
            </div>

            <BarChart3 size={20} />
          </div>

          <div className="admin-report-chart">
            <div className="admin-report-y-axis">
              <span>500</span>
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>

            <div className="admin-report-chart-area">
              <div className="admin-report-grid-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="admin-report-bars">
                {monthlyActivity.map((item) => (
                  <div
                    className="admin-report-bar-group"
                    key={item.month}
                  >
                    <div className="admin-report-bars-container">
                      <div
                        className="admin-report-bar admin-report-user-bar"
                        style={{
                          height: `${
                            (item.users /
                              maxActivityValue) *
                            100
                          }%`
                        }}
                        title={`${item.users} users`}
                      />

                      <div
                        className="admin-report-bar admin-report-startup-bar"
                        style={{
                          height: `${
                            (item.startups /
                              maxActivityValue) *
                            100
                          }%`
                        }}
                        title={`${item.startups} startups`}
                      />

                      <div
                        className="admin-report-bar admin-report-application-bar"
                        style={{
                          height: `${
                            (item.applications /
                              maxActivityValue) *
                            100
                          }%`
                        }}
                        title={`${item.applications} applications`}
                      />
                    </div>

                    <span>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-report-chart-legend">
            <span>
              <i className="admin-legend-user" />
              Users
            </span>

            <span>
              <i className="admin-legend-startup" />
              Startups
            </span>

            <span>
              <i className="admin-legend-application" />
              Applications
            </span>
          </div>
        </div>

        {/* Role distribution */}

        <div className="admin-report-panel">
          <div className="admin-report-panel-header">
            <div>
              <h2>User Distribution</h2>

              <p>Registered account roles.</p>
            </div>

            <Users size={20} />
          </div>

          <div className="admin-role-distribution">
            {roleDistribution.map((item) => (
              <div
                className="admin-role-row"
                key={item.role}
              >
                <div className="admin-role-row-top">
                  <span>{item.role}</span>

                  <strong>{item.value}%</strong>
                </div>

                <div className="admin-role-progress">
                  <span
                    style={{
                      width: `${item.value}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="admin-role-total">
            <CheckCircle2 size={15} />
            <span>
              {totalRoles}% of platform accounts represented
            </span>
          </div>
        </div>
      </div>

      {/* Industry distribution */}

      <div className="admin-report-panel admin-industry-panel">
        <div className="admin-report-panel-header">
          <div>
            <h2>Startup Industry Activity</h2>

            <p>
              Distribution of startups across major domains.
            </p>
          </div>

          <Building2 size={20} />
        </div>

        <div className="admin-industry-grid">
          {industryDistribution.map((item) => (
            <div
              className="admin-industry-item"
              key={item.industry}
            >
              <div className="admin-industry-title">
                <span>{item.industry}</span>

                <strong>{item.startups}</strong>
              </div>

              <div className="admin-industry-progress">
                <span
                  style={{
                    width: `${Math.min(
                      item.startups * 7,
                      100
                    )}%`
                  }}
                />
              </div>

              <small>
                {item.startups === 1
                  ? "startup"
                  : "startups"}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* Report types */}

      <div className="admin-report-section-heading">
        <div>
          <h2>Available Reports</h2>

          <p>
            Open a report category to review its detailed
            information.
          </p>
        </div>
      </div>

      <div className="admin-report-cards-grid">
        {reportCards.map((report) => {
          const Icon = report.icon;

          return (
            <div
              className="admin-report-type-card"
              key={report.id}
            >
              <div className="admin-report-type-icon">
                <Icon size={20} />
              </div>

              <h3>{report.title}</h3>

              <p>{report.description}</p>

              <button
                type="button"
                onClick={() =>
                  setSelectedReport(report)
                }
              >
                View Report
                <TrendingUp size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Report modal */}

      {selectedReport && (
        <div
          className="admin-report-modal-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="admin-report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-report-modal-header">
              <div>
                <span>Report Preview</span>
                <h2>{selectedReport.title}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report"
              >
                <X size={19} />
              </button>
            </div>

            <div className="admin-report-modal-icon">
              {(() => {
                const Icon = selectedReport.icon;
                return <Icon size={24} />;
              })()}
            </div>

            <p>
              {selectedReport.description}
            </p>

            <div className="admin-report-modal-summary">
              <div>
                <span>Reporting Period</span>
                <strong>{period}</strong>
              </div>

              <div>
                <span>Report Status</span>
                <strong>Available</strong>
              </div>

              <div>
                <span>Data Source</span>
                <strong>Platform Data</strong>
              </div>
            </div>

            <button
              type="button"
              className="admin-report-modal-export"
              onClick={() =>
                handleExport(selectedReport.title)
              }
            >
              <Download size={16} />
              Generate Report
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminReports;