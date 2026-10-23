
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DashboardTopbar.css";

const roleTitles = {
  founder: "Founder Workspace",
  investor: "Investor Workspace",
  mentor: "Mentor Workspace",
  student: "Student Workspace",
  admin: "Administration",
};

function DashboardTopbar({ role, onMenuClick }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("startupsync_user") || "{}");
    } catch {
      return {};
    }
  })();

  const displayName =
    storedUser.name ||
    storedUser.fullName ||
    storedUser.username ||
    storedUser.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const goTo = (page) => {
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(`/dashboard/${role}/${page}`);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    localStorage.removeItem("startupsync_token");
    localStorage.removeItem("startupsync_user");
    navigate("/login", { replace: true });
  };

  const searchPages = [
    { label: "Dashboard", page: "", keywords: "home overview" },
    { label: "Profile", page: "profile", keywords: "account personal details" },
    { label: "Settings", page: "settings", keywords: "preferences security" },
    { label: "Messages", page: "messages", keywords: "chat conversations" },
    { label: "Notifications", page: "notifications", keywords: "alerts activity" },
    ...(role === "founder"
      ? [
          { label: "My Startup", page: "startup", keywords: "company business" },
          { label: "Investors", page: "investors", keywords: "funding capital" },
          { label: "Mentors", page: "mentors", keywords: "guidance expertise" },
          { label: "Team", page: "team", keywords: "members invitations" },
        ]
      : []),
    ...(role === "investor"
      ? [
          { label: "Discover Startups", page: "startups", keywords: "companies founders" },
          { label: "My Investments", page: "investments", keywords: "portfolio funding" },
        ]
      : []),
    ...(role === "mentor"
      ? [
          { label: "Startups", page: "startups", keywords: "founders companies" },
          { label: "Mentorships", page: "mentorships", keywords: "guidance requests" },
        ]
      : []),
    ...(role === "student"
      ? [
          { label: "Internships", page: "internships", keywords: "jobs career" },
          { label: "Opportunities", page: "opportunities", keywords: "events programs" },
          { label: "Applications", page: "applications", keywords: "submitted status" },
        ]
      : []),
    ...(role === "admin"
      ? [
          { label: "Users", page: "users", keywords: "accounts" },
          { label: "Startups", page: "startups", keywords: "companies" },
          { label: "Reports", page: "reports", keywords: "analytics" },
        ]
      : []),
  ];

  const filteredPages = searchPages.filter((item) =>
    `${item.label} ${item.keywords}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

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
          <h1>{roleTitles[role] || "StartupSync Workspace"}</h1>
          <p>Manage your StartupSync workspace</p>
        </div>
      </div>

      <div className="dashboard-topbar-actions">
        <div className="dashboard-topbar-search" ref={searchRef}>
          <button
            type="button"
            className="dashboard-topbar-icon"
            aria-label="Search workspace"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
              setSearchTerm("");
            }}
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>

          {searchOpen && (
            <div className="dashboard-search-popover">
              <input
                autoFocus
                type="search"
                placeholder="Search workspace..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search workspace pages"
              />

              <div className="dashboard-search-results">
                {filteredPages.length ? (
                  filteredPages.map((item) => (
                    <button
                      type="button"
                      key={`${item.label}-${item.page}`}
                      onClick={() => {
                        if (item.page) {
                          goTo(item.page);
                        } else {
                          setSearchOpen(false);
                          navigate(`/dashboard/${role}`);
                        }
                      }}
                    >
                      <Search size={15} />
                      <span>{item.label}</span>
                    </button>
                  ))
                ) : (
                  <p className="dashboard-search-empty">No matching pages found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="dashboard-topbar-icon dashboard-notification-button"
          onClick={() => goTo("notifications")}
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="dashboard-notification-dot" />
        </button>

        <div className="dashboard-user-menu" ref={menuRef}>
          <button
            type="button"
            className="dashboard-topbar-profile"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="dashboard-profile-avatar">
              {initials || <CircleUserRound size={20} />}
            </span>
            <span className="dashboard-profile-name">{displayName}</span>
            <ChevronDown size={15} />
          </button>

          {menuOpen && (
            <div className="dashboard-user-popover" role="menu">
              <div className="dashboard-user-popover-header">
                <span className="dashboard-profile-avatar">
                  {initials || <CircleUserRound size={20} />}
                </span>
                <div>
                  <strong>{displayName}</strong>
                  <span>{roleTitles[role] || role}</span>
                </div>
              </div>

              <button type="button" role="menuitem" onClick={() => goTo("profile")}>
                <UserRound size={17} />
                <span>My Profile</span>
              </button>

              <button type="button" role="menuitem" onClick={() => goTo("settings")}>
                <Settings size={17} />
                <span>Settings</span>
              </button>

              <button
                type="button"
                role="menuitem"
                className="dashboard-user-signout"
                onClick={handleSignOut}
              >
                <LogOut size={17} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardTopbar;