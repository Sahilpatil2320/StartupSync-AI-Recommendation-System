import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  MessageCircle,
  Rocket,
  Handshake,
  UserRound,
  FileText,
  UsersRound,
  X,
  AlertCircle,
  Inbox,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../services/api";
import { connectSocket } from "../../../services/socket";

import "./MentorNotifications.css";

const filterOptions = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "mentorship", label: "Mentorships" },
  { id: "startup", label: "Startups" },
  { id: "message", label: "Messages" },
  { id: "profile", label: "Profile" },
  { id: "system", label: "System" },
];

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const difference = Date.now() - date.getTime();

  if (difference < 60_000) return "Just now";

  if (difference < 3_600_000) {
    const minutes = Math.floor(difference / 60_000);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (difference < 86_400_000) {
    const hours = Math.floor(difference / 3_600_000);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (difference < 172_800_000) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
};

const mapNotification = (item) => ({
  ...item,
  id: String(item._id || item.id),
  type: String(item.type || "system").toLowerCase(),
  title: item.title || "Notification",
  message: item.message || "",
  read: Boolean(item.isRead ?? item.read ?? false),
  link: item.link || "",
  createdAt: item.createdAt || item.updatedAt || "",
  time: formatTime(item.createdAt || item.updatedAt),
});

const getNotificationIcon = (type) => {
  switch (type) {
    case "message":
      return MessageCircle;

    case "opportunity":
    case "mentorship":
    case "mentor":
      return Handshake;

    case "startup":
      return Rocket;

    case "profile":
      return UserRound;

    case "application":
      return FileText;

    case "interview":
      return UsersRound;

    default:
      return Bell;
  }
};

const getNotificationLabel = (type) => {
  const labels = {
    message: "Message",
    opportunity: "Mentorship",
    mentorship: "Mentorship",
    mentor: "Mentorship",
    startup: "Startup",
    profile: "Profile",
    application: "Application",
    interview: "Interview",
    system: "System",
  };

  return labels[type] || "System";
};

const matchesFilter = (notification, filter) => {
  if (filter === "all") return true;

  if (filter === "unread") {
    return !notification.read;
  }

  if (filter === "mentorship") {
    return ["mentorship", "mentor", "opportunity"].includes(
      notification.type
    );
  }

  if (filter === "startup") {
    return notification.type === "startup";
  }

  return notification.type === filter;
};

const getNotificationDestination = (notification) => {
  // Always prefer the destination supplied by the backend.
  if (notification.link) {
    return notification.link;
  }

  // Mentor-specific fallback destinations.
  switch (notification.type) {
    case "message":
      return "/dashboard/mentor/messages";

    case "opportunity":
    case "mentorship":
    case "mentor":
      return "/dashboard/mentor/mentorships";

    case "startup":
      return "/dashboard/mentor/startups";

    case "profile":
      return "/dashboard/mentor/profile";

    default:
      return "/dashboard/mentor/notifications";
  }
};

function MentorNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        matchesFilter(notification, activeFilter)
      ),
    [notifications, activeFilter]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications");

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error("Unexpected notifications API response.");
      }

      const rows = response.data.data.map(mapNotification);

      setNotifications(rows);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Receive new notifications instantly.
  useEffect(() => {
    const socket = connectSocket();

    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      if (!notification?._id && !notification?.id) return;

      const mapped = mapNotification(notification);

      setNotifications((previous) => {
        const alreadyExists = previous.some(
          (item) => item.id === mapped.id
        );

        if (alreadyExists) return previous;

        return [mapped, ...previous];
      });
    };

    const handleUpdatedNotification = (updated) => {
      if (!updated?._id && !updated?.id) return;

      const mapped = mapNotification(updated);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === mapped.id ? { ...item, ...mapped } : item
        )
      );
    };

    const handleReadAll = () => {
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );
    };

    const handleDeletedNotification = (deleted) => {
      const deletedId = String(
        deleted?._id || deleted?.id || deleted
      );

      if (!deletedId) return;

      setNotifications((previous) =>
        previous.filter((item) => item.id !== deletedId)
      );
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:updated", handleUpdatedNotification);
    socket.on("notification:read-all", handleReadAll);
    socket.on("notification:deleted", handleDeletedNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:updated", handleUpdatedNotification);
      socket.off("notification:read-all", handleReadAll);
      socket.off("notification:deleted", handleDeletedNotification);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    const notification = notifications.find(
      (item) => item.id === id
    );

    if (!notification || notification.read || busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await api.patch(`/notifications/${encodeURIComponent(id)}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );

      setNotice("All notifications marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await api.delete(`/notifications/${encodeURIComponent(id)}`);

      setNotifications((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setNotice("Notification deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || busy) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete all notifications?"
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      // The existing API provides individual notification deletion.
      // Delete all current notifications using that existing endpoint.
      await Promise.all(
        notifications.map((item) =>
          api.delete(`/notifications/${encodeURIComponent(item.id)}`)
        )
      );

      setNotifications([]);
      setActiveFilter("all");
      setNotice("All notifications cleared.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Some notifications could not be deleted. Refresh and try again."
      );

      await loadNotifications();
    } finally {
      setBusy(false);
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    const destination = getNotificationDestination(notification);

    navigate(destination);
  };

  return (
    <section className="mentor-notifications-page">
      {/* Header */}

      <div className="mentor-notifications-header">
        <div>
          <span className="mentor-notifications-badge">
            Activity Center
          </span>

          <h2>Notifications</h2>

          <p>
            Stay updated with mentorship requests, startup activity,
            messages and upcoming sessions.
          </p>
        </div>

        <div className="mentor-notifications-summary">
          <strong>{unreadCount}</strong>
          <span>Unread</span>
        </div>
      </div>

      {/* Error and success messages */}

      {(error || notice) && (
        <div
          className={`mentor-notification-alert ${
            error ? "mentor-notification-alert-error" : ""
          }`}
          role={error ? "alert" : "status"}
        >
          {error ? (
            <AlertCircle size={17} />
          ) : (
            <Check size={17} />
          )}

          <span>{error || notice}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
            }}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Action buttons */}

      <div className="mentor-notifications-actions">
        <button
          type="button"
          className="mentor-notification-action-button"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || busy}
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>

        <button
          type="button"
          className="mentor-notification-action-button mentor-clear-all-button"
          onClick={handleClearAll}
          disabled={notifications.length === 0 || busy}
        >
          <Trash2 size={17} />
          Clear All
        </button>

        <button
          type="button"
          className="mentor-notification-action-button"
          onClick={loadNotifications}
          disabled={loading || busy}
        >
          <RefreshCw
            size={17}
            className={loading ? "mentor-refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Category filters */}

      <div className="mentor-notifications-toolbar">
        <div className="mentor-notification-filters">
          {filterOptions.map((filter) => {
            const count =
              filter.id === "all"
                ? notifications.length
                : filter.id === "unread"
                  ? unreadCount
                  : notifications.filter((item) =>
                      matchesFilter(item, filter.id)
                    ).length;

            return (
              <button
                key={filter.id}
                type="button"
                className={
                  activeFilter === filter.id
                    ? "mentor-notification-filter-active"
                    : ""
                }
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification list */}

      <div className="mentor-notifications-result-heading">
        <div>
          <h3>
            {activeFilter === "all"
              ? "Recent Notifications"
              : filterOptions.find(
                  (item) => item.id === activeFilter
                )?.label}
          </h3>

          <p>
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mentor-notifications-empty">
          <RefreshCw size={25} className="mentor-refresh-spinning" />
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="mentor-notifications-list">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);

            return (
              <article
                key={notification.id}
                className={`mentor-notification-card ${
                  !notification.read
                    ? "mentor-notification-unread"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="mentor-notification-main"
                  onClick={() =>
                    handleOpenNotification(notification)
                  }
                >
                  <div
                    className={`mentor-notification-icon mentor-notification-icon-${notification.type}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="mentor-notification-content">
                    <div className="mentor-notification-title-row">
                      <h4>{notification.title}</h4>

                      {!notification.read && (
                        <span className="mentor-notification-new">
                          New
                        </span>
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="mentor-notification-meta">
                      <span>
                        {getNotificationLabel(notification.type)}
                      </span>

                      <span>•</span>

                      <span>{notification.time}</span>

                      {!notification.read && (
                        <span className="mentor-notification-unread-label">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="mentor-notification-card-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      title="Mark as read"
                      aria-label="Mark notification as read"
                      disabled={busy}
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                    >
                      <Check size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Delete notification"
                    aria-label="Delete notification"
                    disabled={busy}
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mentor-notifications-empty">
          <div className="mentor-notifications-empty-icon">
            <Inbox size={25} />
          </div>

          <h3>
            {notifications.length === 0
              ? "No notifications yet"
              : "No notifications found"}
          </h3>

          <p>
            {activeFilter === "unread"
              ? "You are all caught up. There are no unread notifications."
              : "Your mentorship and workspace updates will appear here."}
          </p>
        </div>
      )}
    </section>
  );
}

export default MentorNotifications;