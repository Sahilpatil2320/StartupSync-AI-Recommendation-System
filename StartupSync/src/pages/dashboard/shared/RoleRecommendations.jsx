import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { getRecommendations } from "../../../services/aiApi";
import api from "../../../services/api";
import "./RoleRecommendations.css";

const pluralRole = (role) => `${role}s`;

const readTokenUserId = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(padded));
    return String(decoded.userId || decoded.id || decoded._id || decoded.sub || "");
  } catch {
    return "";
  }
};

const listFromResponse = (response, role) => {
  const candidates = [
    response?.[role],
    response?.data?.[role],
    response?.profiles,
    response?.data?.profiles,
    response?.data,
  ];
  return candidates.find(Array.isArray) || [];
};

const recommendationsFromResponse = (response) => {
  const candidates = [
    response?.data?.recommendations,
    response?.data?.data?.recommendations,
    response?.recommendations,
    response?.data?.results,
    response?.results,
    response?.data?.data,
  ];
  return candidates.find(Array.isArray) || [];
};

const idOf = (profile) =>
  String(profile?.id || profile?._id || profile?.profileId || profile?.profile_id || "");

const datasetIdOf = (profile) =>
  String(profile?.aiDatasetId || profile?.datasetId || profile?.dataset_id || profile?.founder_id || profile?.investor_id || profile?.mentor_id || profile?.student_id || "");

const nameOf = (profile, role) => {
  if (role === "founder") return profile?.startupName || profile?.startup_name || profile?.companyName || profile?.company_name || profile?.name || "Startup";
  if (role === "investor") return profile?.firmName || profile?.firm_name || profile?.investor_name || profile?.organization || profile?.name || "Investor";
  if (role === "mentor") return profile?.name || profile?.fullName || profile?.mentor_name || "Mentor";
  return profile?.name || profile?.fullName || profile?.student_name || "Student";
};

const locationOf = (profile) => {
  const location = profile?.location;
  if (typeof location === "string") return location;
  if (location && typeof location === "object") {
    return [location.city, location.state, location.country].filter(Boolean).join(", ");
  }
  return profile?.city || profile?.country || "Location not specified";
};

const detailsOf = (profile, role) => {
  if (role === "founder") return [profile?.industry, profile?.domain, profile?.startupStage || profile?.fundingStage, profile?.description].filter(Boolean);
  if (role === "investor") return [profile?.type || profile?.investorType, ...(Array.isArray(profile?.industries) ? profile.industries : profile?.investmentIndustries || []), profile?.investmentThesis, profile?.bio].filter(Boolean);
  if (role === "mentor") return [profile?.expertise, profile?.industry, profile?.domain, profile?.experienceYears != null ? `${profile.experienceYears} years experience` : "", profile?.bio].flat().filter(Boolean);
  return [profile?.college, profile?.branch, profile?.graduationYear ? `Graduation ${profile.graduationYear}` : "", ...(profile?.technicalSkills || []), profile?.careerGoal].flat().filter(Boolean);
};

const scoreOf = (profile) => {
  const raw =
    profile?.score_percentage ??
    profile?.scorePercentage ??
    profile?.matchPercentage ??
    profile?.match_percentage ??
    profile?.matchScore ??
    profile?.match_score ??
    profile?.similarity_score ??
    profile?.score ??
    profile?.similarity ??
    profile?.confidence ??
    profile?.match;
  if (raw === undefined || raw === null || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.round(Math.max(0, Math.min(100, value >= 0 && value <= 1 ? value * 100 : value)));
};

function RoleRecommendations({ role, targetRole }) {
  const [profiles, setProfiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [search, setSearch] = useState("");
  const [pendingIds, setPendingIds] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);

  const targetPlural = pluralRole(targetRole);
  const targetLabel = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("startupsync_token");
      if (!token) throw new Error("Please log in again to view profiles.");
      const response = await api.get(`/profiles/${targetPlural}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rows = listFromResponse(response.data, targetPlural);
      setProfiles(rows);
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Unable to load ${targetPlural}.`);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [targetPlural]);

  const loadRecommendations = useCallback(async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const token = localStorage.getItem("startupsync_token");
      if (!token) throw new Error("Please log in again to view AI recommendations.");
      const userId = readTokenUserId(token);
      if (!userId) throw new Error("Your login token does not contain a valid user ID.");
      const response = await getRecommendations(role, targetPlural, userId);
      setRecommendations(recommendationsFromResponse(response).slice(0, 5));
    } catch (err) {
      setAiError(err.response?.data?.message || err.message || "Unable to load AI recommendations.");
      setRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  }, [role, targetPlural]);

  useEffect(() => {
    loadProfiles();
    loadRecommendations();
  }, [loadProfiles, loadRecommendations]);

  const matchedRecommendations = useMemo(() => {
    return recommendations.map((recommendation, index) => {
      const recId = datasetIdOf(recommendation) || idOf(recommendation);
      const recName = nameOf(recommendation, targetRole).trim().toLowerCase();
      const profile = profiles.find((candidate) => {
        const candidateDatasetId = datasetIdOf(candidate);
        const candidateName = nameOf(candidate, targetRole).trim().toLowerCase();
        return (recId && idOf(candidate) === recId) ||
          (recId && candidateDatasetId && recId === candidateDatasetId) ||
          (recName && candidateName && recName === candidateName);
      }) || null;
      return { key: `${recId || recName || "recommendation"}-${index}`, recommendation, profile, score: scoreOf(recommendation) };
    });
  }, [recommendations, profiles, targetRole]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return profiles.filter((profile) => [
      nameOf(profile, targetRole),
      locationOf(profile),
      ...detailsOf(profile, targetRole),
    ].join(" ").toLowerCase().includes(query));
  }, [profiles, search, targetRole]);

  const sendRequest = async (profile) => {
    const profileId = idOf(profile);
    if (!profileId || busyId) return;
    setBusyId(profileId);
    setError("");
    setNotice("");
    try {
      const token = localStorage.getItem("startupsync_token");
      if (!token) throw new Error("Please log in again before sending a request.");
      const response = await api.post(
        `/connections/${targetPlural}/${encodeURIComponent(profileId)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingIds((current) => current.includes(profileId) ? current : [...current, profileId]);
      setNotice(response.data?.message || `${targetLabel} request sent successfully.`);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to send the request.";
      if (err.response?.status === 409 || /already exists|already sent|pending request/i.test(message)) {
        setPendingIds((current) => current.includes(profileId) ? current : [...current, profileId]);
        setNotice("A request already exists. The profile is marked as request sent.");
      } else {
        setError(message);
      }
    } finally {
      setBusyId("");
    }
  };

  const renderCard = (profile, recommendation, score, key, isRecommended = false) => {
    const profileId = idOf(profile);
    const name = nameOf(profile, targetRole);
    const details = detailsOf(profile, targetRole);
    const registered = Boolean(profileId);
    const requested = pendingIds.includes(profileId);

    return (
      <article className="role-rec-card" key={key}>
        <div className="role-rec-card-top">
          <div className="role-rec-avatar">{name.charAt(0).toUpperCase()}</div>
          <div className="role-rec-heading">
            <h3>{name}</h3>
            <p>{details[0] || targetLabel}</p>
          </div>
          {score !== null && <div className="role-rec-score"><strong>{score}%</strong><span>Match</span></div>}
        </div>
        <div className="role-rec-location">{locationOf(profile)}</div>
        <div className="role-rec-details">
          {details.slice(0, 4).map((detail, index) => <span key={`${key}-d-${index}`}>{String(detail)}</span>)}
        </div>
        {!registered && <p className="role-rec-dataset-note">AI dataset profile — not linked to a registered StartupSync account.</p>}
        <div className="role-rec-actions">
          <button type="button" className="role-rec-secondary" onClick={() => setSelected({ profile, recommendation, targetRole })}>
            {registered ? "View Profile" : "Dataset Profile"} <ArrowRight size={15} />
          </button>
          <button type="button" className="role-rec-primary" disabled={!registered || requested || busyId === profileId} onClick={() => sendRequest(profile)}>
            {requested ? <><CheckCircle2 size={15} /> Request Sent</> : busyId === profileId ? "Sending..." : role === "founder" && targetRole === "mentor" ? "Request Mentorship" : "Connect"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="role-recommendations-page">
      <header className="role-rec-page-header">
        <div>
          <span className="role-rec-badge"><Sparkles size={15} /> AI DISCOVERY</span>
          <h2>Discover {targetPlural.charAt(0).toUpperCase() + targetPlural.slice(1)}</h2>
          <p>Explore registered profiles and AI-powered matches for your {role} account.</p>
        </div>
        <button type="button" className="role-rec-refresh" onClick={() => { loadProfiles(); loadRecommendations(); }} disabled={loading || aiLoading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {(error || notice) && <div className={`role-rec-message ${error ? "is-error" : "is-success"}`} role="status">
        {error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
        <span>{error || notice}</span>
        {error && <button type="button" onClick={loadProfiles}>Retry</button>}
      </div>}

      <section className="role-rec-section">
        <div className="role-rec-section-heading"><div><h3>Top 5 AI Recommendations</h3><p>Ranked by the StartupSync recommendation engine.</p></div></div>
        {aiLoading ? <p className="role-rec-empty">Loading AI recommendations...</p> :
          aiError ? <div className="role-rec-empty"><AlertCircle size={22} /><p>{aiError}</p><button type="button" onClick={loadRecommendations}>Try again</button></div> :
          matchedRecommendations.length ? <div className="role-rec-grid">
            {matchedRecommendations.map(({ key, recommendation, profile, score }) =>
              renderCard(
                profile || { ...recommendation, id: "", _id: "", profileId: "", profile_id: "" },
                recommendation,
                score,
                key,
                true
              ))}
          </div> : <p className="role-rec-empty">No AI recommendations were returned for this profile yet.</p>}
      </section>

      <section className="role-rec-section">
        <div className="role-rec-section-heading"><div><h3>All Registered {targetPlural.charAt(0).toUpperCase() + targetPlural.slice(1)}</h3><p>Browse active StartupSync accounts.</p></div></div>
        <div className="role-rec-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${targetPlural}...`} /></div>
        {loading ? <p className="role-rec-empty">Loading registered profiles...</p> :
          filteredProfiles.length ? <div className="role-rec-grid">
            {filteredProfiles.map((profile, index) => renderCard(profile, null, null, idOf(profile) || `${nameOf(profile, targetRole)}-${index}`))}
          </div> : <p className="role-rec-empty">{error || `No registered ${targetPlural} match your search.`}</p>}
      </section>

      {selected && <div className="role-rec-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
        <section className="role-rec-modal" role="dialog" aria-modal="true" aria-label={`${nameOf(selected.profile, selected.targetRole)} profile`} onClick={(event) => event.stopPropagation()}>
          <button type="button" className="role-rec-modal-close" aria-label="Close profile" onClick={() => setSelected(null)}><X size={20} /></button>
          <span className="role-rec-badge">{selected.profile?.id || selected.profile?._id ? "REGISTERED PROFILE" : "AI DATASET PROFILE"}</span>
          <h2>{nameOf(selected.profile, selected.targetRole)}</h2>
          <p className="role-rec-modal-location">{locationOf(selected.profile)}</p>
          <div className="role-rec-modal-fields">
            {Object.entries(selected.profile || {}).filter(([key, value]) => !["_id", "id", "userId", "aiDatasetId", "__v", "createdAt", "updatedAt"].includes(key) && value !== "" && value != null).map(([key, value]) => (
              <div className="role-rec-modal-field" key={key}>
                <span>{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</span>
                <strong>{Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value)}</strong>
              </div>
            ))}
          </div>
          {!(selected.profile?.id || selected.profile?._id) && <p className="role-rec-dataset-note">This AI dataset record is not linked to a registered account. You can inspect the recommendation, but a connection request cannot be sent to a dataset row.</p>}
        </section>
      </div>}
    </section>
  );
}

export default RoleRecommendations;
