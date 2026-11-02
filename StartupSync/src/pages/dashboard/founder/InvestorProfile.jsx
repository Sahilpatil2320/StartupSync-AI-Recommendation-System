import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Globe,
  CircleDollarSign,
  BriefcaseBusiness,
} from "lucide-react";
import api from "../../../services/api";
import "./FounderInvestors.css";

const HIDDEN_KEYS = new Set([
  "__v", "password", "passwordhash", "token", "refreshtoken",
  "resetpasswordtoken", "id", "_id", "createdAt", "updatedAt",
]);

const labelize = (key = "") =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "Not specified";
  if (Array.isArray(value)) {
    return value.length
      ? value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ")
      : "Not specified";
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => !HIDDEN_KEYS.has(key.toLowerCase()))
      .map(([key, item]) => `${labelize(key)}: ${formatValue(item)}`)
      .join(" · ") || "Not specified";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #dfe7f2",
  borderRadius: 20,
  padding: "24px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
};

const detailStyle = {
  background: "#f7f9fc",
  border: "1px solid #e7edf5",
  borderRadius: 14,
  padding: 18,
  minWidth: 0,
};

function InvestorProfile() {
  const { profileKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(location.state?.profile || null);
  const [profileType, setProfileType] = useState(location.state?.profileType || "dataset");
  const [loading, setLoading] = useState(!location.state?.profile);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (location.state?.profile) {
      setProfile(location.state.profile);
      setProfileType(location.state.profileType || "dataset");
      setLoading(false);
      setError("");
      return () => { cancelled = true; };
    }

    const loadProfile = async () => {
      const token = localStorage.getItem("startupsync_token");
      if (!token) {
        if (!cancelled) {
          setError("Your session has expired. Please log in again to view this profile.");
          setLoading(false);
        }
        return;
      }

      try {
        // This route is only for a founder viewing an investor. If the profile
        // was opened from discovery, navigation state is used above. This API
        // fallback supports reloading a registered profile URL.
        const response = await api.get("/profiles/investors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(response.data?.investors)
          ? response.data.investors
          : Array.isArray(response.data?.profiles)
            ? response.data.profiles
            : [];
        const key = decodeURIComponent(profileKey || "");
        const found = list.find((item) =>
          String(item.id || item._id || item.investor_id || item.investorId || "") === key
        );

        if (!cancelled) {
          if (found) {
            setProfile(found);
            setProfileType("registered");
            setError("");
          } else {
            setError("This profile could not be loaded directly. Return to Discover Investors and open the profile again.");
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.message ||
            "Unable to load this investor profile. Return to Discover Investors and try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, [location.state, profileKey]);

  const isDataset = profileType !== "registered";
  const name = firstValue(
    profile?.investor_name,
    profile?.investorName,
    profile?.name,
    profile?.firmName,
    profile?.firm_name,
    profile?.company,
    "Investor"
  );
  const firm = firstValue(
    profile?.firm_name,
    profile?.firmName,
    profile?.company,
    profile?.name,
    "Investment firm"
  );
  const locationValue = firstValue(profile?.location, profile?.geography, profile?.region);
  const industryValue = firstValue(
    profile?.industries,
    profile?.industry,
    profile?.sectors,
    profile?.investment_focus,
    profile?.investmentFocus,
    profile?.focus
  );
  const stageValue = firstValue(
    profile?.funding_stage,
    profile?.investment_stages,
    profile?.stages,
    profile?.stage
  );
  const investmentRange = firstValue(
    profile?.investment_range,
    profile?.range,
    profile?.ticket_size,
    profile?.minimumInvestment || profile?.maximumInvestment
      ? `${profile.minimumInvestment || "Not specified"} – ${profile.maximumInvestment || "Not specified"}`
      : undefined
  );
  const description = firstValue(
    profile?.description,
    profile?.bio,
    profile?.about,
    profile?.investor_thesis,
    profile?.investment_thesis
  );
  const website = firstValue(profile?.website, profile?.url);
  const portfolio = firstValue(profile?.portfolio, profile?.portfolio_companies);

  const details = useMemo(() => {
    if (!profile || typeof profile !== "object") return [];
    const knownKeys = new Set([
      ...HIDDEN_KEYS,
      "investor_name", "investorName", "name", "firmName", "firm_name", "company",
      "location", "geography", "region", "industries", "industry", "sectors",
      "investment_focus", "investmentFocus", "focus", "funding_stage",
      "investment_stages", "stages", "stage", "investment_range", "range",
      "ticket_size", "minimumInvestment", "maximumInvestment", "description",
      "bio", "about", "investor_thesis", "investment_thesis", "website", "url",
      "portfolio", "portfolio_companies", "score", "similarity", "similarity_score",
      "score_percentage", "scorePercentage", "match", "matchScore", "match_score",
      "matchPercentage", "match_percentage", "confidence", "rankingScore",
    ].map((key) => String(key).toLowerCase()));

    return Object.entries(profile)
      .filter(([key, value]) =>
        !knownKeys.has(key.toLowerCase()) &&
        value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => [labelize(key), value]);
  }, [profile]);

  const backToDiscovery = () => navigate("/dashboard/founder/investors");

  if (loading) {
    return (
      <main className="founder-investors-page" style={{ minHeight: "60vh", padding: 32 }}>
        <section style={{ ...cardStyle, maxWidth: 1100, margin: "24px auto", color: "#64748b" }}>
          Loading investor profile…
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="founder-investors-page" style={{ minHeight: "60vh", padding: 32 }}>
        <div style={{ maxWidth: 1100, margin: "24px auto" }}>
          <button type="button" className="founder-investor-view-button" onClick={backToDiscovery}>
            <ArrowLeft size={17} /> Back to discovery
          </button>
          <section style={{ ...cardStyle, marginTop: 24 }}>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>Investor profile unavailable</h2>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>{error || "The requested profile could not be found."}</p>
            <button type="button" className="founder-investor-view-button" onClick={backToDiscovery}>
              Return to Discover Investors
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="founder-investors-page investor-full-profile-page" style={{ minHeight: "100vh", padding: "30px clamp(18px, 4vw, 48px)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <button
          type="button"
          className="founder-investor-view-button"
          onClick={backToDiscovery}
          style={{ marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 10 }}
        >
          <ArrowLeft size={18} /> Back to discovery
        </button>

        <section style={{ ...cardStyle, padding: "clamp(24px, 4vw, 42px)" }}>
          <header style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid #e5edf6" }}>
            <div style={{ width: 88, height: 88, borderRadius: 22, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Building2 size={42} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Sparkles size={17} /> {isDataset ? "Investor dataset profile" : "Registered investor"}
              </div>
              <h1 style={{ fontSize: "clamp(28px, 3vw, 38px)", color: "#0f172a", margin: "0 0 8px", overflowWrap: "anywhere" }}>{name}</h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: 17 }}>{firm}</p>
              {locationValue && (
                <p style={{ margin: "12px 0 0", color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={17} /> {formatValue(locationValue)}
                </p>
              )}
            </div>
          </header>

          {isDataset && (
            <div style={{ marginTop: 24, padding: "14px 16px", borderRadius: 12, background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.55 }}>
              <ShieldCheck size={19} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>This is an investor profile from the StartupSync recommendation dataset. Contact and account details are shown only when present in the source record.</span>
            </div>
          )}

          <section style={{ marginTop: 28 }}>
            <h2 style={{ margin: "0 0 16px", color: "#0f172a", fontSize: 24 }}>About</h2>
            <article style={detailStyle}>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.8, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {description ? formatValue(description) : "No description is available in this record."}
              </p>
            </article>
          </section>

          <section style={{ marginTop: 28 }}>
            <h2 style={{ margin: "0 0 16px", color: "#0f172a", fontSize: 24 }}>Key Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
              <article style={detailStyle}>
                <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><MapPin size={18} /> <strong>Location</strong></div>
                <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{formatValue(locationValue)}</div>
              </article>
              <article style={detailStyle}>
                <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><BriefcaseBusiness size={18} /> <strong>Industries / Focus</strong></div>
                <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{formatValue(industryValue)}</div>
              </article>
              <article style={detailStyle}>
                <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><CircleDollarSign size={18} /> <strong>Investment Range</strong></div>
                <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{formatValue(investmentRange)}</div>
              </article>
              <article style={detailStyle}>
                <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><Users size={18} /> <strong>Investment Stages</strong></div>
                <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{formatValue(stageValue)}</div>
              </article>
              {website && (
                <article style={detailStyle}>
                  <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><Globe size={18} /> <strong>Website</strong></div>
                  <div style={{ color: "#475569", overflowWrap: "anywhere" }}>
                    {/^https?:\/\//i.test(String(website))
                      ? <a href={String(website)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>{String(website)}</a>
                      : String(website)}
                  </div>
                </article>
              )}
              {portfolio && (
                <article style={detailStyle}>
                  <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><Building2 size={18} /> <strong>Portfolio</strong></div>
                  <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{formatValue(portfolio)}</div>
                </article>
              )}
              {details.map(([label, value]) => (
                <article key={label} style={detailStyle}>
                  <div style={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><Building2 size={18} /> <strong>{label}</strong></div>
                  <div style={{ color: "#475569", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{formatValue(value)}</div>
                </article>
              ))}
            </div>
          </section>

          <footer style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #e5edf6", color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
            Profile details are based on information available in the source record. Missing fields are not inferred.
          </footer>
        </section>
      </div>
    </main>
  );
}

export default InvestorProfile;