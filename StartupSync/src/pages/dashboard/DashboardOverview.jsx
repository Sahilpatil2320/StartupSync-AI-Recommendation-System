import {
  Bell,
  BriefcaseBusiness,
  Building2,
  FileText,
  GraduationCap,
  Handshake,
  Lightbulb,
  MessageSquare,
  Rocket,
  ShieldCheck,
  TrendingUp,
  UsersRound
} from "lucide-react";

import "./DashboardOverview.css";

const roleContent = {
  founder: {
    title: "Welcome back, Founder",
    description:
      "Track your startup, connect with investors and mentors, and grow your ecosystem.",
    stats: [
      {
        label: "Startup Profile",
        value: "82%",
        icon: Rocket
      },
      {
        label: "Investor Connections",
        value: "12",
        icon: TrendingUp
      },
      {
        label: "Mentor Connections",
        value: "6",
        icon: Handshake
      },
      {
        label: "Team Members",
        value: "8",
        icon: UsersRound
      }
    ],
    actions: [
      {
        title: "Complete Startup",
        description: "Improve your startup profile",
        icon: Rocket
      },
      {
        title: "Find Investors",
        description: "Discover relevant investors",
        icon: TrendingUp
      },
      {
        title: "Find Mentors",
        description: "Connect with suitable mentors",
        icon: Handshake
      }
    ]
  },

  investor: {
    title: "Welcome back, Investor",
    description:
      "Discover startups, manage your investment interests, and build meaningful connections.",
    stats: [
      {
        label: "Saved Startups",
        value: "18",
        icon: Rocket
      },
      {
        label: "Active Interests",
        value: "7",
        icon: TrendingUp
      },
      {
        label: "Connections",
        value: "24",
        icon: UsersRound
      },
      {
        label: "Messages",
        value: "5",
        icon: MessageSquare
      }
    ],
    actions: [
      {
        title: "Discover Startups",
        description: "Explore promising startups",
        icon: Rocket
      },
      {
        title: "Investment Interests",
        description: "Review your investment activity",
        icon: TrendingUp
      },
      {
        title: "Network",
        description: "Connect with founders",
        icon: UsersRound
      }
    ]
  },

  mentor: {
    title: "Welcome back, Mentor",
    description:
      "Share your expertise, support founders, and manage your mentoring activities.",
    stats: [
      {
        label: "Mentorships",
        value: "9",
        icon: Handshake
      },
      {
        label: "Startups Helped",
        value: "14",
        icon: Rocket
      },
      {
        label: "Pending Requests",
        value: "4",
        icon: FileText
      },
      {
        label: "Messages",
        value: "8",
        icon: MessageSquare
      }
    ],
    actions: [
      {
        title: "Mentorship Requests",
        description: "Review startup requests",
        icon: FileText
      },
      {
        title: "My Mentorships",
        description: "Manage active mentorships",
        icon: Handshake
      },
      {
        title: "Discover Startups",
        description: "Find startups to support",
        icon: Rocket
      }
    ]
  },

  student: {
    title: "Welcome back, Student",
    description:
      "Discover internships, opportunities, mentors, and startup experiences.",
    stats: [
      {
        label: "Recommended Jobs",
        value: "16",
        icon: BriefcaseBusiness
      },
      {
        label: "Applications",
        value: "6",
        icon: FileText
      },
      {
        label: "Saved Opportunities",
        value: "11",
        icon: TrendingUp
      },
      {
        label: "Connections",
        value: "9",
        icon: UsersRound
      }
    ],
    actions: [
      {
        title: "Find Internships",
        description: "Explore relevant internships",
        icon: BriefcaseBusiness
      },
      {
        title: "Opportunities",
        description: "Discover startup opportunities",
        icon: TrendingUp
      },
      {
        title: "Build Connections",
        description: "Connect with founders and mentors",
        icon: UsersRound
      }
    ]
  },

  incubator: {
    title: "Welcome back, Incubator",
    description:
      "Manage your startup programs and connect founders with the right ecosystem resources.",
    stats: [
      {
        label: "Supported Startups",
        value: "32",
        icon: Rocket
      },
      {
        label: "Active Programs",
        value: "6",
        icon: Building2
      },
      {
        label: "Mentor Network",
        value: "28",
        icon: Handshake
      },
      {
        label: "New Applications",
        value: "13",
        icon: FileText
      }
    ],
    actions: [
      {
        title: "Manage Startups",
        description: "Review supported startups",
        icon: Rocket
      },
      {
        title: "Manage Programs",
        description: "Organize incubation programs",
        icon: Building2
      },
      {
        title: "Mentor Network",
        description: "Connect mentors with founders",
        icon: Handshake
      }
    ]
  },

  admin: {
    title: "Welcome back, Administrator",
    description:
      "Monitor platform activity and manage StartupSync ecosystem operations.",
    stats: [
      {
        label: "Registered Users",
        value: "1,248",
        icon: UsersRound
      },
      {
        label: "Startups",
        value: "186",
        icon: Rocket
      },
      {
        label: "Pending Reports",
        value: "12",
        icon: FileText
      },
      {
        label: "Platform Messages",
        value: "38",
        icon: MessageSquare
      }
    ],
    actions: [
      {
        title: "Manage Users",
        description: "Review platform users",
        icon: UsersRound
      },
      {
        title: "Manage Startups",
        description: "Monitor startup activity",
        icon: Rocket
      },
      {
        title: "Review Reports",
        description: "Check pending reports",
        icon: FileText
      }
    ]
  }
};

function DashboardOverview({ role }) {
  const content = roleContent[role] || roleContent.founder;

  return (
    <div className="dashboard-overview">
      {/* Welcome */}
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <span className="dashboard-welcome-badge">
            StartupSync Workspace
          </span>

          <h2>{content.title}</h2>

          <p>{content.description}</p>
        </div>

        <div className="dashboard-welcome-icon">
          {role === "founder" && <Rocket size={32} />}
          {role === "investor" && <TrendingUp size={32} />}
          {role === "mentor" && <Lightbulb size={32} />}
          {role === "student" && <GraduationCap size={32} />}
          {role === "incubator" && <Building2 size={32} />}
          {role === "admin" && <ShieldCheck size={32} />}
        </div>
      </section>

      {/* Statistics */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h3>Overview</h3>
            <p>Your current StartupSync activity</p>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          {content.stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="dashboard-stat-card" key={stat.label}>
                <div className="dashboard-stat-icon">
                  <Icon size={21} />
                </div>

                <div className="dashboard-stat-content">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h3>Quick Actions</h3>
            <p>Continue with your most important tasks</p>
          </div>
        </div>

        <div className="dashboard-actions-grid">
          {content.actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                type="button"
                className="dashboard-action-card"
                key={action.title}
              >
                <div className="dashboard-action-icon">
                  <Icon size={22} />
                </div>

                <div className="dashboard-action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>

                <span className="dashboard-action-arrow">
                  →
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Activity + Recommendations */}
      <section className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest updates from your workspace</p>
            </div>

            <Bell size={19} />
          </div>

          <div className="dashboard-activity-list">
            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon">
                <MessageSquare size={18} />
              </div>

              <div>
                <strong>New message received</strong>
                <span>Someone interacted with your profile</span>
              </div>

              <small>2h</small>
            </div>

            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon">
                <UsersRound size={18} />
              </div>

              <div>
                <strong>New connection</strong>
                <span>A new ecosystem connection was created</span>
              </div>

              <small>5h</small>
            </div>

            <div className="dashboard-activity-item">
              <div className="dashboard-activity-icon">
                <FileText size={18} />
              </div>

              <div>
                <strong>Profile activity</strong>
                <span>Your profile received an update</span>
              </div>

              <small>1d</small>
            </div>
          </div>
        </div>

        <div className="dashboard-panel dashboard-recommendation-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recommended For You</h3>
              <p>Personalized ecosystem suggestions</p>
            </div>

            <Lightbulb size={19} />
          </div>

          <div className="dashboard-recommendation">
            <div className="dashboard-recommendation-icon">
              <Rocket size={21} />
            </div>

            <div>
              <strong>Complete your profile</strong>
              <p>
                A complete profile helps StartupSync provide
                more relevant recommendations.
              </p>
            </div>
          </div>

          <div className="dashboard-recommendation">
            <div className="dashboard-recommendation-icon">
              <UsersRound size={21} />
            </div>

            <div>
              <strong>Expand your network</strong>
              <p>
                Explore people and organizations relevant to
                your StartupSync goals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardOverview;