import {
  Sparkles,
  Brain,
  CheckCircle2,
  Target,
  Zap,
  ArrowUpRight
} from "lucide-react";

import "./AIRecommendationShowcase.css";

function AIRecommendationShowcase() {
  return (
    <section
      className="ai-recommendation-showcase"
      id="ai-recommendations"
    >

      <div className="container ai-showcase-container">

        <div className="ai-showcase-content">

          <div className="section-label">
            <Sparkles size={15} />
            INTELLIGENT RECOMMENDATIONS
          </div>

          <h2>
            Smarter Matches.
            <span> Better Opportunities.</span>
          </h2>

          <p>
            StartupSync uses intelligent recommendation techniques
            to help users discover opportunities and connections
            that are relevant to their skills, interests and goals.
          </p>

          <div className="ai-benefits">

            <div className="ai-benefit">

              <div className="ai-benefit-icon">
                <Target size={18} />
              </div>

              <div>
                <strong>Personalized Matching</strong>

                <span>
                  Recommendations based on user preferences
                  and relevant profile information.
                </span>
              </div>

            </div>


            <div className="ai-benefit">

              <div className="ai-benefit-icon">
                <Brain size={18} />
              </div>

              <div>
                <strong>Intelligent Analysis</strong>

                <span>
                  Profile data is analyzed to identify relevant
                  opportunities and connections.
                </span>
              </div>

            </div>


            <div className="ai-benefit">

              <div className="ai-benefit-icon">
                <Zap size={18} />
              </div>

              <div>
                <strong>Relevant Results</strong>

                <span>
                  Users can discover suitable mentors,
                  investors and opportunities faster.
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="ai-interface">

          <div className="ai-interface-header">

            <div className="ai-header-title">

              <div className="ai-header-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <strong>AI Recommendations</strong>

                <span>
                  Personalized for your profile
                </span>
              </div>

            </div>

            <div className="ai-status">
              <span></span>
              Active
            </div>

          </div>

          <div className="match-card">

            <div className="match-card-header">

              <div className="person-details">

                <div className="person-avatar">
                  AM
                </div>

                <div>
                  <strong>Ankit Mehta</strong>

                  <span>
                    Technology Mentor
                  </span>
                </div>

              </div>

              <div className="match-percentage">
                94%
                <small>Match</small>
              </div>

            </div>

            <div className="match-progress">

              <div className="progress-label">
                <span>Overall Compatibility</span>
                <strong>94%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{ width: "94%" }}
                ></div>
              </div>

            </div>

            <div className="match-factors">

              <div className="factor">

                <div className="factor-top">
                  <span>Skills</span>
                  <strong>95%</strong>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-value"
                    style={{ width: "95%" }}
                  ></div>
                </div>

              </div>


              <div className="factor">

                <div className="factor-top">
                  <span>Domain</span>
                  <strong>92%</strong>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-value"
                    style={{ width: "92%" }}
                  ></div>
                </div>

              </div>


              <div className="factor">

                <div className="factor-top">
                  <span>Preferences</span>
                  <strong>88%</strong>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-value"
                    style={{ width: "88%" }}
                  ></div>
                </div>

              </div>

            </div>

            <div className="match-tags">

              <span>SaaS</span>
              <span>Product</span>
              <span>Growth</span>
              <span>Technology</span>

            </div>

          </div>

          <div className="why-match">

            <div className="why-match-title">
              <Sparkles size={16} />
              Why this match?
            </div>

            <div className="why-match-list">

              <div>
                <CheckCircle2 size={16} />
                <span>
                  Strong skills alignment
                </span>
              </div>

              <div>
                <CheckCircle2 size={16} />
                <span>
                  Relevant technology domain
                </span>
              </div>

              <div>
                <CheckCircle2 size={16} />
                <span>
                  Compatible interests
                </span>
              </div>

            </div>

          </div>

          <button className="view-recommendation">

            View Recommendation

            <ArrowUpRight size={16} />

          </button>

        </div>

      </div>

    </section>
  );
}

export default AIRecommendationShowcase;