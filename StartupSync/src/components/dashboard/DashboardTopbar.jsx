import {
  Bell,
  Menu,
  Search
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./DashboardTopbar.css";

const roleTitles = {
  founder: "Founder Workspace",
  investor: "Investor Workspace",
  mentor: "Mentor Workspace",
  student: "Student Workspace",
  incubator: "Incubator Workspace",
  admin: "Administration"
};

function DashboardTopbar({
  role,
  onMenuClick
}) {
  const navigate = useNavigate();

  return (
    <header className="dashboard-topbar">

      <div className="dashboard-topbar-left">

        <button
          type="button"
          className="dashboard-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1>
            {roleTitles[role]}
          </h1>

          <p>
            Manage your StartupSync workspace
          </p>
        </div>

      </div>

      <div className="dashboard-topbar-actions">

        <button
          type="button"
          className="dashboard-topbar-icon"
          onClick={() =>
            navigate(`/dashboard/${role}/search`)
          }
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="dashboard-topbar-icon dashboard-notification-button"
          onClick={() =>
            navigate(
              `/dashboard/${role}/notifications`
            )
          }
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="dashboard-notification-dot" />
        </button>

        <button
          type="button"
          className="dashboard-topbar-profile"
          onClick={() =>
            navigate(`/dashboard/${role}/profile`)
          }
        >
          <span className="dashboard-profile-avatar">
            U
          </span>

          <span className="dashboard-profile-name">
            User
          </span>
        </button>

      </div>

    </header>
  );
}

export default DashboardTopbar;