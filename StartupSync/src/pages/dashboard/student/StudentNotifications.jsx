import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  MessageSquare,
  Rocket,
  Trash2,
  UserRound,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./StudentNotifications.css";

const API_URL = "http://localhost:5000/api/notifications";

const iconMap = {
  application: Rocket,
  interview: CalendarDays,
  message: MessageSquare,
  opportunity: Rocket,
  profile: UserRound,
  system: Bell,
};

const filterOptions = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "application", label: "Applications" },
  { id: "interview", label: "Interviews" },
  { id: "message", label: "Messages" },
  { id: "opportunity", label: "Opportunities" },
];

function formatTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const elapsed = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  if (date.toDateString() === new Date(now.getTime() - 86400000).toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      throw new Error("Please log in again to view your notifications.");
    }

    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, getAuthConfig());

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error("Unexpected notifications API response.");
      }

      const rows = response.data.data.map((item) => ({
        ...item,
        id: String(item._id),
        read: Boolean(item.read ?? item.isRead),
        time: formatTime(item.createdAt),
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
      }));

      setNotifications(rows);

      setSelectedNotification((current) =>
        current ? rows.find((item) => item.id === current.id) || null : null
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") {
      return notifications.filter((item) => !item.read);
    }
    return notifications.filter((item) => item.type === activeFilter);
  }, [notifications, activeFilter]);

  const handleMarkRead = async (id) => {
    const item = notifications.find((notification) => notification.id === id);
    if (!item || item.read || busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await axios.patch(
        `${API_URL}/${encodeURIComponent(id)}/read`,
        {},
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error("The notification could not be marked as read.");
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );

      setSelectedNotification((current) =>
        current?.id === id ? { ...current, read: true } : current
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to update notification."
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
      const response = await axios.patch(
        `${API_URL}/read-all`,
        {},
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error("Notifications could not be updated.");
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );

      setSelectedNotification((current) =>
        current ? { ...current, read: true } : null
      );

      setNotice("All notifications marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to update notifications."
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
      const response = await axios.delete(
        `${API_URL}/${encodeURIComponent(id)}`,
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error("The notification could not be deleted.");
      }

      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );

      setSelectedNotification((current) =>
        current?.id === id ? null : current
      );

      setNotice("Notification deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to delete notification."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOpenNotification = (notification) => {
    setSelectedNotification(notification);

    if (!notification.read) {
      handleMarkRead(notification.id);
    }
  };

  return (
    <section className="student-notifications-page">
      <div className="student-notifications-header">
        <div>
          <span className="student-notifications-badge">Activity Center</span>
          <h2>Notifications</h2>
          <p>
            Stay updated with your applications, interviews, messages and new
            opportunities.
          </p>
        </div>

        <div className="student-notifications-summary">
          <strong>{unreadCount}</strong>
          <span>Unread</span>
        </div>
      </div>

      {(error || notice) && (
        <div
          role="status"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "10px 12px",
            marginBottom: 14,
            borderRadius: 9,
            background: error ? "#fef2f2" : "#eff6ff",
            color: error ? "#b91c1c" : "#1d4ed8",
          }}
        >
          {error ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{error || notice}</span>
        </div>
      )}

      <div className="student-notifications-toolbar">
        <div className="student-notification-filters">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={
                activeFilter === filter.id
                  ? "student-notification-filter-active"
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

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="student-mark-all-button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || busy}
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>

          <button
            type="button"
            className="student-mark-all-button"
            onClick={loadNotifications}
            disabled={loading}
            title="Refresh notifications"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      <div className="student-notifications-result-heading">
        <div>
          <h3>
            {activeFilter === "all"
              ? "Recent Notifications"
              : filterOptions.find((item) => item.id === activeFilter)?.label}
          </h3>
          <p>
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="student-notifications-empty">
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="student-notifications-list">
          {filteredNotifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell;

            return (
              <article
                key={notification.id}
                className={`student-notification-card ${
                  !notification.read ? "student-notification-unread" : ""
                }`}
              >
                <button
                  type="button"
                  className="student-notification-main"
                  onClick={() => handleOpenNotification(notification)}
                >
                  <div
                    className={`student-notification-icon student-notification-icon-${notification.type}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="student-notification-content">
                    <div className="student-notification-title-row">
                      <h4>{notification.title}</h4>
                      {!notification.read && (
                        <span className="student-notification-new">New</span>
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="student-notification-meta">
                      <span>{notification.time}</span>
                      {!notification.read && (
                        <span className="student-notification-unread-label">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="student-notification-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      aria-label="Mark notification as read"
                      title="Mark as read"
                      disabled={busy}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <Check size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Delete notification"
                    title="Delete notification"
                    disabled={busy}
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="student-notifications-empty">
          <div className="student-notifications-empty-icon">
            <Bell size={23} />
          </div>
          <h3>{notifications.length ? "No notifications found" : "No notifications yet"}</h3>
          <p>
            {notifications.length
              ? "There are no notifications in this category right now."
              : "Notifications will appear here when the backend creates them."}
          </p>
          {activeFilter !== "all" && (
            <button type="button" onClick={() => setActiveFilter("all")}>
              View all notifications
            </button>
          )}
        </div>
      )}

      {selectedNotification && (
        <div
          className="student-notification-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="student-notification-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-notification-modal-header">
              <div className="student-notification-modal-title">
                <div
                  className={`student-notification-icon student-notification-icon-${selectedNotification.type}`}
                >
                  {(() => {
                    const Icon = iconMap[selectedNotification.type] || Bell;
                    return <Icon size={19} />;
                  })()}
                </div>

                <div>
                  <h3>{selectedNotification.title}</h3>
                  <span>{selectedNotification.time}</span>
                </div>
              </div>

              <button
                type="button"
                className="student-notification-close"
                aria-label="Close notification"
                onClick={() => setSelectedNotification(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="student-notification-modal-body">
              <p>{selectedNotification.message}</p>

              <div className="student-notification-detail-row">
                <span>Status</span>
                <strong>{selectedNotification.read ? "Read" : "Unread"}</strong>
              </div>

              <div className="student-notification-detail-row">
                <span>Category</span>
                <strong>
                  {selectedNotification.type.charAt(0).toUpperCase() +
                    selectedNotification.type.slice(1)}
                </strong>
              </div>
            </div>

            <div className="student-notification-modal-actions">
              <button
                type="button"
                className="student-notification-close-button"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>

              {!selectedNotification.read && (
                <button
                  type="button"
                  className="student-notification-read-button"
                  disabled={busy}
                  onClick={() => handleMarkRead(selectedNotification.id)}
                >
                  <Check size={15} />
                  Mark as read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentNotifications;