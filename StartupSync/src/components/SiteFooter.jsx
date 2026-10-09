import { Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import "./SiteFooter.css";


function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">

        <div className="footer-content">

          <div className="footer-brand">
            <BrandLogo variant="dark" />

            <p>
              An AI-driven integrated startup ecosystem connecting
              entrepreneurs, investors, mentors, students and incubators.
            </p>
          </div>

          <div className="footer-column">

            <h3>Platform</h3>

            <Link to="/">Home</Link>
            <a href="#features">Features</a>
            <a href="#workflow">How It Works</a>
            <a href="#ecosystem">Ecosystem</a>

          </div>

          <div className="footer-column">

            <h3>Ecosystem</h3>

            <a href="#">Entrepreneurs</a>
            <a href="#">Investors</a>
            <a href="#">Mentors</a>
            <a href="#">Students</a>
            <a href="#">Incubators</a>

          </div>

          <div className="footer-column">

            <h3>Resources</h3>

            <a href="#">Internships</a>
            <a href="#">Funding & Schemes</a>
            <a href="#">Opportunities</a>
            <a href="#">Support</a>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © 2026 StartupSync. All rights reserved.
          </p>

          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default SiteFooter;