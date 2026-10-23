
import { useEffect, useState } from "react";
import { Bell, LockKeyhole, LogOut, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FounderSettings.css";

function FounderSettings() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    activityNotifications: true,
    compactView: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("startupsync_founder_settings") || "{}"
      );
      setPreferences((current) => ({ ...current, ...stored }));
    } catch {
      // Use default preferences if stored settings are invalid.
    }
  }, []);

  function togglePreference(name) {
    setPreferences((current) => {
      const next = { ...current, [name]: !current[name] };
      localStorage.setItem("startupsync_founder_settings", JSON.stringify(next));
      return next;
    });
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem("startupsync_founder_settings", JSON.stringify(preferences));
    setSaved(true);
  }

  function signOut() {
    localStorage.removeItem("startupsync_token");
    localStorage.removeItem("startupsync_user");
    navigate("/login", { replace: true });
  }

  return (
    <main className="founder-settings-page">
      <header className="founder-settings-header">
        <div className="founder-settings-icon"><Settings size={25} /></div>
        <div>
          <p>ACCOUNT</p>
          <h1>Settings</h1>
          <span>Manage your StartupSync preferences.</span>
        </div>
      </header>

      <section className="founder-settings-card">
        <div className="founder-settings-section-title">
          <Bell size={20} />
          <div>
            <h2>Notifications</h2>
            <p>Choose which notifications you want to receive in this interface.</p>
          </div>
        </div>

        <label className="founder-settings-option">
          <span>
            <strong>Email notifications</strong>
            <small>Preference for email-related updates.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.emailNotifications}
            onChange={() => togglePreference("emailNotifications")}
          />
        </label>

        <label className="founder-settings-option">
          <span>
            <strong>Activity notifications</strong>
            <small>Show activity and workspace updates.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.activityNotifications}
            onChange={() => togglePreference("activityNotifications")}
          />
        </label>
      </section>

      <section className="founder-settings-card">
        <div className="founder-settings-section-title">
          <UserRound size={20} />
          <div>
            <h2>Appearance</h2>
            <p>Adjust how workspace content is displayed.</p>
          </div>
        </div>

        <label className="founder-settings-option">
          <span>
            <strong>Compact view</strong>
            <small>Save your compact-view preference on this device.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.compactView}
            onChange={() => togglePreference("compactView")}
          />
        </label>

        <button className="founder-settings-save" type="button" onClick={saveSettings}>
          {saved ? "Preferences Saved" : "Save Preferences"}
        </button>
      </section>

      <section className="founder-settings-card">
        <div className="founder-settings-section-title">
          <LockKeyhole size={20} />
          <div>
            <h2>Account and security</h2>
            <p>Your session is controlled by your StartupSync login.</p>
          </div>
        </div>

        <button className="founder-settings-signout" type="button" onClick={signOut}>
          <LogOut size={17} /> Sign Out
        </button>
      </section>
    </main>
  );
}

export default FounderSettings;