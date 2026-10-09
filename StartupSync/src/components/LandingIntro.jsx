import { ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import "./LandingIntro.css";

function LandingIntro() {
  return (
    <section className="landing-intro">

      <div className="container landing-intro-container">

        <div className="landing-content">

          <div className="ai-badge">
            <Sparkles size={16} />
            AI-Powered Startup Ecosystem
          </div>

          <h1>
            Build. Connect.
            <span> Grow Together.</span>
          </h1>

          <p className="landing-description">
            StartupSync brings entrepreneurs, investors, mentors,
            students and incubators together in one integrated
            startup ecosystem.
          </p>

          <div className="landing-actions">

            <Link to="/signup" className="btn btn-primary">
              Get Started
              <ArrowRight size={18} />
            </Link>

            <a href="#ecosystem" className="btn btn-secondary">
              Explore Ecosystem
            </a>

          </div>

          <div className="landing-stats">

            <div className="stat-item">
              <Users size={20} />

              <div>
                <strong>6+</strong>
                <span>User Roles</span>
              </div>
            </div>

            <div className="stat-item">
              <TrendingUp size={20} />

              <div>
                <strong>AI</strong>
                <span>Smart Matching</span>
              </div>
            </div>

            <div className="stat-item">

              <div>
                <strong>1</strong>
                <span>Unified Platform</span>
              </div>

            </div>

          </div>

        </div>

        <div className="platform-preview">

          <div className="preview-window">

            <div className="preview-header">

              <div className="window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="preview-title">
                StartupSync Dashboard
              </div>

            </div>

            <div className="preview-body">

              <div className="preview-welcome">
                <div>
                  <small>Welcome back</small>
                  <h3>Startup Dashboard</h3>
                </div>

                <div className="profile-circle">
                  PS
                </div>
              </div>

              <div className="preview-cards">

                <div className="preview-card">

                  <div className="preview-card-icon blue">
                    <TrendingUp size={18} />
                  </div>

                  <div>
                    <span>Funding Opportunities</span>
                    <strong>24</strong>
                  </div>

                </div>


                <div className="preview-card">

                  <div className="preview-card-icon purple">
                    <Users size={18} />
                  </div>

                  <div>
                    <span>Potential Connections</span>
                    <strong>18</strong>
                  </div>

                </div>

              </div>

              <div className="recommendation-preview">

                <div className="recommendation-heading">
                  <Sparkles size={17} />

                  <span>
                    AI Recommendations
                  </span>
                </div>

                <div className="recommendation-item">

                  <div className="recommendation-avatar">
                    AM
                  </div>

                  <div className="recommendation-info">
                    <strong>Potential Mentor</strong>
                    <span>Technology & SaaS</span>
                  </div>

                  <div className="match-score">
                    94%
                  </div>

                </div>


                <div className="recommendation-item">

                  <div className="recommendation-avatar">
                    IN
                  </div>

                  <div className="recommendation-info">
                    <strong>Investment Opportunity</strong>
                    <span>Early Stage Startup</span>
                  </div>

                  <div className="match-score">
                    89%
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default LandingIntro;