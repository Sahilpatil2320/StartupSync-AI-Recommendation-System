import { ArrowRight, Rocket, Users, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import "./GetStartedSection.css";

function GetStartedSection() {
  return (
    <section className="get-started-section">
      <div className="container">
        <div className="get-started-content">

          <div className="get-started-icon">
            <Rocket size={32} />
          </div>

          <span className="get-started-badge">
            Start Your Journey
          </span>

          <h2>
            Ready to Build What's Next?
          </h2>

          <p>
            Join an ecosystem designed to connect ideas, people,
            opportunities and resources — all in one platform.
          </p>

          <div className="get-started-actions">
            <Link to="/signup" className="btn btn-primary">
              Create Your Account
              <ArrowRight size={18} />
            </Link>

            <Link to="/ecosystem" className="btn btn-secondary">
              Explore Ecosystem
            </Link>
          </div>

          <div className="ecosystem-highlights">

            <div className="ecosystem-highlight">
              <div className="highlight-icon">
                <Lightbulb size={20} />
              </div>
              <span>Entrepreneurs</span>
            </div>

            <div className="ecosystem-highlight">
              <div className="highlight-icon">
                <Users size={20} />
              </div>
              <span>Investors & Mentors</span>
            </div>

            <div className="ecosystem-highlight">
              <div className="highlight-icon">
                <Rocket size={20} />
              </div>
              <span>Students & Incubators</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default GetStartedSection;