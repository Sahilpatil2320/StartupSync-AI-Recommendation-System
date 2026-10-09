import {
  Sparkles,
  Building2,
  Handshake,
  BriefcaseBusiness,
  Banknote,
  Network
} from "lucide-react";

import "./PlatformFeatures.css";

function PlatformFeatures() {
  const features = [
    {
      icon: <Sparkles size={24} />,
      title: "AI Recommendations",
      description:
        "Discover personalized startups, mentors, investors, internships and opportunities based on your profile and interests.",
      tag: "AI Powered",
      style: "blue"
    },

    {
      icon: <Building2 size={24} />,
      title: "Startup Management",
      description:
        "Create and manage your startup profile, domain, business stage, funding requirements, team and technology information.",
      tag: "For Startups",
      style: "purple"
    },

    {
      icon: <Handshake size={24} />,
      title: "Investor & Mentor Matching",
      description:
        "Find relevant investors and mentors based on startup domain, interests, requirements and professional expertise.",
      tag: "Smart Matching",
      style: "green"
    },

    {
      icon: <BriefcaseBusiness size={24} />,
      title: "Internships & Recruitment",
      description:
        "Students can discover internships and recruitment opportunities while organizations can publish relevant openings.",
      tag: "For Students",
      style: "orange"
    },

    {
      icon: <Banknote size={24} />,
      title: "Funding & Schemes",
      description:
        "Explore funding opportunities, government schemes and startup support resources from a centralized platform.",
      tag: "Resources",
      style: "cyan"
    },

    {
      icon: <Network size={24} />,
      title: "Ecosystem Collaboration",
      description:
        "Connect entrepreneurs, investors, mentors, students, incubators and service providers within one integrated ecosystem.",
      tag: "Connected",
      style: "indigo"
    }
  ];

  return (
    <section className="platform-features" id="features">

      <div className="container">

        <div className="features-heading">

          <div className="section-label">
            <Sparkles size={15} />
            PLATFORM CAPABILITIES
          </div>

          <h2>
            Everything You Need to
            <span> Grow Your Startup</span>
          </h2>

          <p>
            StartupSync brings essential startup resources,
            connections and intelligent recommendations together
            in one integrated platform.
          </p>

        </div>

        <div className="features-grid">

          {features.map((feature, index) => (

            <div
              className="feature-card"
              key={index}
            >

              <div className={`feature-icon ${feature.style}`}>
                {feature.icon}
              </div>

              <div className="feature-tag">
                {feature.tag}
              </div>

              <h3>
                {feature.title}
              </h3>

              <p>
                {feature.description}
              </p>

              <div className="feature-number">
                0{index + 1}
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default PlatformFeatures;