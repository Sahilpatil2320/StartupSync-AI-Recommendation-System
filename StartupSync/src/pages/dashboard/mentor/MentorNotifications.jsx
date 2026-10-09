import {
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  MessageSquare,
  Rocket,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./MentorNotifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "startup",
    title: "New mentorship request",
    description:
      "FinFlow has requested your mentorship for business strategy and early-stage growth.",
    time: "15 minutes ago",
    unread: true,
    icon: Rocket
  },
  {
    id: 2,
    type: "mentorship",
    title: "Mentorship request accepted",
    description:
      "Your mentorship with HealthNest is now active.",
    time: "2 hours ago",
    unread: true,
    icon: Check
  },
  {
    id: 3,
    type: "message",
    title: "New message from AgriNova",
    description:
      "Vikram Patil sent you a message about their investor presentation.",
    time: "5 hours ago",
    unread: true,
    icon: MessageSquare
  },
  {
    id: 4,
    type: "meeting",
    title: "Upcoming mentorship session",
    description:
      "Your next session with HealthNest is scheduled for October 2, 2026.",
    time: "Yesterday",
    unread: false,
    icon: CalendarDays
  },
  {
    id: 5,
    type: "startup",
    title: "New startup match",
    description:
      "ShopSphere matches your mentoring expertise in marketing and business strategy.",
    time: "Yesterday",
    unread: false,
    icon: Rocket
  },
  {
    id: 6,
    type: "mentorship",
    title: "Mentorship completed",
    description:
      "Your mentorship engagement with EduBridge has been marked as completed.",
    time: "Sep 15, 2026",
    unread: false,
    icon: CheckCheck
  },
  {
    id: 7,
    type: "system",
    title: "Welcome to Mentor Workspace",
    description:
      "Your StartupSync mentor profile is ready. Explore startups and mentoring opportunities.",
    time: "Sep 10, 2026",
    unread: false,
    icon: UserRound
  }
];

const filterOptions = [
  {
    id: "all",
    label: "All"
  },
  {
    id: "unread",
    label: "Unread"
  },
  {
    id: "startup",
    label: "Startups"
  },
  {
    id: "mentorship",
    label: "Mentorships"
  },
  {
    id: "message",
    label: "Messages"
  },
  {
    id: "system",
    label: "System"
  }
];

function MentorNotifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const mentorshipCount = notifications.filter(
    (notification) =>
      notification.type === "mentorship"
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeFilter === "all") {
        return true;
      }

      if (activeFilter === "unread") {
        return notification.unread;
      }

      return notification.type === activeFilter;
    });
  }, [notifications, activeFilter]);

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const openNotification = (notification) => {
    setSelectedNotification(notification);

    if (notification.unread) {
      markAsRead(notification.id);
    }
  };

  const getNotificationLabel = (type) => {
    const labels = {
      startup: "Startup",
      mentorship: "Mentorship",
      message: "Message",
      meeting: "Meeting",
      system: "System"
    };

    return labels[type] || "Activity";
  };

  return (
    <div className="mentor-notifications-page">
      {/* Header */}

      <section className="mentor-notifications-header">
        <div>
          <span className="mentor-notifications-badge">
            Activity Center
          </span>

          <h2>Notifications</h2>

          <p>
            Stay updated with mentorship requests,
            startup activity, messages and upcoming sessions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="mentor-mark-all-button"
            onClick={markAllAsRead}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </section>

      {/* Summary */}

      <section className="mentor-notification-summary">
        <div className="mentor-notification-summary-card">
          <div className="mentor-summary-icon">
            <Bell size={19} />
          </div>

          <div>
            <strong>{notifications.length}</strong>
            <span>Total Notifications</span>
          </div>
        </div>

        <div className="mentor-notification-summary-card">
          <div className="mentor-summary-icon unread">
            <Bell size={19} />
          </div>

          <div>
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>
        </div>

        <div className="mentor-notification-summary-card">
          <div className="mentor-summary-icon mentorship">
            <UserRound size={19} />
          </div>

          <div>
            <strong>{mentorshipCount}</strong>
            <span>Mentorship Activity</span>
          </div>
        </div>
      </section>

      {/* Filters */}

      <section className="mentor-notification-filters">
        {filterOptions.map((filter) => {
          const count =
            filter.id === "all"
              ? notifications.length
              : filter.id === "unread"
                ? unreadCount
                : notifications.filter(
                    (notification) =>
                      notification.type === filter.id
                  ).length;

          return (
            <button
              type="button"
              key={filter.id}
              className={
                activeFilter === filter.id
                  ? "mentor-notification-filter active"
                  : "mentor-notification-filter"
              }
              onClick={() =>
                setActiveFilter(filter.id)
              }
            >
              {filter.label}
              <span>{count}</span>
            </button>
          );
        })}
      </section>

      {/* Notification list */}

      {filteredNotifications.length > 0 ? (
        <section className="mentor-notification-list">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;

            return (
              <article
                key={notification.id}
                className={`mentor-notification-item ${
                  notification.unread
                    ? "unread"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="mentor-notification-content"
                  onClick={() =>
                    openNotification(notification)
                  }
                >
                  <div
                    className={`mentor-notification-icon notification-${notification.type}`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="mentor-notification-text">
                    <div className="mentor-notification-title-row">
                      <h3>{notification.title}</h3>

                      {notification.unread && (
                        <span className="mentor-unread-dot" />
                      )}
                    </div>

                    <p>{notification.description}</p>

                    <div className="mentor-notification-meta">
                      <span>
                        {getNotificationLabel(
                          notification.type
                        )}
                      </span>

                      <span>•</span>

                      <span>
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="mentor-notification-actions">
                  {notification.unread && (
                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                      aria-label="Mark as read"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      deleteNotification(
                        notification.id
                      )
                    }
                    aria-label="Delete notification"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="mentor-notifications-empty">
          <div className="mentor-notifications-empty-icon">
            <Bell size={28} />
          </div>

          <h3>No notifications</h3>

          <p>
            There are no notifications in this category.
          </p>

          {activeFilter !== "all" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveFilter("all")}
            >
              View All Notifications
            </button>
          )}
        </section>
      )}

      {/* Notification details */}

      {selectedNotification && (
        <div
          className="mentor-notification-modal-overlay"
          onClick={() =>
            setSelectedNotification(null)
          }
        >
          <div
            className="mentor-notification-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mentor-notification-modal-header">
              <div>
                <span>Notification Details</span>
                <h3>
                  {selectedNotification.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mentor-notification-modal-body">
              <div
                className={`mentor-notification-modal-icon notification-${selectedNotification.type}`}
              >
                {(() => {
                  const Icon =
                    selectedNotification.icon;

                  return <Icon size={24} />;
                })()}
              </div>

              <span className="mentor-modal-category">
                {getNotificationLabel(
                  selectedNotification.type
                )}
              </span>

              <p>
                {selectedNotification.description}
              </p>

              <small>
                {selectedNotification.time}
              </small>
            </div>

            <div className="mentor-notification-modal-footer">
              <button
                type="button"
                onClick={() =>
                  deleteNotification(
                    selectedNotification.id
                  )
                }
              >
                <Trash2 size={16} />
                Delete
              </button>

              <button
                type="button"
                className="mentor-modal-close-button"
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

export default MentorNotifications;