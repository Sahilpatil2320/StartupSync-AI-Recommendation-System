import {
  UserPlus,
  SlidersHorizontal,
  Brain,
  Sparkles,
  Search,
  Handshake
} from "lucide-react";

import "./PlatformWorkflow.css";

function PlatformWorkflow() {
  const workflowSteps = [
    {
      number: "01",
      icon: <UserPlus size={23} />,
      title: "Create Your Profile",
      description:
        "Register on StartupSync and create a profile based on your role, skills, interests and requirements."
    },

    {
      number: "02",
      icon: <SlidersHorizontal size={23} />,
      title: "Set Your Preferences",
      description:
        "Define your interests, startup domain, funding needs, skills and other relevant preferences."
    },

    {
      number: "03",
      icon: <Brain size={23} />,
      title: "AI Analyzes Your Data",
      description:
        "The recommendation engine analyzes your profile information and identifies relevant patterns."
    },

    {
      number: "04",
      icon: <Sparkles size={23} />,
      title: "Smart Matching",
      description:
        "AI-based matching identifies suitable startups, investors, mentors, internships and opportunities."
    },

    {
      number: "05",
      icon: <Search size={23} />,
      title: "Discover Opportunities",
      description:
        "Explore personalized recommendations and discover opportunities relevant to your goals."
    },

    {
      number: "06",
      icon: <Handshake size={23} />,
      title: "Connect & Collaborate",
      description:
        "Connect with relevant people and organizations to build meaningful startup relationships."
    }
  ];

  return (
    <section className="platform-workflow" id="how-it-works">

      <div className="container">

        <div className="workflow-heading">

          <div className="section-label">
            <Sparkles size={15} />
            HOW STARTUPSYNC WORKS
          </div>

          <h2>
            From Profile to
            <span> Opportunity</span>
          </h2>

          <p>
            A simple workflow designed to help every member
            of the startup ecosystem discover relevant
            connections and opportunities.
          </p>

        </div>

        <div className="workflow-container">

          {workflowSteps.map((step, index) => (

            <div
              className="workflow-step"
              key={step.number}
            >

              <div className="workflow-number">
                {step.number}
              </div>

              <div className="workflow-icon">
                {step.icon}
              </div>

              <div className="workflow-content">

                <h3>
                  {step.title}
                </h3>

                <p>
                  {step.description}
                </p>

              </div>

              {index !== workflowSteps.length - 1 && (
                <div className="workflow-connector"></div>
              )}

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default PlatformWorkflow;