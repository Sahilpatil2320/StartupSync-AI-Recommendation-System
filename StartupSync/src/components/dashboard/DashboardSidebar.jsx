import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleUserRound,
  FileText,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MessageSquare,
  Rocket,
  Settings,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  X
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import BrandLogo from "../BrandLogo";

import "./DashboardSidebar.css";

const roleNavigation = {
  founder: [
    {
      label: "Dashboard",
      path: "/dashboard/founder",
      icon: LayoutDashboard
    },
    {
      label: "My Startup",
      path: "/dashboard/founder/startup",
      icon: Rocket
    },
    {
      label: "Investors",
      path: "/dashboard/founder/investors",
      icon: TrendingUp
    },
    {
      label: "Mentors",
      path: "/dashboard/founder/mentors",
      icon: Lightbulb
    },
    {
      label: "Team",
      path: "/dashboard/founder/team",
      icon: UsersRound
    },
    {
      label: "Messages",
      path: "/dashboard/founder/messages",
      icon: MessageSquare
    },
    {
      label: "Notifications",
      path: "/dashboard/founder/notifications",
      icon: Bell
    }
  ],

  investor: [
    {
      label: "Dashboard",
      path: "/dashboard/investor",
      icon: LayoutDashboard
    },
    {
      label: "Discover Startups",
      path: "/dashboard/investor/startups",
      icon: Rocket
    },
    {
      label: "My Investments",
      path: "/dashboard/investor/investments",
      icon: TrendingUp
    },
    {
      label: "Messages",
      path: "/dashboard/investor/messages",
      icon: MessageSquare
    },
    {
      label: "Notifications",
      path: "/dashboard/investor/notifications",
      icon: Bell
    }
  ],

  mentor: [
    {
      label: "Dashboard",
      path: "/dashboard/mentor",
      icon: LayoutDashboard
    },
    {
      label: "Startups",
      path: "/dashboard/mentor/startups",
      icon: Rocket
    },
    {
      label: "Mentorships",
      path: "/dashboard/mentor/mentorships",
      icon: Handshake
    },
    {
      label: "Messages",
      path: "/dashboard/mentor/messages",
      icon: MessageSquare
    },
    {
      label: "Notifications",
      path: "/dashboard/mentor/notifications",
      icon: Bell
    }
  ],

  student: [
    {
      label: "Dashboard",
      path: "/dashboard/student",
      icon: LayoutDashboard
    },
    {
      label: "Internships",
      path: "/dashboard/student/internships",
      icon: BriefcaseBusiness
    },
    {
      label: "Opportunities",
      path: "/dashboard/student/opportunities",
      icon: GraduationCap
    },
    {
      label: "Applications",
      path: "/dashboard/student/applications",
      icon: FileText
    },
    {
      label: "Messages",
      path: "/dashboard/student/messages",
      icon: MessageSquare
    },
    {
      label: "Notifications",
      path: "/dashboard/student/notifications",
      icon: Bell
    }
  ],

  incubator: [
    {
      label: "Dashboard",
      path: "/dashboard/incubator",
      icon: LayoutDashboard
    },
    {
      label: "Startups",
      path: "/dashboard/incubator/startups",
      icon: Rocket
    },
    {
      label: "Programs",
      path: "/dashboard/incubator/programs",
      icon: Building2
    },
    {
      label: "Mentors",
      path: "/dashboard/incubator/mentors",
      icon: UsersRound
    },
    {
      label: "Messages",
      path: "/dashboard/incubator/messages",
      icon: MessageSquare
    },
    {
      label: "Notifications",
      path: "/dashboard/incubator/notifications",
      icon: Bell
    }
  ],

  admin: [
    {
      label: "Dashboard",
      path: "/dashboard/admin",
      icon: LayoutDashboard
    },
    {
      label: "Users",
      path: "/dashboard/admin/users",
      icon: UsersRound
    },
    {
      label: "Startups",
      path: "/dashboard/admin/startups",
      icon: Rocket
    },
    {
      label: "Reports",
      path: "/dashboard/admin/reports",
      icon: ChartNoAxesCombined
    },
    {
      label: "Notifications",
      path: "/dashboard/admin/notifications",
      icon: Bell
    },
    {
      label: "Settings",
      path: "/dashboard/admin/settings",
      icon: Settings
    }
  ]
};

const roleNames = {
  founder: "Startup Founder",
  investor: "Investor",
  mentor: "Mentor",
  student: "Student",
  incubator: "Incubator",
  admin: "Administrator"
};

function DashboardSidebar({
  role,
  isOpen,
  onClose
}) {
  const navigate = useNavigate();

  const navigation =
    roleNavigation[role] || [];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      <aside
        className={`dashboard-sidebar ${
          isOpen ? "dashboard-sidebar-open" : ""
        }`}
      >
        <div className="dashboard-sidebar-header">
          <BrandLogo variant="dark" />

          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="dashboard-role">
          <div className="dashboard-role-icon">
            {role === "admin" ? (
              <ShieldCheck size={19} />
            ) : (
              <CircleUserRound size={19} />
            )}
          </div>

          <div>
            <strong>
              {roleNames[role]}
            </strong>

            <span>
              StartupSync Account
            </span>
          </div>
        </div>

        <nav className="dashboard-navigation">
          <span className="dashboard-navigation-label">
            Workspace
          </span>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/dashboard/${role}`}
                className={({ isActive }) =>
                  `dashboard-nav-item ${
                    isActive
                      ? "dashboard-nav-item-active"
                      : ""
                  }`
                }
                onClick={onClose}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() =>
              navigate(`/dashboard/${role}/profile`)
            }
          >
            <CircleUserRound size={19} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() =>
              navigate(`/dashboard/${role}/settings`)
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
    </>
  );
}

export default DashboardSidebar;