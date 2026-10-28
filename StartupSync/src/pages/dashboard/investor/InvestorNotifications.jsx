
import {
  Bell,
  Check,
  CheckCheck,
  CircleDollarSign,
  MessageSquare,
  Rocket,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { connectSocket } from "../../../services/socket";
import "./InvestorNotifications.css";

const notificationFilters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "startup", label: "Startups" },
  { id: "investment", label: "Investments" },
  { id: "message", label: "Messages" },
  { id: "mentor", label: "Mentors" },
  { id: "system", label: "System" },
];

const getNotificationId = (notification) =>
  String(notification?._id || notification?.id || "");

const getNotificationType = (notification) => {
  const value = String(
    notification?.type || notification?.category || "system"
  ).toLowerCase();

  if (value.includes("startup") || value.includes("founder")) return "startup";
  if (value.includes("invest")) return "investment";
  if (value.includes("message") || value.includes("chat")) return "message";
  if (value.includes("mentor") || value.includes("connection")) return "mentor";
  if (value === "system") return "system";

  return "system";
};

const normalizeNotification = (notification) => {
  if (!notification || typeof notification !== "object") return null;

  const id = getNotificationId(notification);

  return {
    ...notification,
    id,
    type: getNotificationType(notification),
    title: notification.title || notification.subject || "Notification",
    message:
      notification.message ||
      notification.description ||
      notification.body ||
      "",
    details:
      notification.details ||
      notification.message ||
      notification.description ||
      "",
    createdAt: notification.createdAt || notification.updatedAt || null,
    read: Boolean(notification.isRead ?? notification.read ?? false),
    link: notification.link || "",
  };
};

const extractNotifications = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getNotificationDate = (notification) => {
  const date = notification?.createdAt || notification?.updatedAt;
  if (!date) return "Recently";

  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "Recently";

  const difference = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(date).toLocaleDateString();
};

function InvestorNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const loadNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications");
      const records = extractNotifications(response)
        .map(normalizeNotification)
        .filter((notification) => notification?.id);

      setNotifications(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications. Please try again."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const token = localStorage.getItem("startupsync_token");
    if (!token) return undefined;

    // connectSocket must authenticate with the JWT required by server.js.
    // This supports both connectSocket(token) and the existing no-argument
    // helper if it already reads the token internally.
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const upsertNotification = (rawNotification) => {
      const notification = normalizeNotification(
        rawNotification?.notification || rawNotification
      );

      if (!notification?.id) {
        // Some events carry only an ID or a count; fetch the canonical list.
        loadNotifications(false);
        return;
      }

      setNotifications((current) => {
        const exists = current.some((item) => item.id === notification.id);

        if (exists) {
          return current.map((item) =>
            item.id === notification.id
              ? { ...item, ...notification }
              : item
          );
        }

        return [notification, ...current];
      });
    };

    const handleNotificationUpdated = (payload) => {
      const notification = normalizeNotification(payload?.notification);

      if (!notification?.id) {
        loadNotifications(false);
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, ...notification }
            : item
        )
      );

      setSelectedNotification((current) =>
        current?.id === notification.id
          ? { ...current, ...notification }
          : current
      );
    };

    const handleAllNotificationsRead = () => {
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true, isRead: true }))
      );

      setSelectedNotification((current) =>
        current ? { ...current, read: true, isRead: true } : current
      );
    };

    const handleNotificationDeleted = (payload) => {
      const deletedId = String(payload?.notificationId || "");

      if (!deletedId) {
        loadNotifications(false);
        return;
      }

      setNotifications((current) =>
        current.filter((item) => item.id !== deletedId)
      );

      setSelectedNotification((current) =>
        current?.id === deletedId ? null : current
      );
    };

    // Listen to both names for compatibility with existing backend emitters.
    socket.on("notification:created", upsertNotification);
    socket.on("notification:new", upsertNotification);
    socket.on("notification:updated", handleNotificationUpdated);
    socket.on("notification:read-all", handleAllNotificationsRead);
    socket.on("notification:deleted", handleNotificationDeleted);

    const handleConnect = () => loadNotifications(false);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("notification:created", upsertNotification);
      socket.off("notification:new", upsertNotification);
      socket.off("notification:updated", handleNotificationUpdated);
      socket.off("notification:read-all", handleAllNotificationsRead);
      socket.off("notification:deleted", handleNotificationDeleted);
      socket.off("connect", handleConnect);
    };
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;

    if (activeFilter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }

    return notifications.filter(
      (notification) => notification.type === activeFilter
    );
  }, [notifications, activeFilter]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "startup":
        return <Rocket size={19} />;
      case "investment":
        return <CircleDollarSign size={19} />;
      case "message":
        return <MessageSquare size={19} />;
      case "mentor":
        return <UserRound size={19} />;
      default:
        return <Bell size={19} />;
    }
  };

  const markAsRead = async (notification) => {
    if (!notification.id || notification.read || actionLoading) return;

    setActionLoading(true);
    setError("");

    try {
      await api.patch(
        `/notifications/${encodeURIComponent(notification.id)}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read: true, isRead: true }
            : item
        )
      );

      setSelectedNotification((current) =>
        current?.id === notification.id
          ? { ...current, read: true, isRead: true }
          : current
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not mark notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!unreadCount || actionLoading) return;

    setActionLoading(true);
    setError("");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true, isRead: true }))
      );

      setSelectedNotification((current) =>
        current ? { ...current, read: true, isRead: true } : current
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNotification = async (notification) => {
    if (!notification.id || actionLoading) return;

    setActionLoading(true);
    setError("");

    try {
      await api.delete(
        `/notifications/${encodeURIComponent(notification.id)}`
      );

      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id)
      );

      setSelectedNotification((current) =>
        current?.id === notification.id ? null : current
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openNotification = async (notification) => {
    setSelectedNotification(notification);

    if (!notification.read) {
      await markAsRead(notification);
    }
  };

  const openNotificationLink = (notification) => {
    if (!notification?.link?.startsWith("/")) return;

    // Keep navigation within the React Router application.
    navigate(notification.link);
    setSelectedNotification(null);
  };

  return (
    <div className="investor-notifications-page">
      <section className="investor-notifications-header">
        <div>
          <span className="investor-notifications-badge">
            <Bell size={15} />
            Activity Center
          </span>

          <h2>Notifications</h2>
          <p>
            Stay updated with startup activity, investment updates and important
            StartupSync events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="investor-mark-all-button"
            onClick={markAllAsRead}
            disabled={actionLoading}
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}
      </section>

      {error && (
        <div role="alert" style={{ marginBottom: 16, color: "#dc2626" }}>
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            style={{ marginLeft: 10 }}
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="investor-notification-summary">
        <div className="investor-notification-summary-card">
          <div className="investor-notification-summary-icon">
            <Bell size={20} />
          </div>
          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="investor-notification-summary-card">
          <div className="investor-notification-summary-icon">
            <MessageSquare size={20} />
          </div>
          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="investor-notification-summary-card">
          <div className="investor-notification-summary-icon">
            <Rocket size={20} />
          </div>
          <div>
            <span>Startup Updates</span>
            <strong>
              {
                notifications.filter(
                  (notification) => notification.type === "startup"
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="investor-notification-panel">
        <div className="investor-notification-filter-row">
          <div className="investor-notification-filters">
            {notificationFilters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={
                  activeFilter === filter.id
                    ? "investor-notification-filter-active"
                    : ""
                }
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                {filter.id === "unread" && unreadCount > 0 && (
                  <span>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="investor-notification-list">
          {loading ? (
            <div className="investor-notifications-empty">
              <div className="investor-notifications-empty-icon">
                <Bell size={28} />
              </div>
              <h3>Loading notifications...</h3>
              <p>Please wait while we retrieve your notifications.</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`investor-notification-item ${
                  notification.read ? "" : "investor-notification-unread"
                }`}
              >
                <div
                  className={`investor-notification-icon investor-notification-icon-${notification.type}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <button
                  type="button"
                  className="investor-notification-content"
                  onClick={() => openNotification(notification)}
                >
                  <div className="investor-notification-title-row">
                    <h3>{notification.title}</h3>
                    {!notification.read && (
                      <span className="investor-unread-dot" />
                    )}
                  </div>

                  <p>{notification.message}</p>
                  <span className="investor-notification-time">
                    {getNotificationDate(notification)}
                  </span>
                </button>

                <div className="investor-notification-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      title="Mark as read"
                      aria-label="Mark as read"
                      disabled={actionLoading}
                      onClick={() => markAsRead(notification)}
                    >
                      <Check size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Delete notification"
                    aria-label="Delete notification"
                    disabled={actionLoading}
                    onClick={() => deleteNotification(notification)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="investor-notifications-empty">
              <div className="investor-notifications-empty-icon">
                <Bell size={28} />
              </div>
              <h3>
                {notifications.length
                  ? "No notifications"
                  : "You're all caught up"}
              </h3>
              <p>
                {notifications.length
                  ? "There are no notifications in this category right now."
                  : "New notifications will appear here when available."}
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedNotification && (
        <div
          className="investor-notification-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null);
            }
          }}
        >
          <div
            className="investor-notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="investor-notification-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="investor-notification-modal-header">
              <div
                className={`investor-notification-modal-icon investor-notification-icon-${selectedNotification.type}`}
              >
                {getNotificationIcon(selectedNotification.type)}
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                aria-label="Close notification"
              >
                <X size={19} />
              </button>
            </div>

            <div className="investor-notification-modal-body">
              <span>{getNotificationDate(selectedNotification)}</span>
              <h3 id="investor-notification-modal-title">
                {selectedNotification.title}
              </h3>
              <p>
                {selectedNotification.details || selectedNotification.message}
              </p>
            </div>

            <div className="investor-notification-modal-footer">
              {selectedNotification.link?.startsWith("/") && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openNotificationLink(selectedNotification)}
                >
                  Open
                </button>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                disabled={actionLoading}
                onClick={() => deleteNotification(selectedNotification)}
              >
                Delete
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestorNotifications;