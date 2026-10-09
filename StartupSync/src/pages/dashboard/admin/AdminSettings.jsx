import { useState } from "react";
import {
  Bell,
  Check,
  Globe,
  KeyRound,
  LockKeyhole,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound
} from "lucide-react";

import "./AdminSettings.css";

const initialSettings = {
  fullName: "StartupSync Administrator",
  email: "admin@startupsync.com",
  phone: "",
  organization: "StartupSync",
  timezone: "Asia/Kolkata",
  language: "English",
  emailNotifications: true,
  platformAlerts: true,
  securityAlerts: true,
  weeklyReports: true,
  maintenanceAlerts: true,
  twoFactorAuthentication: false,
  loginAlerts: true
};

function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const updateSetting = (field, value) => {
    setSettings((current) => ({
      ...current,
      [field]: value
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setSaved(false);
  };

  const handleSecurityAction = (action) => {
    window.alert(
      `${action} will be connected to the backend authentication system later.`
    );
  };

  return (
    <section className="admin-settings-page">
      {/* Header */}

      <div className="admin-settings-header">
        <div>
          <span className="admin-settings-eyebrow">
            Administration
          </span>

          <h1>Settings</h1>

          <p>
            Manage administrator preferences, platform controls
            and security settings.
          </p>
        </div>

        <div className="admin-settings-header-actions">
          <button
            type="button"
            className="admin-settings-reset-button"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            className="admin-settings-save-button"
            onClick={handleSave}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Profile */}

      <div className="admin-settings-layout">
        <aside className="admin-settings-navigation">
          <div className="admin-settings-nav-heading">
            Settings
          </div>

          <a href="#profile">
            <UserRound size={16} />
            Administrator Profile
          </a>

          <a href="#platform">
            <Globe size={16} />
            Platform Preferences
          </a>

          <a href="#notifications">
            <Bell size={16} />
            Notifications
          </a>

          <a href="#security">
            <ShieldCheck size={16} />
            Security
          </a>

          <a href="#account">
            <KeyRound size={16} />
            Account
          </a>
        </aside>

        <div className="admin-settings-content">
          {/* Administrator profile */}

          <section
            id="profile"
            className="admin-settings-card"
          >
            <div className="admin-settings-card-header">
              <div className="admin-settings-card-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h2>Administrator Profile</h2>

                <p>
                  Manage the basic information associated with
                  the administrator account.
                </p>
              </div>
            </div>

            <div className="admin-settings-form-grid">
              <div className="admin-settings-field">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={settings.fullName}
                  onChange={(event) =>
                    updateSetting(
                      "fullName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-settings-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="admin-settings-input-icon">
                  <Mail size={15} />

                  <input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(event) =>
                      updateSetting(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={settings.phone}
                  onChange={(event) =>
                    updateSetting(
                      "phone",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-settings-field">
                <label htmlFor="organization">
                  Organization
                </label>

                <input
                  id="organization"
                  type="text"
                  value={settings.organization}
                  onChange={(event) =>
                    updateSetting(
                      "organization",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* Platform preferences */}

          <section
            id="platform"
            className="admin-settings-card"
          >
            <div className="admin-settings-card-header">
              <div className="admin-settings-card-icon">
                <Globe size={19} />
              </div>

              <div>
                <h2>Platform Preferences</h2>

                <p>
                  Configure language and regional preferences
                  for the administration interface.
                </p>
              </div>
            </div>

            <div className="admin-settings-form-grid">
              <div className="admin-settings-field">
                <label htmlFor="timezone">
                  Timezone
                </label>

                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(event) =>
                    updateSetting(
                      "timezone",
                      event.target.value
                    )
                  }
                >
                  <option value="Asia/Kolkata">
                    Asia/Kolkata (IST)
                  </option>

                  <option value="UTC">
                    UTC
                  </option>

                  <option value="Asia/Dubai">
                    Asia/Dubai
                  </option>

                  <option value="Europe/London">
                    Europe/London
                  </option>
                </select>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="language">
                  Language
                </label>

                <select
                  id="language"
                  value={settings.language}
                  onChange={(event) =>
                    updateSetting(
                      "language",
                      event.target.value
                    )
                  }
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}

          <section
            id="notifications"
            className="admin-settings-card"
          >
            <div className="admin-settings-card-header">
              <div className="admin-settings-card-icon">
                <Bell size={19} />
              </div>

              <div>
                <h2>Notification Preferences</h2>

                <p>
                  Choose which platform events should generate
                  administrator notifications.
                </p>
              </div>
            </div>

            <div className="admin-settings-toggle-list">
              <div className="admin-settings-toggle-item">
                <div>
                  <strong>Email Notifications</strong>

                  <span>
                    Receive important administrative updates
                    through email.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.emailNotifications
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "emailNotifications",
                      !settings.emailNotifications
                    )
                  }
                  aria-label="Toggle email notifications"
                >
                  <span />
                </button>
              </div>

              <div className="admin-settings-toggle-item">
                <div>
                  <strong>Platform Alerts</strong>

                  <span>
                    Receive alerts about important platform
                    activity.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.platformAlerts
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "platformAlerts",
                      !settings.platformAlerts
                    )
                  }
                  aria-label="Toggle platform alerts"
                >
                  <span />
                </button>
              </div>

              <div className="admin-settings-toggle-item">
                <div>
                  <strong>Security Alerts</strong>

                  <span>
                    Receive notifications about security-related
                    events.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.securityAlerts
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "securityAlerts",
                      !settings.securityAlerts
                    )
                  }
                  aria-label="Toggle security alerts"
                >
                  <span />
                </button>
              </div>

              <div className="admin-settings-toggle-item">
                <div>
                  <strong>Weekly Reports</strong>

                  <span>
                    Receive a summary of platform activity each
                    week.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.weeklyReports
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "weeklyReports",
                      !settings.weeklyReports
                    )
                  }
                  aria-label="Toggle weekly reports"
                >
                  <span />
                </button>
              </div>

              <div className="admin-settings-toggle-item">
                <div>
                  <strong>Maintenance Alerts</strong>

                  <span>
                    Receive advance notifications about planned
                    maintenance.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.maintenanceAlerts
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "maintenanceAlerts",
                      !settings.maintenanceAlerts
                    )
                  }
                  aria-label="Toggle maintenance alerts"
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          {/* Security */}

          <section
            id="security"
            className="admin-settings-card"
          >
            <div className="admin-settings-card-header">
              <div className="admin-settings-card-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <h2>Security</h2>

                <p>
                  Manage administrator account protection and
                  login monitoring preferences.
                </p>
              </div>
            </div>

            <div className="admin-settings-security-list">
              <div className="admin-security-item">
                <div className="admin-security-item-icon">
                  <LockKeyhole size={18} />
                </div>

                <div className="admin-security-item-content">
                  <strong>
                    Two-Factor Authentication
                  </strong>

                  <span>
                    Add an additional verification step when
                    administrators sign in.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.twoFactorAuthentication
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "twoFactorAuthentication",
                      !settings.twoFactorAuthentication
                    )
                  }
                  aria-label="Toggle two-factor authentication"
                >
                  <span />
                </button>
              </div>

              <div className="admin-security-item">
                <div className="admin-security-item-icon">
                  <ShieldCheck size={18} />
                </div>

                <div className="admin-security-item-content">
                  <strong>Login Alerts</strong>

                  <span>
                    Notify administrators when a new login is
                    detected.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    settings.loginAlerts
                      ? "admin-toggle active"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    updateSetting(
                      "loginAlerts",
                      !settings.loginAlerts
                    )
                  }
                  aria-label="Toggle login alerts"
                >
                  <span />
                </button>
              </div>
            </div>

            <div className="admin-security-actions">
              <button
                type="button"
                onClick={() =>
                  handleSecurityAction("Change password")
                }
              >
                <KeyRound size={15} />
                Change Password
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSecurityAction(
                    "Review active sessions"
                  )
                }
              >
                <ShieldCheck size={15} />
                Review Active Sessions
              </button>
            </div>
          </section>

          {/* Account */}

          <section
            id="account"
            className="admin-settings-card admin-account-card"
          >
            <div className="admin-settings-card-header">
              <div className="admin-settings-card-icon">
                <KeyRound size={19} />
              </div>

              <div>
                <h2>Account</h2>

                <p>
                  Administrative account controls and access
                  information.
                </p>
              </div>
            </div>

            <div className="admin-account-info">
              <div>
                <span>Account Role</span>
                <strong>Administrator</strong>
              </div>

              <div>
                <span>Access Level</span>
                <strong>Platform Management</strong>
              </div>

              <div>
                <span>Account Status</span>
                <strong className="admin-account-active">
                  Active
                </strong>
              </div>
            </div>

            <div className="admin-account-warning">
              <ShieldCheck size={17} />

              <div>
                <strong>Administrator access</strong>

                <p>
                  Changes to administrator permissions should
                  be reviewed carefully before being connected
                  to the production backend.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom save bar */}

      <div className="admin-settings-bottom-bar">
        <span>
          {saved
            ? "Your settings have been saved locally."
            : "Changes are currently stored in the frontend state."}
        </span>

        <button
          type="button"
          onClick={handleSave}
        >
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </section>
  );
}

export default AdminSettings;