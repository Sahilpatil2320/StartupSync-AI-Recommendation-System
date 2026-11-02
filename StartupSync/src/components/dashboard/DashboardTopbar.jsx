import {
  Bell,
  Menu,
  Search,
  MessageSquare,
  UserRound,
  Rocket,
  CalendarDays,
  X,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

const getNotificationIcon = (type) => {
  switch (type) {
    case "message":
      return MessageSquare;
    case "application":
    case "opportunity":
      return Rocket;
    case "interview":
      return CalendarDays;
    case "profile":
      return UserRound;
    default:
      return Bell;
  }
};

const formatTime = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  const minutes = Math.floor(
    Math.max(0, Date.now() - date.getTime()) / 60000
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("startupsync_user") || "{}"
    );
  } catch {
    return {};
  }
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

function DashboardTopbar({ role, onMenuClick }) {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] =
    useState(false);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentUser = getCurrentUser();

  const userName = currentUser.name || "User";
  const userEmail = currentUser.email || "";

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  // --------------------------------------------------
  // LOAD NOTIFICATIONS
  // --------------------------------------------------

  const loadNotifications = useCallback(async () => {
    if (role !== "student") return;

    setNotificationLoading(true);

    try {
      const response = await api.get("/notifications");

      setNotifications(response.data?.data || []);
    } catch (error) {
      console.error(
        "Could not load notification preview:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role === "student") {
      loadNotifications();
    }
  }, [role, loadNotifications]);

  // --------------------------------------------------
  // SOCKET NOTIFICATIONS
  // --------------------------------------------------

  useEffect(() => {
    if (role !== "student") return undefined;

    const socket = connectSocket();

    if (!socket) return undefined;

    const handleNew = (notification) => {
      if (!notification?._id) return;

      setNotifications((current) => {
        if (
          current.some(
            (item) =>
              String(item._id) === String(notification._id)
          )
        ) {
          return current;
        }

        return [notification, ...current];
      });
    };

    const handleUpdated = (notification) => {
      if (!notification?._id) {
        loadNotifications();
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          String(item._id) === String(notification._id)
            ? notification
            : item
        )
      );
    };

    const handleReadAll = () => {
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    };

    const handleDeleted = (payload) => {
      const id = String(
        payload?._id ||
          payload?.id ||
          payload?.notificationId ||
          payload ||
          ""
      );

      if (!id) {
        loadNotifications();
        return;
      }

      setNotifications((current) =>
        current.filter(
          (item) => String(item._id) !== id
        )
      );
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:updated", handleUpdated);
    socket.on("notification:read-all", handleReadAll);
    socket.on("notification:deleted", handleDeleted);

    return () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:updated", handleUpdated);
      socket.off("notification:read-all", handleReadAll);
      socket.off("notification:deleted", handleDeleted);
    };
  }, [role, loadNotifications]);

  // --------------------------------------------------
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationPopup(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowNotificationPopup(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // --------------------------------------------------
  // USER MENU ACTIONS
  // --------------------------------------------------

  const openProfile = () => {
    setShowUserMenu(false);
    navigate(`/dashboard/${role}/profile`);
  };

  const openSettings = () => {
    setShowUserMenu(false);
    navigate(`/dashboard/${role}/settings`);
  };

  const handleSignOut = () => {
    setShowUserMenu(false);

    localStorage.removeItem("startupsync_token");
    localStorage.removeItem("startupsync_user");

    navigate("/", { replace: true });
  };

  // --------------------------------------------------
  // NOTIFICATION ACTION
  // --------------------------------------------------

  const handleNotificationClick = async (notification) => {
    setShowNotificationPopup(false);

    if (!notification.isRead) {
      try {
        await api.patch(
          `/notifications/${encodeURIComponent(
            notification._id
          )}/read`
        );

        setNotifications((current) =>
          current.map((item) =>
            String(item._id) === String(notification._id)
              ? { ...item, isRead: true }
              : item
          )
        );
      } catch (error) {
        console.error(
          "Could not mark notification as read:",
          error
        );
      }
    }

    if (notification.type === "message") {
      const senderId =
        notification.sender?._id ||
        notification.sender?.id ||
        notification.senderId ||
        notification.relatedUser?._id ||
        notification.relatedUserId ||
        notification.metadata?.senderId ||
        "";

      navigate(`/dashboard/${role}/messages`, {
        state: {
          openUserId: senderId ? String(senderId) : "",
        },
      });

      return;
    }

    navigate(`/dashboard/${role}/notifications`);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

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
          <h1>{roleTitles[role]}</h1>
          <p>Manage your StartupSync workspace</p>
        </div>
      </div>

      <div className="dashboard-topbar-actions">
        {/* SEARCH */}
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

        {/* NOTIFICATIONS */}
        {role === "student" ? (
          <div
            className="dashboard-notification-wrapper"
            ref={notificationRef}
          >
            <button
              type="button"
              className="dashboard-topbar-icon dashboard-notification-button"
              onClick={() =>
                setShowNotificationPopup((current) => !current)
              }
              aria-label="Notifications"
              aria-expanded={showNotificationPopup}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="dashboard-notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotificationPopup && (
              <div className="dashboard-notification-popup">
                <div className="dashboard-notification-popup-header">
                  <div>
                    <h3>Notifications</h3>

                    <span>
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotificationPopup(false)
                    }
                    aria-label="Close notifications"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="dashboard-notification-popup-list">
                  {notificationLoading ? (
                    <p className="dashboard-notification-popup-empty">
                      Loading notifications...
                    </p>
                  ) : notifications.length ? (
                    notifications.slice(0, 5).map((notification) => {
                      const Icon = getNotificationIcon(
                        notification.type
                      );

                      return (
                        <button
                          type="button"
                          key={notification._id}
                          className={`dashboard-notification-preview ${
                            !notification.isRead ? "unread" : ""
                          }`}
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                        >
                          <span className="dashboard-notification-preview-icon">
                            <Icon size={17} />
                          </span>

                          <span className="dashboard-notification-preview-content">
                            <strong>
                              {notification.title}
                            </strong>

                            <span>
                              {notification.message}
                            </span>

                            <small>
                              {formatTime(notification.createdAt)}
                            </small>
                          </span>

                          {!notification.isRead && (
                            <span className="dashboard-notification-preview-dot" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <p className="dashboard-notification-popup-empty">
                      No notifications yet.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="dashboard-notification-view-all"
                  onClick={() => {
                    setShowNotificationPopup(false);

                    navigate(
                      `/dashboard/${role}/notifications`
                    );
                  }}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="dashboard-topbar-icon dashboard-notification-button"
            onClick={() =>
              navigate(`/dashboard/${role}/notifications`)
            }
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>
        )}

        {/* USER PROFILE DROPDOWN */}
        <div
          className="dashboard-user-menu"
          ref={userMenuRef}
        >
          <button
            type="button"
            className="dashboard-topbar-profile"
            onClick={() =>
              setShowUserMenu((current) => !current)
            }
            aria-label="Open user menu"
            aria-expanded={showUserMenu}
          >
            <span className="dashboard-profile-avatar">
              {getInitial(userName)}
            </span>

            <span className="dashboard-profile-name">
              {userName}
            </span>

            <ChevronDown
              size={15}
              className={`dashboard-user-chevron ${
                showUserMenu ? "open" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="dashboard-user-popover">
              <div className="dashboard-user-popover-header">
                <span className="dashboard-profile-avatar">
                  {getInitial(userName)}
                </span>

                <div>
                  <strong>{userName}</strong>

                  {userEmail && <span>{userEmail}</span>}

                  <span className="dashboard-user-role">
                    {role
                      ? role.charAt(0).toUpperCase() + role.slice(1)
                      : "User"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={openProfile}
              >
                <UserRound size={17} />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={openSettings}
              >
                <Settings size={17} />
                <span>Settings</span>
              </button>

              <button
                type="button"
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