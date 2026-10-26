import { useEffect, useState } from "react";
import { Bell, Eye, LockKeyhole, LogOut, Save, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./RoleSettings.css";

const roleTitle = (role) => role.charAt(0).toUpperCase() + role.slice(1);

function RoleSettings({ role = "founder" }) {
  const navigate = useNavigate();
  const storageKey = `startupsync_${role}_settings`;
  const [preferences, setPreferences] = useState({ emailNotifications: true, activityNotifications: true, compactView: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      setPreferences((current) => ({ ...current, ...stored }));
    } catch { /* Keep defaults when stored preferences are invalid. */ }
  }, [storageKey]);

  const toggle = (key) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    setSaved(true);
  };

  const signOut = () => {
    localStorage.removeItem("startupsync_token");
    localStorage.removeItem("startupsync_user");
    navigate("/login", { replace: true });
  };

  return <main className="role-settings-page">
    <header className="role-settings-header"><div className="role-settings-icon"><Settings size={25}/></div><div><p>ACCOUNT</p><h1>Settings</h1><span>Manage preferences for your {roleTitle(role)} workspace.</span></div></header>
    <section className="role-settings-card">
      <div className="role-settings-title"><Bell size={21}/><div><h2>Notifications</h2><p>Choose how activity updates are shown in your workspace.</p></div></div>
      <label className="role-settings-option"><span><strong>Email notifications</strong><small>Preference for email-related updates when supported.</small></span><input type="checkbox" checked={preferences.emailNotifications} onChange={() => toggle("emailNotifications")}/></label>
      <label className="role-settings-option"><span><strong>Activity notifications</strong><small>Show connection, message, and workspace activity.</small></span><input type="checkbox" checked={preferences.activityNotifications} onChange={() => toggle("activityNotifications")}/></label>
    </section>
    <section className="role-settings-card">
      <div className="role-settings-title"><Eye size={21}/><div><h2>Appearance</h2><p>Customize the way your workspace is displayed.</p></div></div>
      <label className="role-settings-option"><span><strong>Compact view</strong><small>Save a compact-view preference on this device.</small></span><input type="checkbox" checked={preferences.compactView} onChange={() => toggle("compactView")}/></label>
      <div className="role-settings-actions"><span className={saved ? "role-settings-saved" : ""}>{saved ? "Preferences saved." : "Changes are saved when you select Save Preferences."}</span><button type="button" onClick={save}><Save size={16}/>{saved ? "Saved" : "Save Preferences"}</button></div>
    </section>
    <section className="role-settings-card">
      <div className="role-settings-title"><LockKeyhole size={21}/><div><h2>Account and security</h2><p>Your account session is protected by your StartupSync login.</p></div></div>
      <button type="button" className="role-settings-signout" onClick={signOut}><LogOut size={17}/> Sign Out</button>
    </section>
  </main>;
}
export default RoleSettings;
