import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Building2, CheckCircle2,
  CircleDollarSign, MapPin, ShieldCheck, Sparkles, TrendingUp, UsersRound
} from "lucide-react";
import api from "../../../services/api";
import "./FounderInvestors.css";

const labelize = (key = "") => String(key)
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/[_-]+/g, " ")
  .replace(/^./, (c) => c.toUpperCase());

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const displayValue = (value) => {
  if (value === undefined || value === null || value === "") return "Not specified";
  if (Array.isArray(value)) return value.length ? value.map((v) => typeof v === "object" ? JSON.stringify(v) : String(v)).join(", ") : "Not specified";
  if (typeof value === "object") return Object.entries(value).map(([k, v]) => `${labelize(k)}: ${displayValue(v)}`).join(" · ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const hiddenKeys = new Set(["__v", "password", "passwordhash", "token", "refreshtoken", "resetpasswordtoken"]);

function InvestorProfile() {
  const { profileKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [profileType, setProfileType] = useState(location.state?.profileType || "dataset");
  const [loading, setLoading] = useState(!location.state?.profile);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (location.state?.profile) {
      setProfile(location.state.profile);
      setProfileType(location.state.profileType || "dataset");
      setLoading(false);
      return;
    }

    // Registered profiles can be reopened directly or after a page refresh.
    // Dataset recommendations are navigation-state records, not Mongo account IDs.
    const loadRegisteredProfile = async () => {
      const token = localStorage.getItem("startupsync_token");
      if (!token) {
        setError("Please log in to view this investor profile.");
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/profiles/investors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const records = Array.isArray(response.data?.investors) ? response.data.investors : [];
        const found = records.find((item) => String(item.id || item._id) === decodeURIComponent(profileKey));
        if (!found) {
          setError("This dataset profile is no longer available in the current page state. Return to Investor Discovery and open it again.");
          return;
        }
        setProfile({
          ...found,
          id: found.id || found._id,
          name: found.name || found.firmName || "Unnamed Investor",
          location: found.location || "Location not provided",
          industries: Array.isArray(found.industries) ? found.industries : [],
          stages: Array.isArray(found.stages) ? found.stages : [],
        });
        setProfileType("registered");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this investor profile.");
      } finally {
        setLoading(false);
      }
    };
    loadRegisteredProfile();
  }, [location.state, profileKey]);

  const isDataset = profileType !== "registered";
  const name = firstValue(profile?.investor_name, profile?.name, profile?.firmName, "Investor");
  const firm = firstValue(profile?.firm_name, profile?.firmName, profile?.company, profile?.name, "Investment firm");
  const scoreRaw = firstValue(profile?.score_percentage, profile?.scorePercentage, profile?.matchPercentage, profile?.match_percentage, profile?.matchScore, profile?.match_score, profile?.similarity_score, profile?.score, profile?.similarity, profile?.confidence, profile?.match);
  const scoreNumber = scoreRaw === undefined ? null : Number(scoreRaw);
  const score = Number.isFinite(scoreNumber) ? Math.max(0, Math.min(100, scoreNumber >= 0 && scoreNumber <= 1 ? scoreNumber * 100 : scoreNumber)) : null;

  const details = useMemo(() => {
    if (!profile) return [];
    const preferred = [
      ["Investor Type", firstValue(profile.type, profile.investor_type, profile.investorType)],
      ["Investment Stages", firstValue(profile.funding_stage, profile.investment_stages, profile.stages)],
      ["Industries", firstValue(profile.industries, profile.industry, profile.sectors)],
      ["Investment Range", firstValue(profile.range, profile.investment_range, profile.ticket_size, profile.minimumInvestment || profile.maximumInvestment ? `${profile.minimumInvestment || 0} – ${profile.maximumInvestment || 0}` : undefined)],
      ["Location", firstValue(profile.location, profile.geography, profile.region)],
      ["Investor Status", profile.active === true ? "Active" : profile.active === false ? "Inactive" : "Status unverified"],
      ["Website", firstValue(profile.website, profile.url)],
      ["Description", firstValue(profile.description, profile.bio, profile.about, profile.investor_thesis)],
      ["Investment Focus", firstValue(profile.investment_focus, profile.investmentFocus, profile.focus)],
      ["Portfolio", firstValue(profile.portfolio, profile.portfolio_companies)],
      ["Email", firstValue(profile.public_email, profile.contact_email)],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");
    const preferredKeys = new Set(preferred.map(([label]) => label.toLowerCase()));
    const additional = Object.entries(profile)
      .filter(([key, value]) => !hiddenKeys.has(key.toLowerCase()) && value !== undefined && value !== null && value !== "" && !["id", "_id", "createdAt", "updatedAt", "__v"].includes(key))
      .filter(([key]) => !["investor_name", "firm_name", "firmName", "company", "name", "type", "investor_type", "investorType", "funding_stage", "investment_stages", "stages", "industries", "industry", "sectors", "range", "investment_range", "ticket_size", "minimumInvestment", "maximumInvestment", "location", "geography", "region", "active", "website", "url", "description", "bio", "about", "investor_thesis", "investment_focus", "investmentFocus", "focus", "portfolio", "portfolio_companies", "public_email", "contact_email", "score_percentage", "scorePercentage", "matchPercentage", "match_percentage", "matchScore", "match_score", "similarity_score", "score", "similarity", "confidence", "match"].includes(key));
    return [...preferred, ...additional.map(([key, value]) => [labelize(key), value])]
      .filter(([label]) => !preferredKeys.has(label.toLowerCase()));
  }, [profile]);

  const handleConnect = async () => {
    if (isDataset || !profile?.id || connecting || connected) return;
    const token = localStorage.getItem("startupsync_token");
    if (!token) { setNotice("Please log in again to send a connection request."); return; }
    setConnecting(true);
    setNotice("");
    try {
      await api.post(`/connections/investors/${encodeURIComponent(profile.id)}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnected(true);
      setNotice("Connection request sent successfully.");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to send connection request.";
      if (/already exists|already sent|pending request|request pending/i.test(message)) {
        setConnected(true);
        setNotice("A connection request already exists.");
      } else setNotice(message);
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <div className="founder-investors-page"><section className="founder-investors-empty">Loading investor profile…</section></div>;
  if (!profile) return (
    <div className="founder-investors-page">
      <button className="founder-investor-view-button" type="button" onClick={() => navigate("/dashboard/founder/investors")}><ArrowLeft size={16} /> Back to Investors</button>
      <section className="founder-investors-empty"><h3>Investor profile unavailable</h3><p>{error || "The requested profile could not be found."}</p></section>
    </div>
  );

  return (
    <main className="founder-investors-page investor-full-profile-page">
      <button type="button" className="founder-investor-view-button" onClick={() => navigate(-1)} style={{ marginBottom: 22 }}><ArrowLeft size={16} /> Back to Investors</button>

      <section className="founder-investors-header" style={{ marginBottom: 24 }}>
        <div>
          <span className="founder-investors-badge"><Sparkles size={14} style={{ display: "inline", marginRight: 6 }} />{isDataset ? "AI Dataset Profile" : "Registered Investor Profile"}</span>
          <h2 style={{ marginTop: 12 }}>{name}</h2>
          <p>{firm}</p>
          <p style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}><MapPin size={16} /> {displayValue(firstValue(profile.location, profile.geography, profile.region))}</p>
        </div>
      </section>

      {isDataset && <div style={{ borderRadius: 12, padding: "13px 16px", marginBottom: 20, background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}><ShieldCheck size={17} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />This profile comes from the StartupSync AI recommendation dataset and is not confirmed as a registered StartupSync account.</div>}

      <section className="founder-investors-grid" style={{ marginBottom: 24 }}>
        <article className="founder-investor-card" style={{ gridColumn: "1 / -1" }}>
          <div className="founder-investor-card-top">
            <div className="founder-investor-avatar" style={{ width: 64, height: 64, fontSize: 25 }}>{String(name).charAt(0).toUpperCase()}</div>
            <div className="founder-investor-heading"><h4 style={{ fontSize: 21 }}>{name}</h4><span>{firm}</span></div>
            <div className="founder-investor-match"><strong>{score !== null ? `${score.toFixed(1)}%` : "—"}</strong><span>Relative match</span></div>
          </div>
          <div className="founder-investor-network"><TrendingUp size={16} /><span>{isDataset ? "Suggested by the StartupSync AI recommendation engine" : "Investor profile from StartupSync"}</span></div>
          <div className="founder-investor-actions" style={{ marginTop: 18 }}>
            {isDataset ? <button type="button" className="founder-investor-view-button" onClick={() => setNotice("This dataset entry is not linked to a registered account, so a connection request cannot be sent.")}>Dataset Profile <BadgeCheck size={15} /></button> : <button type="button" className={`founder-investor-connect-button ${connected ? "founder-investor-connected" : ""}`} disabled={connected || connecting} onClick={handleConnect}>{connected ? <><CheckCircle2 size={15} /> Request Sent</> : connecting ? "Sending…" : "Connect"}</button>}
          </div>
          {notice && <p role="status" style={{ marginTop: 12, color: "#475569" }}>{notice}</p>}
        </article>
      </section>

      <section className="founder-investors-ai-section">
        <div style={{ marginBottom: 16 }}><h3 style={{ marginBottom: 6 }}>Investor Details</h3><p style={{ color: "#64748b", margin: 0 }}>Information available for this investor profile.</p></div>
        <section className="founder-investors-grid">
          {details.length ? details.map(([label, value]) => <article className="founder-investor-card" key={label} style={{ minWidth: 0 }}><div className="founder-investor-network"><Building2 size={16} /><span>{label}</span></div><strong style={{ display: "block", marginTop: 12, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{displayValue(value)}</strong></article>) : <article className="founder-investor-card"><p>No additional profile details were provided by the source.</p></article>}
        </section>
      </section>
      <p style={{ color: "#64748b", fontSize: 12, marginTop: 18 }}>Match percentages are ranking scores, not probabilities of receiving funding.</p>
    </main>
  );
}

export default InvestorProfile;