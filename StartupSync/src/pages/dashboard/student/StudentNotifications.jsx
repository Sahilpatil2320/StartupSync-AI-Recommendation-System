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
  Handshake,
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

import "./StudentNotifications.css";

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
  { id: "profile", label: "Profile" },
  { id: "system", label: "System" },
];

function formatTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (
    date.toDateString() ===
    new Date(Date.now() - 86400000).toDateString()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const normalizeNotification = (item) => ({
  ...item,
  id: String(item._id || item.id),
  read: Boolean(item.isRead ?? item.read),
  message: item.message || item.description || "",
  time: formatTime(item.createdAt || item.updatedAt),
});

function StudentNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;

    if (activeFilter === "unread") {
      return notifications.filter((item) => !item.read);
    }

    return notifications.filter(
      (item) => item.type === activeFilter
    );
  }, [notifications, activeFilter]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications");
      const rows = response.data?.data || [];

      setNotifications(rows.map(normalizeNotification));

      setSelectedNotification((current) =>
        current
          ? rows
              .map(normalizeNotification)
              .find((item) => item.id === current.id) || null
          : null
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time notification updates.
  useEffect(() => {
    const socket = connectSocket();

    if (!socket) return undefined;

    const handleNew = (notification) => {
      if (!notification?._id && !notification?.id) return;

      const newItem = normalizeNotification(notification);

      setNotifications((current) => {
        if (current.some((item) => item.id === newItem.id)) {
          return current;
        }

        return [newItem, ...current];
      });
    };

    const handleUpdated = (notification) => {
      if (!notification?._id && !notification?.id) {
        loadNotifications();
        return;
      }

      const updated = normalizeNotification(notification);

      setNotifications((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
    };

    const handleReadAll = () => {
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );

      setSelectedNotification((current) =>
        current ? { ...current, read: true } : null
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
        current.filter((item) => item.id !== id)
      );

      setSelectedNotification((current) =>
        current?.id === id ? null : current
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
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    const item = notifications.find(
      (notification) => notification.id === id
    );

    if (!item || item.read || busy) return;

    setBusy(true);
    setError("");

    try {
      await api.patch(
        `/notifications/${encodeURIComponent(id)}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true, isRead: true }
            : notification
        )
      );

      setSelectedNotification((current) =>
        current?.id === id
          ? { ...current, read: true, isRead: true }
          : current
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update notification."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount || busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          read: true,
          isRead: true,
        }))
      );

      setSelectedNotification((current) =>
        current
          ? { ...current, read: true, isRead: true }
          : null
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

  // The existing backend has individual DELETE endpoints.
  // Clear All uses those endpoints rather than assuming a new API exists.
  const handleClearAll = async () => {
    if (!notifications.length || busy) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications?"
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await Promise.all(
        notifications.map((item) =>
          api.delete(
            `/notifications/${encodeURIComponent(item.id)}`
          )
        )
      );

      setNotifications([]);
      setSelectedNotification(null);
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

  const handleDelete = async (id) => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await api.delete(
        `/notifications/${encodeURIComponent(id)}`
      );

      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      );

      setSelectedNotification((current) =>
        current?.id === id ? null : current
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      await handleMarkRead(notification.id);
    }

    const type = String(notification.type || "").toLowerCase();

    // Message notification: open the messages page.
    if (type === "message") {
      const senderId =
        notification.sender?._id ||
        notification.sender?.id ||
        notification.senderId ||
        notification.relatedUser?._id ||
        notification.relatedUserId ||
        notification.metadata?.senderId ||
        "";

      navigate("/dashboard/student/messages", {
        state: {
          openUserId: senderId ? String(senderId) : "",
          notificationId: notification.id,
        },
      });

      return;
    }

    // Connection/profile notification: open the notifications page.
    if (
      type === "profile" ||
      type === "application" ||
      type === "interview" ||
      type === "opportunity" ||
      type === "system"
    ) {
      setSelectedNotification(notification);
    }

    // Use an explicitly supplied link for other supported cases.
    if (
      notification.link &&
      type !== "message" &&
      type !== "profile"
    ) {
      navigate(notification.link);
    }
  };

  const getIcon = (type) => {
    if (type === "connection") return Handshake;

    return iconMap[type] || Bell;
  };

  return (
    <section className="student-notifications-page">
      {/* Header */}

      <div className="student-notifications-header">
        <div>
          <span className="student-notifications-badge">
            Activity Center
          </span>

          <h2>Notifications</h2>

          <p>
            Stay updated with your applications, interviews,
            messages and new opportunities.
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
          className={`student-notification-feedback ${
            error ? "error" : ""
          }`}
        >
          {error ? (
            <AlertCircle size={16} />
          ) : (
            <Check size={16} />
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
            <X size={15} />
          </button>
        </div>
      )}

      {/* Action buttons */}

      <div className="student-notifications-actions-bar">
        <button
          type="button"
          className="student-mark-all-button"
          onClick={handleMarkAllRead}
          disabled={!unreadCount || busy}
        >
          <CheckCheck size={16} />
          Mark all as read
        </button>

        <button
          type="button"
          className="student-clear-all-button"
          onClick={handleClearAll}
          disabled={!notifications.length || busy}
        >
          <Trash2 size={16} />
          Clear All
        </button>

        <button
          type="button"
          className="student-mark-all-button"
          onClick={loadNotifications}
          disabled={loading || busy}
        >
          <RefreshCw
            size={16}
            className={loading ? "student-refresh-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Classification filters */}

      <div className="student-notifications-toolbar">
        <div className="student-notification-filters">
          {filterOptions.map((filter) => {
            const count =
              filter.id === "all"
                ? notifications.length
                : filter.id === "unread"
                  ? unreadCount
                  : notifications.filter(
                      (item) => item.type === filter.id
                    ).length;

            return (
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
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent notifications */}

      <div className="student-notifications-result-heading">
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
        <div className="student-notifications-empty">
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="student-notifications-list">
          {filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);

            return (
              <article
                key={notification.id}
                className={`student-notification-card ${
                  !notification.read
                    ? "student-notification-unread"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="student-notification-main"
                  onClick={() =>
                    handleOpenNotification(notification)
                  }
                >
                  <div
                    className={`student-notification-icon student-notification-icon-${notification.type}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="student-notification-content">
                    <div className="student-notification-title-row">
                      <h4>{notification.title}</h4>

                      {!notification.read && (
                        <span className="student-notification-new">
                          New
                        </span>
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="student-notification-meta">
                      <span>
                        {notification.type?.charAt(0).toUpperCase() +
                          notification.type?.slice(1)}
                      </span>

                      <span>•</span>

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
                      onClick={() =>
                        handleMarkRead(notification.id)
                      }
                    >
                      <Check size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Delete notification"
                    title="Delete notification"
                    disabled={busy}
                    onClick={() =>
                      handleDelete(notification.id)
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="student-notifications-empty">
          <div className="student-notifications-empty-icon">
            <Bell size={24} />
          </div>

          <h3>
            {notifications.length
              ? "No notifications found"
              : "No notifications yet"}
          </h3>

          <p>
            {notifications.length
              ? "There are no notifications in this category right now."
              : "Notifications will appear here when the backend creates them."}
          </p>

          {activeFilter !== "all" && (
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
            >
              View all notifications
            </button>
          )}
        </div>
      )}

      {/* Notification detail */}

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
                    const Icon = getIcon(selectedNotification.type);
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
                <strong>
                  {selectedNotification.read ? "Read" : "Unread"}
                </strong>
              </div>

              <div className="student-notification-detail-row">
                <span>Category</span>
                <strong>
                  {selectedNotification.type}
                </strong>
              </div>

              {selectedNotification.link && (
                <button
                  type="button"
                  className="student-notification-open-link"
                  onClick={() => {
                    setSelectedNotification(null);
                    navigate(selectedNotification.link);
                  }}
                >
                  Open related page
                </button>
              )}
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
                  onClick={() =>
                    handleMarkRead(selectedNotification.id)
                  }
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