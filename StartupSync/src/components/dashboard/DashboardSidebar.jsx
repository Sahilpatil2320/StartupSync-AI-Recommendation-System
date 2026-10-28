
import {
  Bell,
  BriefcaseBusiness,
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
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import BrandLogo from "../BrandLogo";
import "./DashboardSidebar.css";

const roleNavigation = {
  founder: [
    { label: "Dashboard", path: "/dashboard/founder", icon: LayoutDashboard },
    { label: "My Startup", path: "/dashboard/founder/startup", icon: Rocket },
    { label: "Investors", path: "/dashboard/founder/investors", icon: TrendingUp },
    { label: "Mentors", path: "/dashboard/founder/mentors", icon: Lightbulb },
    { label: "Students", path: "/dashboard/founder/students", icon: GraduationCap },
    { label: "Team", path: "/dashboard/founder/team", icon: UsersRound },
    { label: "Messages", path: "/dashboard/founder/messages", icon: MessageSquare },
    { label: "Notifications", path: "/dashboard/founder/notifications", icon: Bell },
    { label: "Ecosystem Network", path: "/dashboard/founder/ecosystem", icon: Share2 },
  ],
  investor: [
    { label: "Dashboard", path: "/dashboard/investor", icon: LayoutDashboard },
    { label: "Discover Startups", path: "/dashboard/investor/startups", icon: Rocket },
    { label: "Discover Mentors", path: "/dashboard/investor/mentors", icon: Lightbulb },
    { label: "My Investments", path: "/dashboard/investor/investments", icon: TrendingUp },
    { label: "Messages", path: "/dashboard/investor/messages", icon: MessageSquare },
    { label: "Notifications", path: "/dashboard/investor/notifications", icon: Bell },
    { label: "Ecosystem Network", path: "/dashboard/investor/ecosystem", icon: Share2 },
  ],
  mentor: [
    { label: "Dashboard", path: "/dashboard/mentor", icon: LayoutDashboard },
    { label: "Startups", path: "/dashboard/mentor/startups", icon: Rocket },
    { label: "Investors", path: "/dashboard/mentor/investors", icon: TrendingUp },
    { label: "Students", path: "/dashboard/mentor/students", icon: GraduationCap },
    { label: "Mentorships", path: "/dashboard/mentor/mentorships", icon: Handshake },
    { label: "Messages", path: "/dashboard/mentor/messages", icon: MessageSquare },
    { label: "Notifications", path: "/dashboard/mentor/notifications", icon: Bell },
    { label: "Ecosystem Network", path: "/dashboard/mentor/ecosystem", icon: Share2 },
  ],
  student: [
    { label: "Dashboard", path: "/dashboard/student", icon: LayoutDashboard },
    { label: "Internships", path: "/dashboard/student/internships", icon: BriefcaseBusiness },
    { label: "Opportunities", path: "/dashboard/student/opportunities", icon: GraduationCap },
    { label: "Discover Founders", path: "/dashboard/student/founders", icon: Rocket },
    { label: "Find Mentors", path: "/dashboard/student/mentors", icon: Lightbulb },
    { label: "Applications", path: "/dashboard/student/applications", icon: FileText },
    { label: "Messages", path: "/dashboard/student/messages", icon: MessageSquare },
    { label: "Notifications", path: "/dashboard/student/notifications", icon: Bell },
    { label: "Ecosystem Network", path: "/dashboard/student/ecosystem", icon: Share2 },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", path: "/dashboard/admin/users", icon: UsersRound },
    { label: "Startups", path: "/dashboard/admin/startups", icon: Rocket },
    { label: "Reports", path: "/dashboard/admin/reports", icon: ChartNoAxesCombined },
    { label: "Notifications", path: "/dashboard/admin/notifications", icon: Bell },
    { label: "Ecosystem Network", path: "/dashboard/admin/ecosystem", icon: Share2 },
    { label: "Settings", path: "/dashboard/admin/settings", icon: Settings },
  ],
};

const roleNames = {
  founder: "Startup Founder",
  investor: "Investor",
  mentor: "Mentor",
  student: "Student",
  admin: "Administrator",
};

function DashboardSidebar({
  role,
  isOpen,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}) {
  const navigate = useNavigate();
  const normalizedRole = String(role || "").toLowerCase();
  const navigation = roleNavigation[normalizedRole] || [];

  const goToDashboard = () => {
    navigate(`/dashboard/${normalizedRole}`);
    onClose?.();
  };

  const handleLogout = () => {
    localStorage.removeItem("startupsync_token");
    localStorage.removeItem("startupsync_user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside
        className={[
          "dashboard-sidebar",
          isOpen ? "dashboard-sidebar-open" : "",
          isCollapsed ? "dashboard-sidebar-collapsed" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="dashboard-sidebar-header">
          <button
            type="button"
            className="dashboard-brand-button"
            onClick={goToDashboard}
            title="Go to dashboard"
            aria-label="Go to dashboard"
          >
            <BrandLogo variant="dark" />
          </button>

          <button
            type="button"
            className="dashboard-sidebar-collapse"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed
              ? <PanelLeftOpen size={19} />
              : <PanelLeftClose size={19} />}
          </button>

          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="dashboard-role" title={roleNames[normalizedRole]}>
          <div className="dashboard-role-icon">
            {normalizedRole === "admin"
              ? <ShieldCheck size={19} />
              : <CircleUserRound size={19} />}
          </div>
          <div className="dashboard-role-text">
            <strong>{roleNames[normalizedRole] || "User"}</strong>
            <span>StartupSync Account</span>
          </div>
        </div>

        <nav className="dashboard-navigation" aria-label="Workspace navigation">
          <span className="dashboard-navigation-label">Workspace</span>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/dashboard/${normalizedRole}`}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                className={({ isActive }) =>
                  `dashboard-nav-item ${
                    isActive ? "dashboard-nav-item-active" : ""
                  }`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span className="dashboard-nav-text">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className="dashboard-nav-item"
            title={isCollapsed ? "Profile" : undefined}
            onClick={() => navigate(`/dashboard/${normalizedRole}/profile`)}
          >
            <CircleUserRound size={19} />
            <span className="dashboard-nav-text">Profile</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item"
            title={isCollapsed ? "Settings" : undefined}
            onClick={() => navigate(`/dashboard/${normalizedRole}/settings`)}
          >
            <Settings size={19} />
            <span className="dashboard-nav-text">Settings</span>
          </button>

          <button
            type="button"
            className="dashboard-nav-item dashboard-logout"
            title={isCollapsed ? "Sign Out" : undefined}
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span className="dashboard-nav-text">Sign Out</span>
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