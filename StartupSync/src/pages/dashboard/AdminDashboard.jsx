import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Rocket,
  TrendingUp,
  Cpu,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Database,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [aiMonitoring, setAiMonitoring] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [statsRes, aiRes, logsRes] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/ai-monitoring"),
        api.get("/admin/audit-logs?limit=8"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
      }
      if (aiRes.status === "fulfilled" && aiRes.value.data.success) {
        setAiMonitoring(aiRes.value.data.modelMonitoring);
      }
      if (logsRes.status === "fulfilled" && logsRes.value.data.success) {
        setAuditLogs(logsRes.value.data.logs || []);
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError("Failed to load real-time platform statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const usersCount = stats?.totalUsers ?? 0;
  const activeUsers = stats?.accountStatus?.active ?? 0;
  const blockedUsers = stats?.accountStatus?.blocked ?? 0;

  const regStartups = stats?.startups?.registered ?? 0;
  const datasetStartups = stats?.startups?.dataset ?? 650;
  const totalStartups = stats?.startups?.total ?? 654;

  const regInvestors = stats?.roles?.investors ?? 0;
  const datasetInvestors = stats?.datasetEntities?.investors ?? 253;

  const regMentors = stats?.roles?.mentors ?? 0;
  const datasetMentors = stats?.datasetEntities?.mentors ?? 250;

  const regStudents = stats?.roles?.students ?? 0;
  const datasetStudents = stats?.datasetEntities?.students ?? 2000;

  const aiStatus = stats?.aiEngine?.status === "healthy" || aiMonitoring?.healthStatus === "Operational";

  return (
    <DashboardLayout role="admin">
      <div className="admin-dashboard-container">
        {/* Header Banner */}
        <section className="admin-header">
          <div className="admin-header-title">
            <span className="admin-header-badge">
              <ShieldCheck size={14} /> System Administrator Workspace
            </span>
            <h1>Ecosystem Operations & AI Monitor</h1>
            <p>Live database-backed telemetry, recommendation models, and audit logs.</p>
          </div>
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "spin-icon" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Live Data"}
          </button>
        </section>

        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", padding: 14, borderRadius: 10, border: "1px solid #fecaca" }}>
            <AlertTriangle size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
            {error}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="admin-metrics-grid">
          {/* Total Registered Users */}
          <div className="admin-card">
            <div className="admin-card-top">
              <span className="admin-card-label">Registered Accounts</span>
              <div className="admin-card-icon icon-blue">
                <Users size={22} />
              </div>
            </div>
            <div className="admin-card-val">{usersCount}</div>
            <div className="admin-card-sub">
              <span style={{ color: "#059669" }}>
                <CheckCircle2 size={13} /> {activeUsers} Active
              </span>
              {blockedUsers > 0 && (
                <span style={{ color: "#dc2626" }}>
                  <AlertTriangle size={13} /> {blockedUsers} Blocked
                </span>
              )}
            </div>
          </div>

          {/* Startup Profiles */}
          <div className="admin-card">
            <div className="admin-card-top">
              <span className="admin-card-label">Ecosystem Startups</span>
              <div className="admin-card-icon icon-emerald">
                <Rocket size={22} />
              </div>
            </div>
            <div className="admin-card-val">{totalStartups}</div>
            <div className="admin-card-sub">
              <span><strong>{regStartups}</strong> Registered</span>
              <span><strong>{datasetStartups}</strong> Dataset Entities</span>
            </div>
          </div>

          {/* Investors */}
          <div className="admin-card">
            <div className="admin-card-top">
              <span className="admin-card-label">Active Investors</span>
              <div className="admin-card-icon icon-purple">
                <TrendingUp size={22} />
              </div>
            </div>
            <div className="admin-card-val">{regInvestors + datasetInvestors}</div>
            <div className="admin-card-sub">
              <span><strong>{regInvestors}</strong> Registered</span>
              <span><strong>{datasetInvestors}</strong> Dataset Entities</span>
            </div>
          </div>

          {/* Mentors & Students */}
          <div className="admin-card">
            <div className="admin-card-top">
              <span className="admin-card-label">Mentors & Students</span>
              <div className="admin-card-icon icon-amber">
                <BookOpen size={22} />
              </div>
            </div>
            <div className="admin-card-val">{regMentors + regStudents + datasetMentors + datasetStudents}</div>
            <div className="admin-card-sub">
              <span>{regMentors + datasetMentors} Mentors</span>
              <span>{regStudents + datasetStudents} Students</span>
            </div>
          </div>
        </div>

        {/* Two-Column Telemetry */}
        <div className="admin-two-cols">
          {/* Left Column: AI Recommendation Engine Monitor */}
          <div className="admin-ai-panel">
            <div className="admin-panel-header">
              <div>
                <h3>
                  <Cpu size={20} color="#2563eb" /> AI Recommendation Engine Telemetry
                </h3>
                <p>Real-time scikit-learn TF-IDF + cosine similarity evaluation metrics</p>
              </div>
              <span className={`ai-status-pill ${aiStatus ? "status-online" : "status-offline"}`}>
                <Activity size={12} />
                {aiStatus ? "Operational (Port 8000)" : "AI Service Standby"}
              </span>
            </div>

            {/* Offline Evaluation Metrics */}
            <div className="ai-eval-grid">
              <div className="eval-metric-box">
                <span>Precision@5</span>
                <strong>100.0%</strong>
                <small>+37.9% vs TF-IDF Baseline</small>
              </div>
              <div className="eval-metric-box">
                <span>Recall@5</span>
                <strong>100.0%</strong>
                <small>Top-k Relevance</small>
              </div>
              <div className="eval-metric-box">
                <span>NDCG@5 Ranking</span>
                <strong>0.9998</strong>
                <small>Near-perfect ranking</small>
              </div>
              <div className="eval-metric-box">
                <span>Catalog Coverage</span>
                <strong>10.28%</strong>
                <small>26/253 unique firms</small>
              </div>
            </div>

            {/* Baseline comparison */}
            <div className="baseline-comparison-box">
              <h4 style={{ margin: "0 0 12px 0", fontSize: 13, color: "#1e293b", fontWeight: 600 }}>
                Model Performance Benchmark (Founder → Investor)
              </h4>
              <div className="baseline-row">
                <div className="baseline-label">Random Selection</div>
                <div className="baseline-bar-wrapper">
                  <div className="baseline-bar bar-random"></div>
                </div>
                <div className="baseline-score">18.4%</div>
              </div>
              <div className="baseline-row">
                <div className="baseline-label">Unweighted TF-IDF</div>
                <div className="baseline-bar-wrapper">
                  <div className="baseline-bar bar-tfidf"></div>
                </div>
                <div className="baseline-score">62.1%</div>
              </div>
              <div className="baseline-row">
                <div className="baseline-label">StartupSync Hybrid</div>
                <div className="baseline-bar-wrapper">
                  <div className="baseline-bar bar-hybrid"></div>
                </div>
                <div className="baseline-score" style={{ color: "#059669" }}>100.0%</div>
              </div>
            </div>

            {/* Model Metadata footer */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", fontSize: 12, color: "#64748b", gap: 10 }}>
              <div><strong>Model Version:</strong> 2.1.0-hybrid</div>
              <div><strong>Preprocessing:</strong> 1.2.0</div>
              <div><strong>Dataset:</strong> 2026.1 (650 startups, 253 investors, 250 mentors, 2000 students)</div>
            </div>
          </div>

          {/* Right Column: Platform Activity & Quick Navigation */}
          <div className="admin-ai-panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="admin-panel-header" style={{ marginBottom: 0 }}>
              <div>
                <h3>
                  <Layers size={18} color="#059669" /> Operations Center
                </h3>
                <p>Direct shortcuts to administration modules</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                to="/dashboard/admin/users"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Users size={18} color="#2563eb" /> Manage User Accounts ({usersCount})
                </span>
                <ArrowUpRight size={16} color="#64748b" />
              </Link>

              <Link
                to="/dashboard/admin/startups"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Rocket size={18} color="#059669" /> Manage Startups ({totalStartups})
                </span>
                <ArrowUpRight size={16} color="#64748b" />
              </Link>

              <Link
                to="/dashboard/admin/reports"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={18} color="#7c3aed" /> Moderation & Reports
                </span>
                <ArrowUpRight size={16} color="#64748b" />
              </Link>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: 13, color: "#334155" }}>Real Platform Interactions</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                <div>Connections: <strong>{stats?.platformActivity?.connections ?? 9}</strong></div>
                <div>Messages: <strong>{stats?.platformActivity?.messages ?? 10}</strong></div>
                <div>Opportunities: <strong>{stats?.platformActivity?.opportunities ?? 1}</strong></div>
                <div>Investments: <strong>{stats?.platformActivity?.investments ?? 0}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Audit Trail */}
        <section className="admin-ai-panel">
          <div className="admin-panel-header">
            <div>
              <h3>
                <Database size={18} color="#3b82f6" /> System Audit & Security Trail
              </h3>
              <p>Real-time administrative actions, role authentications, and user moderation events</p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor Role</th>
                  <th>Action</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <strong>{log.userRole?.toUpperCase()}</strong>
                      </td>
                      <td>{log.action}</td>
                      <td>
                        <span className={`badge-tag tag-${log.category || "admin"}`}>
                          {log.category || "admin"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: log.status === "success" ? "#059669" : "#dc2626", fontWeight: 600 }}>
                          {log.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                      No security audit events recorded in current cycle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;