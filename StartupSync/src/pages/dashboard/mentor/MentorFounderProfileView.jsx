import { ArrowLeft, MapPin, Rocket, UsersRound, CalendarDays, Handshake } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./MentorFounderProfileView.css";

const asText = (value, fallback = "Not specified") => {
  if (value === undefined || value === null || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  if (typeof value === "object") {
    const parts = [value.city, value.state, value.country].filter(Boolean);
    return parts.length ? parts.join(", ") : fallback;
  }
  return String(value);
};

export default function MentorFounderProfileView() {
  const { founderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.profile || null;

  const name = profile?.startupName || profile?.companyName || profile?.founder_name ||
    profile?.startup_name || profile?.name || profile?.founder?.name || "Founder profile";
  const industry = profile?.industry || profile?.domain || profile?.sector;
  const stage = profile?.fundingStage || profile?.funding_stage || profile?.stage;
  const description = profile?.description || profile?.tagline || profile?.startupDescription ||
    profile?.businessDescription;
  const locationText = profile?.location || profile?.city;
  const skills = profile?.skills || profile?.expertise || profile?.technologies || [];
  const needs = profile?.mentoringNeeds || profile?.mentorshipNeeds || profile?.lookingFor ||
    profile?.needs || profile?.supportRequired || [];
  const team = profile?.teamSize ?? profile?.numberOfEmployees ?? profile?.employees;
  const founded = profile?.foundedYear || profile?.founded || profile?.yearFounded;

  return (
    <main className="mentor-founder-profile-page">
      <button className="mfp-back" type="button" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back to recommendations
      </button>

      {!profile ? (
        <section className="mfp-empty">
          <div className="mfp-icon"><Rocket size={28} /></div>
          <h1>Founder profile unavailable</h1>
          <p>This profile was opened directly or the previous page did not pass its data. Return to Mentor → Founder recommendations and select View Profile again.</p>
          <p className="mfp-id">Profile ID: {founderId || "Not provided"}</p>
          <button type="button" onClick={() => navigate("/dashboard/mentor/startups")}>Return to Discover Startups</button>
        </section>
      ) : (
        <>
          <header className="mfp-header">
            <div className="mfp-avatar">{String(name).charAt(0).toUpperCase()}</div>
            <div className="mfp-title">
              <span className="mfp-eyebrow">StartupSync · Founder profile</span>
              <h1>{name}</h1>
              <p>{asText(industry, "Industry not specified")} · {asText(stage, "Stage not specified")}</p>
            </div>
            <div className="mfp-score">
              <strong>{Math.round(Number(profile._aiScore ?? profile.score_percentage ?? profile.scorePercentage ?? 0))}%</strong>
              <span>Relative match</span>
            </div>
          </header>

          <section className="mfp-grid">
            <article className="mfp-card mfp-wide">
              <h2>About the startup</h2>
              <p>{asText(description, "No startup description was provided in this recommendation record.")}</p>
            </article>
            <article className="mfp-card">
              <h2><MapPin size={18} /> Location</h2>
              <p>{asText(locationText)}</p>
            </article>
            <article className="mfp-card">
              <h2><UsersRound size={18} /> Team size</h2>
              <p>{asText(team)}</p>
            </article>
            <article className="mfp-card">
              <h2><CalendarDays size={18} /> Founded</h2>
              <p>{asText(founded)}</p>
            </article>
            <article className="mfp-card">
              <h2><Handshake size={18} /> Mentorship needs</h2>
              <p>{asText(needs)}</p>
            </article>
            <article className="mfp-card mfp-wide">
              <h2>Skills, expertise and technology</h2>
              <div className="mfp-tags">
                {(Array.isArray(skills) ? skills : String(skills || "").split(/[,;|]/))
                  .map((item) => String(item).trim()).filter(Boolean).map((item, index) =>
                    <span key={`${item}-${index}`}>{item}</span>
                  )}
                {!skills || (Array.isArray(skills) && skills.length === 0) ? <span>Not specified</span> : null}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}