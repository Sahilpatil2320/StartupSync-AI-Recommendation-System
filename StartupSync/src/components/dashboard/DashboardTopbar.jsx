
import { useCallback, useEffect, useRef, useState } from "react";
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
import api from "../../services/api";
import { connectSocket } from "../../services/socket";
import "./DashboardTopbar.css";

const roleTitles = {
  founder: "Founder Workspace",
  investor: "Investor Workspace",
  mentor: "Mentor Workspace",
  student: "Student Workspace",
  admin: "Administration",
};

const getId = (item) => String(item?._id || item?.id || "");

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();

  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

function DashboardTopbar({ role, onMenuClick }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

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

  const unreadCount = notifications.filter(
    (item) => !(item.isRead ?? item.read ?? false)
  ).length;

  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);

    try {
      const response = await api.get("/notifications");
      setNotifications(response.data?.data || []);
      setNotificationError("");
    } catch (error) {
      setNotificationError(
        error.response?.data?.message || "Could not load notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);


  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      if (!getId(notification)) return;

      setNotifications((previous) => {
        if (previous.some((item) => getId(item) === getId(notification))) {
          return previous;
        }

        return [notification, ...previous].slice(0, 50);
      });
    };

    const handleNotificationUpdated = (payload) => {
      const updated = payload?.notification;
      if (!getId(updated)) return;

      setNotifications((previous) =>
        previous.map((item) =>
          getId(item) === getId(updated)
            ? { ...item, ...updated, isRead: updated.isRead, read: updated.isRead }
            : item
        )
      );
    };

    const handleAllNotificationsRead = () => {
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true, read: true }))
      );
    };

    const handleNotificationDeleted = (payload) => {
      const deletedId = String(payload?.notificationId || "");
      if (!deletedId) return;

      setNotifications((previous) =>
        previous.filter((item) => getId(item) !== deletedId)
      );
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:updated", handleNotificationUpdated);
    socket.on("notification:read-all", handleAllNotificationsRead);
    socket.on("notification:deleted", handleNotificationDeleted);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:updated", handleNotificationUpdated);
      socket.off("notification:read-all", handleAllNotificationsRead);
      socket.off("notification:deleted", handleNotificationDeleted);
    };
  }, []);


  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setNotificationOpen(false);
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
    setNotificationOpen(false);
    navigate(page ? `/dashboard/${role}/${page}` : `/dashboard/${role}`);
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    localStorage.removeItem("startupsync_token");
    localStorage.removeItem("startupsync_user");
    navigate("/login", { replace: true });
  };

  const markNotificationRead = async (notification) => {
    if (notification.isRead ?? notification.read ?? false) return;

    try {
      await api.patch(`/notifications/${getId(notification)}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          getId(item) === getId(notification)
            ? { ...item, isRead: true, read: true }
            : item
        )
      );
    } catch (error) {
      setNotificationError(
        error.response?.data?.message || "Could not mark as read."
      );
    }
  };

  const openNotification = async (notification) => {
    await markNotificationRead(notification);
    setNotificationOpen(false);

    if (notification.link) {
      if (notification.link.startsWith("/")) {
        navigate(notification.link);
      } else {
        navigate(`/dashboard/${role}/notifications`);
      }
    } else {
      navigate(`/dashboard/${role}/notifications`);
    }
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
              setNotificationOpen(false);
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
                      onClick={() => goTo(item.page)}
                    >
                      <Search size={15} />
                      <span>{item.label}</span>
                    </button>
                  ))
                ) : (
                  <p className="dashboard-search-empty">
                    No matching pages found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="dashboard-topbar-search dashboard-notification-wrapper"
          ref={notificationRef}
        >
          <button
            type="button"
            className="dashboard-topbar-icon dashboard-notification-button"
            onClick={() => {
              setNotificationOpen((open) => !open);
              setSearchOpen(false);
              setMenuOpen(false);

              if (!notificationOpen) loadNotifications();
            }}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notificationOpen}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="dashboard-notification-dot">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="dashboard-search-popover dashboard-notification-popover">
              <div className="dashboard-notification-popover-header">
                <strong>Notifications</strong>
                <button
                  type="button"
                  onClick={() => goTo("notifications")}
                >
                  View all
                </button>
              </div>

              {notificationError && (
                <p className="dashboard-search-empty">
                  {notificationError}
                </p>
              )}

              {notificationLoading ? (
                <p className="dashboard-search-empty">Loading notifications...</p>
              ) : notifications.length ? (
                <div className="dashboard-search-results">
                  {notifications.slice(0, 6).map((notification) => {
                    const isRead =
                      notification.isRead ?? notification.read ?? false;

                    return (
                      <button
                        type="button"
                        key={getId(notification)}
                        className={`dashboard-notification-entry ${!isRead ? "dashboard-notification-entry-unread" : ""
                          }`}
                        onClick={() => openNotification(notification)}
                      >
                        <span className="dashboard-notification-entry-icon">
                          <Bell size={16} />
                        </span>
                        <span className="dashboard-notification-entry-content">
                          <strong>{notification.title || "Notification"}</strong>
                          <span>{notification.message || ""}</span>
                          <small>
                            {formatTime(
                              notification.createdAt || notification.updatedAt
                            )}
                          </small>
                        </span>
                        {!isRead && (
                          <span className="dashboard-notification-entry-dot" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="dashboard-search-empty">
                  No notifications yet.
                </p>
              )}

              <button
                type="button"
                className="dashboard-notification-view-all"
                onClick={() => goTo("notifications")}
              >
                Open notification center
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-user-menu" ref={menuRef}>
          <button
            type="button"
            className="dashboard-topbar-profile"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
              setNotificationOpen(false);
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