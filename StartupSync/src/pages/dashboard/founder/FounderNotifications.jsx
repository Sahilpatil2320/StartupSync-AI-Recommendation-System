
import {
  Bell,
  Check,
  CheckCheck,
  Handshake,
  MessageCircle,
  MoreVertical,
  Rocket,
  Trash2,
  UserRound,
  UsersRound,
  X,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import { connectSocket } from "../../../services/socket";
import "./FounderNotifications.css";

const notificationTypes = [
  "All",
  "Application",
  "Interview",
  "Message",
  "Opportunity",
  "Profile",
  "System",
];

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const difference = Date.now() - date.getTime();

  if (difference < 60_000) return "Just now";
  if (difference < 3_600_000) {
    return `${Math.floor(difference / 60_000)} minutes ago`;
  }
  if (difference < 86_400_000) {
    return `${Math.floor(difference / 3_600_000)} hours ago`;
  }
  if (difference < 172_800_000) return "Yesterday";

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
};

const mapNotification = (item) => ({
  id: String(item._id || item.id),
  type: String(item.type || "system").toLowerCase(),
  title: item.title || "Notification",
  message: item.message || "",
  time: formatTime(item.createdAt || item.updatedAt),
  createdAt: item.createdAt || item.updatedAt || new Date().toISOString(),
  unread: !(item.isRead ?? item.read ?? false),
  link: item.link || "",
});

const getNotificationIcon = (type) => {
  switch (type) {
    case "application":
      return <FileText size={19} />;
    case "interview":
      return <UsersRound size={19} />;
    case "message":
      return <MessageCircle size={19} />;
    case "opportunity":
      return <Handshake size={19} />;
    case "profile":
      return <UserRound size={19} />;
    case "startup":
      return <Rocket size={19} />;
    default:
      return <Bell size={19} />;
  }
};

const getNotificationLabel = (type) => {
  const labels = {
    application: "Application",
    interview: "Interview",
    message: "Message",
    opportunity: "Opportunity",
    profile: "Profile",
    startup: "Startup",
    document: "Document",
    investor: "Investor",
    mentor: "Mentor",
    team: "Team",
    system: "System",
  };

  return labels[type] || "System";
};

function FounderNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedNotification, setSelectedNotification] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get("/notifications");
      const data = response.data?.data || [];

      setNotifications(data.map(mapNotification));
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Receive notifications instantly through the authenticated socket.
  useEffect(() => {
    const socket = connectSocket();

    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      if (!notification?._id && !notification?.id) return;

      const mapped = mapNotification(notification);

      setNotifications((previous) => {
        if (previous.some((item) => item.id === mapped.id)) {
          return previous;
        }

        return [mapped, ...previous];
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") return notifications;

    return notifications.filter(
      (notification) =>
        notification.type === activeFilter.toLowerCase()
    );
  }, [notifications, activeFilter]);

  const handleMarkAsRead = async (id) => {
    const notification = notifications.find((item) => item.id === id);

    if (!notification || !notification.unread) return;

    setActionId(id);

    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, unread: false } : item
        )
      );

      setSelectedNotification((previous) =>
        previous?.id === id
          ? { ...previous, unread: false }
          : previous
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not mark notification as read."
      );
    } finally {
      setActionId("");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!unreadCount) return;

    setActionId("all");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, unread: false }))
      );

      setSelectedNotification((previous) =>
        previous ? { ...previous, unread: false } : previous
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not mark all notifications as read."
      );
    } finally {
      setActionId("");
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);

    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setSelectedNotification((previous) =>
        previous?.id === id ? null : previous
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete notification."
      );
    } finally {
      setActionId("");
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);

    if (notification.unread) {
      await handleMarkAsRead(notification.id);
    }
  };

  const handleOpenLink = (notification) => {
    if (!notification.link) return;

    setSelectedNotification(null);
    window.location.href = notification.link;
  };

  return (
    <div className="founder-notifications-page">
      <section className="founder-notifications-header">
        <div>
          <span className="founder-notifications-badge">
            <Bell size={15} />
            Activity Center
          </span>

          <h2>Notifications</h2>

          <p>
            Stay updated with your startup activity,
            connections and opportunities.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="founder-mark-all-button"
            onClick={handleMarkAllAsRead}
            disabled={actionId === "all"}
          >
            <CheckCheck size={17} />
            {actionId === "all" ? "Updating..." : "Mark all as read"}
          </button>
        )}
      </section>

      {error && (
        <div role="alert" className="founder-message-error">
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="founder-notification-summary">
        <div className="founder-notification-summary-card">
          <div className="founder-notification-summary-icon">
            <Bell size={20} />
          </div>
          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="founder-notification-summary-card">
          <div className="founder-notification-summary-icon unread-icon">
            <Check size={20} />
          </div>
          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="founder-notification-summary-card">
          <div className="founder-notification-summary-icon">
            <Rocket size={20} />
          </div>
          <div>
            <span>Startup Activity</span>
            <strong>
              {
                notifications.filter(
                  (item) =>
                    item.type === "opportunity" ||
                    item.type === "profile"
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="founder-notifications-section">
        <div className="founder-notifications-toolbar">
          <div>
            <h3>Recent Activity</h3>
            <p>Review updates from your StartupSync workspace.</p>
          </div>

          <div className="founder-notification-filters">
            {notificationTypes.map((type) => (
              <button
                type="button"
                key={type}
                className={
                  activeFilter === type
                    ? "founder-notification-filter-active"
                    : ""
                }
                onClick={() => setActiveFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="founder-notifications-empty">
            <Bell size={34} />
            <h4>Loading notifications...</h4>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="founder-notification-list">
            {filteredNotifications.map((notification) => (
              <article
                className={`founder-notification-item ${
                  notification.unread
                    ? "founder-notification-unread"
                    : ""
                }`}
                key={notification.id}
              >
                <button
                  type="button"
                  className="founder-notification-main"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                >
                  <div className="founder-notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="founder-notification-content">
                    <div className="founder-notification-title-row">
                      <h4>{notification.title}</h4>

                      {notification.unread && (
                        <span className="founder-unread-badge">
                          New
                        </span>
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="founder-notification-meta">
                      <span>
                        {getNotificationLabel(notification.type)}
                      </span>
                      <span>•</span>
                      <span>{notification.time}</span>
                    </div>
                  </div>
                </button>

                <div className="founder-notification-actions">
                  {notification.unread && (
                    <button
                      type="button"
                      title="Mark as read"
                      aria-label="Mark notification as read"
                      disabled={actionId === notification.id}
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                    >
                      <Check size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    title="Delete notification"
                    aria-label="Delete notification"
                    disabled={actionId === notification.id}
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    type="button"
                    title="More options"
                    aria-label="More notification options"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="founder-notifications-empty">
            <Bell size={34} />
            <h4>
              {notifications.length
                ? "No notifications in this category"
                : "No notifications yet"}
            </h4>
            <p>
              {notifications.length
                ? "Choose another category to view notifications."
                : "New updates will appear here when they are generated."}
            </p>
          </div>
        )}
      </section>

      {selectedNotification && (
        <div
          className="founder-notification-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null);
            }
          }}
        >
          <div className="founder-notification-modal">
            <div className="founder-notification-modal-header">
              <div className="founder-notification-modal-icon">
                {getNotificationIcon(selectedNotification.type)}
              </div>

              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                aria-label="Close notification details"
              >
                <X size={18} />
              </button>
            </div>

            <span className="founder-notification-modal-type">
              {getNotificationLabel(selectedNotification.type)}
            </span>

            <h3>{selectedNotification.title}</h3>
            <p>{selectedNotification.message}</p>

            <span className="founder-notification-modal-time">
              {selectedNotification.time}
            </span>

            <div className="founder-notification-modal-actions">
              <button
                type="button"
                onClick={() => handleDelete(selectedNotification.id)}
                disabled={actionId === selectedNotification.id}
              >
                <Trash2 size={16} />
                Delete
              </button>

              {selectedNotification.link && (
                <button
                  type="button"
                  onClick={() => handleOpenLink(selectedNotification)}
                >
                  Open
                </button>
              )}

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

export default FounderNotifications;