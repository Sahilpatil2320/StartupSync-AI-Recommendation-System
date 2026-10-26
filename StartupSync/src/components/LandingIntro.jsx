import { ArrowRight, Sparkles, Users, TrendingUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import "./LandingIntro.css";

function LandingIntro() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="landing-intro" id="home">
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />

      <div className="container landing-intro-container">
        <div className="landing-content hero-enter">
          <div className="ai-badge">
            <span className="badge-icon"><Sparkles size={16} /></span>
            AI-Powered Startup Ecosystem
          </div>

          <h1>
            Build. Connect.
            <span>Grow Together.</span>
          </h1>

          <p className="landing-description">
            StartupSync brings entrepreneurs, investors, mentors, students and
            incubators together in one intelligent, connected startup ecosystem.
          </p>

          <div className="landing-actions">
            <Link to="/signup" className="btn btn-primary landing-primary-btn">
              Get Started <ArrowRight size={18} />
            </Link>
            <button type="button" className="btn btn-secondary" onClick={scrollToFeatures}>
              Explore Ecosystem
            </button>
          </div>

          <div className="landing-stats">
            <div className="stat-item">
              <span className="stat-icon"><Users size={19} /></span>
              <div><strong>6+</strong><span>User Roles</span></div>
            </div>
            <div className="stat-item">
              <span className="stat-icon"><TrendingUp size={19} /></span>
              <div><strong>AI</strong><span>Smart Matching</span></div>
            </div>
            <div className="stat-item">
              <span className="stat-icon"><Sparkles size={19} /></span>
              <div><strong>1</strong><span>Unified Platform</span></div>
            </div>
          </div>
        </div>

        <div className="platform-preview hero-enter hero-enter-delay">
          <div className="preview-glow" aria-hidden="true" />
          <div className="preview-window">
            <div className="preview-header">
              <div className="window-dots"><span /><span /><span /></div>
              <div className="preview-title">StartupSync Dashboard</div>
              <span className="preview-live"><span /> Live preview</span>
            </div>

            <div className="preview-body">
              <div className="preview-welcome">
                <div><small>Welcome back</small><h3>Startup Dashboard</h3></div>
                <div className="profile-circle">PS</div>
              </div>

              <div className="preview-cards">
                <div className="preview-card">
                  <div className="preview-card-icon blue"><TrendingUp size={18} /></div>
                  <div><span>Funding Opportunities</span><strong>24</strong></div>
                </div>
                <div className="preview-card">
                  <div className="preview-card-icon purple"><Users size={18} /></div>
                  <div><span>Potential Connections</span><strong>18</strong></div>
                </div>
              </div>

              <div className="recommendation-preview">
                <div className="recommendation-heading"><Sparkles size={17} /><span>AI Recommendations</span><span className="recommendation-live">Personalized</span></div>
                <div className="recommendation-item">
                  <div className="recommendation-avatar">AM</div>
                  <div className="recommendation-info"><strong>Potential Mentor</strong><span>Technology &amp; SaaS</span></div>
                  <div className="match-score">94% match</div>
                </div>
                <div className="recommendation-item">
                  <div className="recommendation-avatar investor-avatar">IN</div>
                  <div className="recommendation-info"><strong>Investment Opportunity</strong><span>Early Stage Startup</span></div>
                  <div className="match-score">89% match</div>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-insight insight-top"><span className="insight-check">✓</span><div><strong>Smart match found</strong><small>Based on your interests</small></div></div>
          <div className="floating-insight insight-bottom"><span className="insight-spark"><Sparkles size={17} /></span><div><strong>AI-powered insights</strong><small>Better connections, faster</small></div></div>
        </div>
      </div>

      <button className="scroll-cue" type="button" onClick={scrollToFeatures} aria-label="Scroll to platform features">
        <span>Discover the platform</span><ChevronDown size={18} />
      </button>
    </section>
  );
}

export default LandingIntro;