import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Globe,
  MapPin,
  Rocket,
  Target,
  UsersRound
} from "lucide-react";

import "./FounderStartup.css";

function FounderStartup() {
  return (
    <div className="founder-startup-page">

      {/* Page Header */}
      <section className="founder-startup-header">
        <div>
          <span className="founder-startup-badge">
            Startup Management
          </span>

          <h2>My Startup</h2>

          <p>
            Manage your startup profile, track important details,
            and present your startup to the StartupSync ecosystem.
          </p>
        </div>

        <button
          type="button"
          className="founder-startup-edit-button"
        >
          <Edit3 size={17} />
          Edit Startup
        </button>
      </section>

      {/* Startup Profile */}
      <section className="founder-startup-profile">

        <div className="founder-startup-profile-main">

          <div className="founder-startup-logo">
            <Rocket size={30} />
          </div>

          <div className="founder-startup-info">
            <div className="founder-startup-name-row">
              <h1>StartupSync Technologies</h1>

              <span className="founder-startup-status">
                <CheckCircle2 size={14} />
                Active
              </span>
            </div>

            <p className="founder-startup-domain">
              Technology • SaaS • Startup Ecosystem
            </p>

            <p className="founder-startup-description">
              An integrated platform designed to connect
              entrepreneurs, investors, mentors, students and
              incubators within one startup ecosystem.
            </p>
          </div>

        </div>

        <div className="founder-startup-completion">

          <div className="founder-startup-completion-top">
            <span>Profile Completion</span>
            <strong>82%</strong>
          </div>

          <div className="founder-startup-progress">
            <div
              className="founder-startup-progress-value"
              style={{ width: "82%" }}
            />
          </div>

          <p>
            Complete the remaining profile information to
            improve your visibility.
          </p>

        </div>

      </section>

      {/* Key Information */}
      <section className="founder-startup-section">

        <div className="founder-startup-section-heading">
          <div>
            <h3>Startup Information</h3>
            <p>Important details about your startup</p>
          </div>
        </div>

        <div className="founder-startup-info-grid">

          <div className="founder-startup-info-card">
            <div className="founder-startup-info-icon">
              <Building2 size={19} />
            </div>

            <div>
              <span>Industry</span>
              <strong>Information Technology</strong>
            </div>
          </div>

          <div className="founder-startup-info-card">
            <div className="founder-startup-info-icon">
              <Target size={19} />
            </div>

            <div>
              <span>Startup Stage</span>
              <strong>Early Stage</strong>
            </div>
          </div>

          <div className="founder-startup-info-card">
            <div className="founder-startup-info-icon">
              <MapPin size={19} />
            </div>

            <div>
              <span>Location</span>
              <strong>Kolhapur, Maharashtra</strong>
            </div>
          </div>

          <div className="founder-startup-info-card">
            <div className="founder-startup-info-icon">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>Founded</span>
              <strong>2026</strong>
            </div>
          </div>

          <div className="founder-startup-info-card">
            <div className="founder-startup-info-icon">
              <UsersRound size={19} />
            </div>

            <div>
              <span>Team Size</span>
              <strong>8 Members</strong>
            </div>
          </div>

          <div className="founder-startup-info-card">
            <div className="founder-startup-info-icon">
              <Globe size={19} />
            </div>

            <div>
              <span>Website</span>
              <strong>startupsync.example</strong>
            </div>
          </div>

        </div>

      </section>

      {/* Problem & Solution */}
      <section className="founder-startup-two-column">

        <div className="founder-startup-panel">

          <div className="founder-startup-panel-heading">
            <div className="founder-startup-panel-icon">
              <Target size={19} />
            </div>

            <div>
              <h3>Problem Statement</h3>
              <p>What problem does the startup solve?</p>
            </div>
          </div>

          <p className="founder-startup-panel-text">
            Startup founders often need to search across
            multiple disconnected platforms to find investors,
            mentors, students, incubators and other ecosystem
            resources.
          </p>

        </div>

        <div className="founder-startup-panel">

          <div className="founder-startup-panel-heading">
            <div className="founder-startup-panel-icon">
              <Rocket size={19} />
            </div>

            <div>
              <h3>Solution</h3>
              <p>How does the startup address the problem?</p>
            </div>
          </div>

          <p className="founder-startup-panel-text">
            StartupSync provides an integrated ecosystem where
            different startup stakeholders can discover,
            connect and collaborate through a centralized
            platform.
          </p>

        </div>

      </section>

      {/* Startup Documents */}
      <section className="founder-startup-section">

        <div className="founder-startup-section-heading">
          <div>
            <h3>Startup Documents</h3>
            <p>Important files related to your startup</p>
          </div>

          <button
            type="button"
            className="founder-startup-small-button"
          >
            Add Document
          </button>
        </div>

        <div className="founder-startup-documents">

          <div className="founder-startup-document">
            <div className="founder-startup-document-icon">
              <FileText size={20} />
            </div>

            <div className="founder-startup-document-info">
              <strong>Startup Pitch Deck</strong>
              <span>PDF • Updated recently</span>
            </div>

            <button
              type="button"
              className="founder-startup-document-action"
              aria-label="Open pitch deck"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="founder-startup-document">
            <div className="founder-startup-document-icon">
              <FileText size={20} />
            </div>

            <div className="founder-startup-document-info">
              <strong>Business Plan</strong>
              <span>PDF • Updated recently</span>
            </div>

            <button
              type="button"
              className="founder-startup-document-action"
              aria-label="Open business plan"
            >
              <ArrowRight size={18} />
            </button>
          </div>

        </div>

      </section>

    </div>
  );
}

export default FounderStartup;