import { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, BookOpen, CheckCircle2, Cpu, Database,
  RefreshCw, Rocket, ShieldCheck, TrendingUp, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import "./AdminDashboard.css";

const formatNumber = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString() : "—";

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  return <article className="admin-card">
    <div className="admin-card-top"><span className="admin-card-label">{label}</span><div className={`admin-card-icon ${tone}`}><Icon size={22} /></div></div>
    <div className="admin-card-val">{value}</div>
    <div className="admin-card-sub">{detail}</div>
  </article>;
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [ai, setAi] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const results = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/ai-monitoring"),
        api.get("/admin/audit-logs?limit=8"),
      ]);
      if (results[0].status === "fulfilled" && results[0].value.data?.success) setStats(results[0].value.data.stats);
      else setError("Platform statistics could not be loaded. Check the backend and admin permissions.");
      if (results[1].status === "fulfilled" && results[1].value.data?.success) setAi(results[1].value.data);
      if (results[2].status === "fulfilled" && results[2].value.data?.success) setLogs(results[2].value.data.logs || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load administrator data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { setRefreshing(true); load(); };
  const roles = stats?.roles || {};
  const dataset = stats?.datasetEntities || {};
  const activity = stats?.platformActivity || {};
  const status = stats?.accountStatus || {};
  const aiOnline = stats?.aiEngine?.status === "healthy" || ai?.healthStatus === "Operational" || ai?.status === "healthy";

  return <DashboardLayout role="admin">
    <div className="admin-dashboard-container">
      <section className="admin-header">
        <div className="admin-header-title">
          <span className="admin-header-badge"><ShieldCheck size={14} /> System Administrator Workspace</span>
          <h1>Ecosystem Operations &amp; AI Monitor</h1>
          <p>Live platform statistics and service status retrieved from configured data sources.</p>
        </div>
        <button type="button" className="admin-refresh-btn" onClick={refresh} disabled={loading || refreshing}>
          <RefreshCw size={16} className={refreshing ? "spin-icon" : ""} /> {refreshing ? "Refreshing…" : "Refresh Live Data"}
        </button>
      </section>
      {error && <div className="admin-error" role="alert"><AlertTriangle size={18} /> {error}</div>}
      <div className="admin-metrics-grid">
        <MetricCard label="Registered Accounts" value={loading ? "…" : formatNumber(stats?.totalUsers)} detail={<><span><CheckCircle2 size={13} /> {formatNumber(status.active)} Active</span><span>{formatNumber(status.blocked)} Blocked</span></>} icon={Users} tone="icon-blue" />
        <MetricCard label="Registered Startups" value={loading ? "…" : formatNumber(stats?.startups?.registered)} detail={<span>Dataset records: {formatNumber(dataset.startups)}</span>} icon={Rocket} tone="icon-emerald" />
        <MetricCard label="Investor Accounts" value={loading ? "…" : formatNumber(roles.investors)} detail={<span>Dataset records: {formatNumber(dataset.investors)}</span>} icon={TrendingUp} tone="icon-purple" />
        <MetricCard label="Mentors &amp; Students" value={loading ? "…" : formatNumber(Number(roles.mentors || 0) + Number(roles.students || 0))} detail={<span>Dataset records: {formatNumber(Number(dataset.mentors || 0) + Number(dataset.students || 0))}</span>} icon={BookOpen} tone="icon-amber" />
      </div>
      <div className="admin-two-cols">
        <section className="admin-ai-panel">
          <div className="admin-panel-header"><div><h3><Cpu size={20} /> AI Recommendation Service</h3><p>Health status reported by the configured AI service.</p></div><span className={`ai-status-pill ${aiOnline ? "status-online" : "status-offline"}`}><Activity size={12} /> {aiOnline ? "Operational" : "Unavailable / Not verified"}</span></div>
          <div className="ai-eval-grid">
            <div className="eval-metric-box"><span>Precision@K</span><strong>Not measured</strong><small>No verified evaluation result available</small></div>
            <div className="eval-metric-box"><span>Recall@K</span><strong>Not measured</strong><small>No verified evaluation result available</small></div>
            <div className="eval-metric-box"><span>NDCG@K</span><strong>Not measured</strong><small>No verified evaluation result available</small></div>
            <div className="eval-metric-box"><span>Catalog Coverage</span><strong>{dataset.startups ? "Dataset loaded" : "Unknown"}</strong><small>{dataset.lastLoaded ? `Last loaded: ${new Date(dataset.lastLoaded).toLocaleString()}` : "Dataset load time unavailable"}</small></div>
          </div>
          <div className="admin-service-meta"><span><strong>Algorithm:</strong> {stats?.aiEngine?.algorithms || "Not reported"}</span><span><strong>Model:</strong> {stats?.aiEngine?.modelVersion || ai?.modelVersion || "Not reported"}</span><span><strong>Dataset version:</strong> {dataset.version || "Not reported"}</span></div>
        </section>
        <section className="admin-ai-panel admin-operations-panel">
          <div className="admin-panel-header"><div><h3><Database size={18} /> Operations Center</h3><p>Open protected administration modules.</p></div></div>
          <Link to="/dashboard/admin/users" className="admin-operation-link"><span><Users size={18} /> Manage user accounts</span><strong>{formatNumber(stats?.totalUsers)}</strong></Link>
          <Link to="/dashboard/admin/startups" className="admin-operation-link"><span><Rocket size={18} /> Manage startup records</span><strong>{formatNumber(stats?.startups?.total)}</strong></Link>
          <Link to="/dashboard/admin/reports" className="admin-operation-link"><span><Activity size={18} /> Platform reports</span><strong>{formatNumber(activity.opportunities)} opportunities</strong></Link>
          <Link to="/dashboard/admin/ecosystem" className="admin-operation-link"><span><Share2Icon /> Ecosystem network graph</span><strong>Open</strong></Link>
        </section>
      </div>
      <section className="admin-ai-panel admin-audit-panel">
        <div className="admin-panel-header"><div><h3><ShieldCheck size={18} /> Recent Audit Events</h3><p>Latest events recorded by the backend. An empty list means no events are available yet.</p></div><Link to="/dashboard/admin/reports">View reports</Link></div>
        {logs.length ? <div className="admin-audit-list">{logs.map((log) => <div className="admin-audit-row" key={log._id || `${log.action}-${log.createdAt}`}><div><strong>{log.action || "Activity"}</strong><small>{log.category || "system"} · {log.userRole || "system"}</small></div><time>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "Date unavailable"}</time><span className={`audit-status audit-${log.status || "success"}`}>{log.status || "success"}</span></div>)}</div> : <p className="admin-empty-state">{loading ? "Loading audit events…" : "No audit events recorded yet."}</p>}
      </section>
    </div>
  </DashboardLayout>;
}

function Share2Icon() { return <Activity size={18} />; }

export default AdminDashboard;
