import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, UserRound } from "lucide-react";
import api from "../../../services/api";
import "./RoleProfile.css";

const fieldsByRole = {
  founder: [
    ["startupName", "Startup name", true], ["industry", "Industry", true], ["domain", "Domain", true],
    ["description", "Description", true, "textarea"], ["foundedYear", "Founded year"], ["startupStage", "Startup stage"],
    ["teamSize", "Team size"], ["businessModel", "Business model"], ["problemStatement", "Problem statement", false, "textarea"],
    ["solution", "Solution", false, "textarea"], ["targetMarket", "Target market"], ["targetCustomers", "Target customers"],
    ["technologies", "Technologies (comma-separated)", false, "array"], ["programmingLanguages", "Programming languages (comma-separated)", false, "array"],
    ["fundingStage", "Funding stage"], ["fundingRaised", "Funding raised"], ["fundingRequired", "Funding required"],
    ["website", "Website"], ["linkedin", "LinkedIn"], ["github", "GitHub"], ["productDemo", "Product demo URL"]
  ],
  investor: [
    ["firmName", "Organization / fund name", true], ["investorType", "Investor type"], ["location", "Location", true],
    ["investmentIndustries", "Investment industries (comma-separated)", false, "array"],
    ["investmentDomains", "Investment domains (comma-separated)", false, "array"],
    ["preferredStartupStages", "Preferred startup stages (comma-separated)", false, "array"],
    ["preferredGeography", "Preferred geography (comma-separated)", false, "array"],
    ["minimumInvestment", "Minimum investment"], ["maximumInvestment", "Maximum investment"],
    ["previousInvestments", "Previous investments (comma-separated)", false, "array"],
    ["portfolioCompanies", "Portfolio companies (comma-separated)", false, "array"],
    ["investmentThesis", "Investment thesis", false, "textarea"], ["investmentTags", "Investment tags (comma-separated)", false, "array"],
    ["investmentFocus", "Investment focus", false, "textarea"], ["bio", "Investor bio", false, "textarea"],
    ["website", "Website"], ["linkedin", "LinkedIn"]
  ],
  mentor: [
    ["location", "Location", true], ["industry", "Industry", true], ["domain", "Domain", true],
    ["expertise", "Expertise (comma-separated)", false, "array"], ["skills", "Skills (comma-separated)", false, "array"],
    ["experienceYears", "Years of experience"], ["professionalInterests", "Professional interests (comma-separated)", false, "array"],
    ["mentoringInterests", "Mentoring interests (comma-separated)", false, "array"], ["mentoringAreas", "Mentoring areas (comma-separated)", false, "array"],
    ["preferredStartupStages", "Preferred startup stages (comma-separated)", false, "array"], ["preferredDomains", "Preferred domains (comma-separated)", false, "array"],
    ["availability", "Availability"], ["bio", "Professional bio", false, "textarea"], ["linkedin", "LinkedIn"], ["website", "Website"]
  ],
  student: [
    ["college", "College / university", true], ["branch", "Branch / course", true], ["graduationYear", "Graduation year", true],
    ["gpa", "GPA (out of 10)"], ["technicalSkills", "Technical skills (comma-separated)", false, "array"],
    ["programmingLanguages", "Programming languages (comma-separated)", false, "array"], ["frameworks", "Frameworks (comma-separated)", false, "array"],
    ["tools", "Tools (comma-separated)", false, "array"], ["internshipDone", "Completed an internship", false, "boolean"],
    ["internshipDomain", "Internship domain"], ["internshipDescription", "Internship description", false, "textarea"],
    ["projects", "Projects (comma-separated)", false, "array"], ["interestedIndustry", "Interested industries (comma-separated)", false, "array"],
    ["interestedDomain", "Interested domains (comma-separated)", false, "array"], ["placementDomain", "Placement domain"],
    ["careerGoal", "Career goal", false, "textarea"], ["clubs", "Clubs (comma-separated)", false, "array"],
    ["certifications", "Certifications (comma-separated)", false, "array"], ["achievements", "Achievements (comma-separated)", false, "array"],
    ["startupInterests", "Startup interests (comma-separated)", false, "array"]
  ],
};

const enumOptions = {
  startupStage: [["idea", "Idea"], ["prototype", "Prototype"], ["mvp", "MVP"], ["early_stage", "Early stage"], ["growth", "Growth"], ["scaling", "Scaling"]],
  fundingStage: [["bootstrapped", "Bootstrapped"], ["pre_seed", "Pre-seed"], ["seed", "Seed"], ["series_a", "Series A"], ["series_b", "Series B"], ["series_c", "Series C"], ["growth", "Growth"]],
  investorType: [["angel_investor", "Angel investor"], ["venture_capital", "Venture capital"], ["corporate_investor", "Corporate investor"], ["private_equity", "Private equity"], ["family_office", "Family office"], ["individual_investor", "Individual investor"]],
  availability: [["available", "Available"], ["limited", "Limited"], ["not_available", "Not available"]],
};
const numericFields = ["foundedYear", "teamSize", "fundingRaised", "fundingRequired", "minimumInvestment", "maximumInvestment", "experienceYears", "graduationYear", "gpa"];
const pretty = (role) => role.charAt(0).toUpperCase() + role.slice(1);

function RoleProfile({ role = "founder" }) {
  const [user, setUser] = useState({});
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fields = useMemo(() => fieldsByRole[role] || [], [role]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        const token = localStorage.getItem("startupsync_token");
        if (!token) throw new Error("Please log in again.");
        const response = await api.get("/profiles/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!active) return;
        const data = response.data || {};
        setUser(data.user || {});
        const raw = data.profile || {};
        const normalized = {};
        fields.forEach(([key, , , type]) => {
          const value = raw[key];
          normalized[key] = type === "array" ? (Array.isArray(value) ? value.join(", ") : value || "")
            : type === "boolean" ? Boolean(value) : value ?? "";
        });
        setProfile(normalized);
      } catch (err) {
        if (active) setError(err.response?.data?.message || err.message || "Unable to load your profile.");
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [role, fields]);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
    setSuccess("");
  };

  async function submit(event) {
    event.preventDefault(); setError(""); setSuccess("");
    if (role === "admin" || !fields.length) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("startupsync_token");
      const payload = { ...profile };
      fields.forEach(([key, , , type]) => {
        if (type === "array") payload[key] = String(payload[key] || "").split(",").map((v) => v.trim()).filter(Boolean);
        if (numericFields.includes(key) && payload[key] !== "") payload[key] = Number(payload[key]);
        if (enumOptions[key] && !payload[key]) delete payload[key];
      });
      const response = await api.put("/profiles/me", payload, { headers: { Authorization: `Bearer ${token}` } });
      const saved = response.data?.profile || payload;
      const normalized = {};
      fields.forEach(([key, , , type]) => normalized[key] = type === "array" ? (Array.isArray(saved[key]) ? saved[key].join(", ") : "") : saved[key] ?? "");
      setProfile(normalized);
      setSuccess(response.data?.message || "Profile updated successfully.");
    } catch (err) { setError(err.response?.data?.message || err.message || "Unable to save your profile."); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="role-profile-page"><p>Loading your profile...</p></main>;

  return <main className="role-profile-page">
    <header className="role-profile-header">
      <div className="role-profile-icon"><UserRound size={25} /></div>
      <div><p className="role-profile-eyebrow">ACCOUNT</p><h1>{role === "admin" ? "Account Profile" : `${pretty(role)} Profile`}</h1><p>Manage your account information and public StartupSync profile.</p></div>
    </header>
    {error && <div className="role-profile-alert error" role="alert">{error}</div>}
    {success && <div className="role-profile-alert success" role="status">{success}</div>}
    <section className="role-profile-card">
      <div className="role-profile-account">
        <div className="role-profile-avatar">{(user.name || pretty(role)).charAt(0).toUpperCase()}</div>
        <div><h2>{user.name || pretty(role)}</h2><p>{user.email || "Email not available"} · {pretty(user.role || role)} account</p></div>
      </div>
      {role === "admin" ? <p className="role-profile-readonly">Administrator account details are shown here. Profile editing is not enabled for administrator accounts.</p> :
        <form onSubmit={submit}>
          <div className="role-profile-grid">
            {fields.map(([key, label, required, type]) => <label key={key} className={type === "textarea" ? "role-profile-field full" : "role-profile-field"}>
              <span>{label}{required ? " *" : ""}</span>
              {type === "textarea" ? <textarea name={key} value={profile[key] ?? ""} onChange={change} required={Boolean(required)} rows={4} /> :
                type === "boolean" ? <select name={key} value={profile[key] ? "true" : "false"} onChange={(e) => setProfile((old) => ({ ...old, [key]: e.target.value === "true" }))}><option value="false">No</option><option value="true">Yes</option></select> :
                enumOptions[key] ? <select name={key} value={profile[key] ?? ""} onChange={change} required={Boolean(required)}><option value="">Select {label.toLowerCase()}</option>{enumOptions[key].map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> :
                <input name={key} value={profile[key] ?? ""} onChange={change} required={Boolean(required)} type={numericFields.includes(key) ? "number" : "text"} min={numericFields.includes(key) ? "0" : undefined} />}
            </label>)}
          </div>
          <div className="role-profile-actions"><button type="button" className="secondary" onClick={() => window.location.reload()}><RefreshCw size={16}/> Reload</button><button type="submit" disabled={saving}><Save size={17}/>{saving ? "Saving..." : "Save Profile"}</button></div>
        </form>}
    </section>
  </main>;
}
export default RoleProfile;
