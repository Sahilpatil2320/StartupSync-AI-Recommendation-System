
import { useEffect, useState } from "react";
import { Save, RefreshCw, UserRound } from "lucide-react";
import api from "../../../services/api";
import "./FounderProfile.css";

const emptyProfile = {
  startupName: "",
  industry: "",
  domain: "",
  description: "",
  foundedYear: "",
  startupStage: "",
  teamSize: "",
  businessModel: "",
  problemStatement: "",
  solution: "",
  targetMarket: "",
  targetCustomers: "",
  technologies: "",
  programmingLanguages: "",
  fundingStage: "",
  fundingRaised: "",
  fundingRequired: "",
  website: "",
  linkedin: "",
  github: "",
};

const fields = [
  ["startupName", "Startup Name", true],
  ["industry", "Industry", true],
  ["domain", "Domain", true],
  ["description", "Description", true, "textarea"],
  ["foundedYear", "Founded Year"],
  ["startupStage", "Startup Stage"],
  ["teamSize", "Team Size"],
  ["businessModel", "Business Model"],
  ["problemStatement", "Problem Statement", false, "textarea"],
  ["solution", "Proposed Solution", false, "textarea"],
  ["targetMarket", "Target Market"],
  ["targetCustomers", "Target Customers"],
  ["technologies", "Technologies (comma-separated)"],
  ["programmingLanguages", "Programming Languages (comma-separated)"],
  ["fundingStage", "Funding Stage"],
  ["fundingRaised", "Funding Raised"],
  ["fundingRequired", "Funding Required"],
  ["website", "Website URL"],
  ["linkedin", "LinkedIn URL"],
  ["github", "GitHub URL"],
];

function FounderProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const token = localStorage.getItem("startupsync_token");
        if (!token) throw new Error("Please log in again.");

        const response = await api.get("/profiles/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!active) return;

        const data = response.data?.profile;
        if (data) {
          setProfile({
            ...emptyProfile,
            ...data,
            technologies: Array.isArray(data.technologies)
              ? data.technologies.join(", ")
              : data.technologies || "",
            programmingLanguages: Array.isArray(data.programmingLanguages)
              ? data.programmingLanguages.join(", ")
              : data.programmingLanguages || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load your profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profile.startupName.trim() ||
        !profile.industry.trim() ||
        !profile.domain.trim() ||
        !profile.description.trim()) {
      setError("Startup name, industry, domain and description are required.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("startupsync_token");
      if (!token) throw new Error("Please log in again.");

      const payload = { ...profile };

      for (const key of ["technologies", "programmingLanguages"]) {
        if (typeof payload[key] === "string") {
          payload[key] = payload[key]
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      if (payload.foundedYear !== "") {
        payload.foundedYear = Number(payload.foundedYear);
      }

      if (payload.teamSize !== "") {
        payload.teamSize = Number(payload.teamSize);
      }

      for (const key of ["fundingRaised", "fundingRequired"]) {
        if (payload[key] !== "") payload[key] = Number(payload[key]);
      }

      const response = await api.put("/profiles/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.profile) {
        setProfile((current) => ({
          ...current,
          ...response.data.profile,
          technologies: Array.isArray(response.data.profile.technologies)
            ? response.data.profile.technologies.join(", ")
            : current.technologies,
          programmingLanguages: Array.isArray(
            response.data.profile.programmingLanguages
          )
            ? response.data.profile.programmingLanguages.join(", ")
            : current.programmingLanguages,
        }));
      }

      setSuccess(response.data?.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="founder-profile-page">Loading your profile...</div>;
  }

  return (
    <main className="founder-profile-page">
      <header className="founder-profile-header">
        <div className="founder-profile-icon"><UserRound size={25} /></div>
        <div>
          <p className="founder-profile-eyebrow">ACCOUNT</p>
          <h1>Founder Profile</h1>
          <p>Manage your startup details and public profile.</p>
        </div>
      </header>

      {error && <div className="founder-profile-alert error">{error}</div>}
      {success && <div className="founder-profile-alert success">{success}</div>}

      <form className="founder-profile-card" onSubmit={handleSubmit}>
        <div className="founder-profile-grid">
          {fields.map(([name, label, required, type]) => (
            <label
              key={name}
              className={type === "textarea" ? "full-width" : ""}
            >
              <span>{label}{required ? " *" : ""}</span>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={profile[name] ?? ""}
                  onChange={handleChange}
                  required={Boolean(required)}
                  rows={4}
                />
              ) : (
                <input
                  name={name}
                  value={profile[name] ?? ""}
                  onChange={handleChange}
                  required={Boolean(required)}
                  type={
                    ["foundedYear", "teamSize", "fundingRaised", "fundingRequired"].includes(name)
                      ? "number"
                      : "text"
                  }
                  min={
                    ["foundedYear", "teamSize", "fundingRaised", "fundingRequired"].includes(name)
                      ? "0"
                      : undefined
                  }
                />
              )}
            </label>
          ))}
        </div>

        <div className="founder-profile-actions">
          <button type="button" className="secondary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Reload
          </button>
          <button type="submit" disabled={saving}>
            <Save size={17} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default FounderProfile;