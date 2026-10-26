
import {
  Rocket,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  Sparkles
} from "lucide-react";

import "./StartupEcosystem.css";

function StartupEcosystem() {
  const ecosystemRoles = [
    {
      icon: <Rocket size={25} />,
      title: "Entrepreneurs",
      description:
        "Build startup profiles, discover resources, connect with investors and mentors, and explore funding opportunities.",
      style: "blue"
    },
    {
      icon: <TrendingUp size={25} />,
      title: "Investors",
      description:
        "Discover promising startups based on investment interests, sectors, funding stages and requirements.",
      style: "green"
    },
    {
      icon: <Lightbulb size={25} />,
      title: "Mentors",
      description:
        "Share expertise with startups and discover mentorship opportunities matching your professional experience.",
      style: "purple"
    },
    {
      icon: <GraduationCap size={25} />,
      title: "Students",
      description:
        "Find internships, recruitment opportunities and startup ecosystem connections based on your skills.",
      style: "orange"
    }
  ];

  return (
    <section className="startup-ecosystem" id="ecosystem">
      <div className="container">
        <div className="ecosystem-heading">
          <div className="section-label">
            <Sparkles size={15} />
            THE STARTUP ECOSYSTEM
          </div>

          <h2>
            One Platform.
            <span> Multiple Possibilities.</span>
          </h2>

          <p>
            StartupSync connects entrepreneurs, investors,
            mentors and students to enable meaningful
            collaboration across the startup ecosystem.
          </p>
        </div>

        {/* Four roles positioned around the StartupSync center */}
        <div className="ecosystem-visual">
          <div className="ecosystem-center">
            <div className="ecosystem-logo">
              <Sparkles size={27} />
            </div>
            <strong>StartupSync</strong>
            <span>AI-Powered Ecosystem</span>
          </div>

          <div className="ecosystem-card entrepreneur">
            <div className="ecosystem-icon blue">
              <Rocket size={21} />
            </div>
            <strong>Entrepreneurs</strong>
          </div>

          <div className="ecosystem-card investor">
            <div className="ecosystem-icon green">
              <TrendingUp size={21} />
            </div>
            <strong>Investors</strong>
          </div>

          <div className="ecosystem-card mentor">
            <div className="ecosystem-icon purple">
              <Lightbulb size={21} />
            </div>
            <strong>Mentors</strong>
          </div>

          <div className="ecosystem-card student">
            <div className="ecosystem-icon orange">
              <GraduationCap size={21} />
            </div>
            <strong>Students</strong>
          </div>
        </div>

        {/* Exactly four aligned participant cards */}
        <div className="ecosystem-role-grid">
          {ecosystemRoles.map((role) => (
            <article
              className="ecosystem-role-card"
              key={role.title}
            >
              <div className={`ecosystem-role-icon ${role.style}`}>
                {role.icon}
              </div>

              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StartupEcosystem;