import {
  Rocket,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  Building2,
  Users,
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
    },

    {
      icon: <Building2 size={25} />,
      title: "Incubators",
      description:
        "Support startups through incubation programs, resources, events and ecosystem connections.",
      style: "cyan"
    }
  ];

  return (
    <section
      className="startup-ecosystem"
      id="ecosystem"
    >

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
            StartupSync connects the key participants of
            the startup ecosystem and enables meaningful
            collaboration between them.
          </p>

        </div>

        <div className="ecosystem-visual">

          <div className="ecosystem-center">

            <div className="ecosystem-logo">
              <Sparkles size={25} />
            </div>

            <strong>StartupSync</strong>

            <span>
              AI-Powered Ecosystem
            </span>

          </div>

          <div className="ecosystem-card entrepreneur">
            <div className="ecosystem-icon blue">
              <Rocket size={20} />
            </div>

            <strong>Entrepreneurs</strong>
          </div>


          <div className="ecosystem-card investor">
            <div className="ecosystem-icon green">
              <TrendingUp size={20} />
            </div>

            <strong>Investors</strong>
          </div>


          <div className="ecosystem-card mentor">
            <div className="ecosystem-icon purple">
              <Lightbulb size={20} />
            </div>

            <strong>Mentors</strong>
          </div>


          <div className="ecosystem-card student">
            <div className="ecosystem-icon orange">
              <GraduationCap size={20} />
            </div>

            <strong>Students</strong>
          </div>


          <div className="ecosystem-card incubator">
            <div className="ecosystem-icon cyan">
              <Building2 size={20} />
            </div>

            <strong>Incubators</strong>
          </div>

        </div>

        <div className="ecosystem-role-grid">

          {ecosystemRoles.map((role, index) => (

            <div
              className="ecosystem-role-card"
              key={index}
            >

              <div className={`ecosystem-role-icon ${role.style}`}>
                {role.icon}
              </div>

              <h3>
                {role.title}
              </h3>

              <p>
                {role.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default StartupEcosystem;