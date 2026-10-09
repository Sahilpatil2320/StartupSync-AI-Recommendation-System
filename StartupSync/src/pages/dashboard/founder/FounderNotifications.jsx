import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Handshake,
  MoreVertical,
  Rocket,
  Trash2,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./FounderNotifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "investor",
    title: "New investor interest",
    message:
      "Arjun Capital viewed your startup profile and expressed interest in learning more.",
    time: "12 minutes ago",
    unread: true
  },
  {
    id: 2,
    type: "mentor",
    title: "Mentorship request accepted",
    message:
      "Ananya Sharma accepted your mentorship request.",
    time: "1 hour ago",
    unread: true
  },
  {
    id: 3,
    type: "team",
    title: "New team invitation response",
    message:
      "Kunal Shah has accepted your invitation to join the team.",
    time: "3 hours ago",
    unread: true
  },
  {
    id: 4,
    type: "startup",
    title: "Startup profile update",
    message:
      "Your startup profile is now 82% complete. Add remaining information to improve your profile.",
    time: "Yesterday",
    unread: false
  },
  {
    id: 5,
    type: "document",
    title: "Pitch deck uploaded",
    message:
      "Your latest pitch deck has been successfully added to your startup documents.",
    time: "Yesterday",
    unread: false
  },
  {
    id: 6,
    type: "investor",
    title: "New investor match",
    message:
      "StartupSync found a new investor match based on your startup profile.",
    time: "2 days ago",
    unread: false
  },
  {
    id: 7,
    type: "system",
    title: "Welcome to StartupSync",
    message:
      "Your founder workspace is ready. Explore investors, mentors and team opportunities.",
    time: "3 days ago",
    unread: false
  }
];

const notificationTypes = [
  "All",
  "Investor",
  "Mentor",
  "Team",
  "Startup",
  "System"
];

function FounderNotifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeFilter, setActiveFilter] = useState("All");

  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.type.toLowerCase() ===
        activeFilter.toLowerCase()
    );
  }, [notifications, activeFilter]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "investor":
        return <Handshake size={19} />;

      case "mentor":
        return <UserRound size={19} />;

      case "team":
        return <UsersRound size={19} />;

      case "startup":
        return <Rocket size={19} />;

      case "document":
        return <FileText size={19} />;

      default:
        return <Bell size={19} />;
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case "investor":
        return "Investor";

      case "mentor":
        return "Mentor";

      case "team":
        return "Team";

      case "startup":
        return "Startup";

      case "document":
        return "Document";

      default:
        return "System";
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false
      }))
    );
  };

  const handleDelete = (id) => {
    setNotifications((previous) =>
      previous.filter(
        (notification) => notification.id !== id
      )
    );

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);

    if (notification.unread) {
      handleMarkAsRead(notification.id);
    }
  };

  return (
    <div className="founder-notifications-page">
      {/* Header */}
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
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}
      </section>

      {/* Summary */}
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
                  (notification) =>
                    notification.type === "startup"
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      {/* Notification Content */}
      <section className="founder-notifications-section">
        {/* Filters */}
        <div className="founder-notifications-toolbar">
          <div>
            <h3>Recent Activity</h3>
            <p>
              Review updates from your StartupSync workspace.
            </p>
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

        {/* Notifications */}
        {filteredNotifications.length > 0 ? (
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
                    {getNotificationIcon(
                      notification.type
                    )}
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
                        {getNotificationLabel(
                          notification.type
                        )}
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
                    onClick={() =>
                      handleDelete(notification.id)
                    }
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    type="button"
                    title="More options"
                    aria-label="More notification options"
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

            <h4>No notifications</h4>

            <p>
              There are no notifications in this category.
            </p>
          </div>
        )}
      </section>

      {/* Detail Panel */}
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
                {getNotificationIcon(
                  selectedNotification.type
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                aria-label="Close notification details"
              >
                <X size={18} />
              </button>
            </div>

            <span className="founder-notification-modal-type">
              {getNotificationLabel(
                selectedNotification.type
              )}
            </span>

            <h3>{selectedNotification.title}</h3>

            <p>{selectedNotification.message}</p>

            <span className="founder-notification-modal-time">
              {selectedNotification.time}
            </span>

            <div className="founder-notification-modal-actions">
              <button
                type="button"
                onClick={() =>
                  handleDelete(selectedNotification.id)
                }
              >
                <Trash2 size={16} />
                Delete
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setSelectedNotification(null)
                }
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