import {
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  MessageSquare,
  Rocket,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./StudentNotifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "application",
    title: "Application under review",
    message:
      "Your application for Full Stack Developer Intern at FinFlow Technologies is currently under review.",
    time: "10 minutes ago",
    date: "Today",
    read: false,
    icon: Rocket
  },
  {
    id: 2,
    type: "interview",
    title: "Interview scheduled",
    message:
      "Your interview for the Full Stack Developer Internship has been scheduled for tomorrow at 11:00 AM.",
    time: "1 hour ago",
    date: "Today",
    read: false,
    icon: CalendarDays
  },
  {
    id: 3,
    type: "message",
    title: "New message from recruiter",
    message:
      "Rahul Patil from TechNova Solutions sent you a new message.",
    time: "3 hours ago",
    date: "Today",
    read: false,
    icon: MessageSquare
  },
  {
    id: 4,
    type: "opportunity",
    title: "New opportunity matches your profile",
    message:
      "Three new internship opportunities matching your skills have been added to StartupSync.",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
    icon: Rocket
  },
  {
    id: 5,
    type: "profile",
    title: "Complete your profile",
    message:
      "Your profile is 85% complete. Add your portfolio link to improve your profile.",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
    icon: UserRound
  },
  {
    id: 6,
    type: "application",
    title: "Application received",
    message:
      "EduBridge has received your application for the Frontend Developer opportunity.",
    time: "22 Sep",
    date: "22 Sep",
    read: true,
    icon: CheckCheck
  },
  {
    id: 7,
    type: "message",
    title: "New message from talent partner",
    message:
      "Ananya Kulkarni from EduBridge has sent you a message regarding your application.",
    time: "20 Sep",
    date: "20 Sep",
    read: true,
    icon: MessageSquare
  },
  {
    id: 8,
    type: "system",
    title: "Welcome to StartupSync",
    message:
      "Your Student account is ready. Explore internships, opportunities and connections.",
    time: "18 Sep",
    date: "18 Sep",
    read: true,
    icon: Bell
  }
];

const filterOptions = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "application", label: "Applications" },
  { id: "interview", label: "Interviews" },
  { id: "message", label: "Messages" },
  { id: "opportunity", label: "Opportunities" }
];

function StudentNotifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") {
      return notifications;
    }

    if (activeFilter === "unread") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    return notifications.filter(
      (notification) => notification.type === activeFilter
    );
  }, [notifications, activeFilter]);

  const handleMarkRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true
            }
          : notification
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true
      }))
    );
  };

  const handleDelete = (id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
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

      {/* Toolbar */}
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

        <button
          type="button"
          className="student-mark-all-button"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={15} />
          Mark all as read
        </button>
      </div>

      {/* Result Heading */}
      <div className="student-notifications-result-heading">
        <div>
          <h3>
            {activeFilter === "all"
              ? "Recent Notifications"
              : filterOptions.find(
                  (filter) => filter.id === activeFilter
                )?.label}
          </h3>

          <p>
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <div className="student-notifications-list">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;

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
                    <Icon size={18} />
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
                      onClick={() =>
                        handleMarkRead(notification.id)
                      }
                    >
                      <Check size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="Delete notification"
                    title="Delete notification"
                    onClick={() =>
                      handleDelete(notification.id)
                    }
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

          <h3>No notifications found</h3>

          <p>
            There are no notifications in this category right
            now.
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

      {/* Detail Modal */}
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
                    const Icon = selectedNotification.icon;
                    return <Icon size={19} />;
                  })()}
                </div>

                <div>
                  <h3>
                    {selectedNotification.title}
                  </h3>

                  <span>
                    {selectedNotification.time}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="student-notification-close"
                aria-label="Close notification"
                onClick={() =>
                  setSelectedNotification(null)
                }
              >
                <X size={17} />
              </button>
            </div>

            <div className="student-notification-modal-body">
              <p>{selectedNotification.message}</p>

              <div className="student-notification-detail-row">
                <span>Status</span>

                <strong>
                  {selectedNotification.read
                    ? "Read"
                    : "Unread"}
                </strong>
              </div>

              <div className="student-notification-detail-row">
                <span>Category</span>

                <strong>
                  {selectedNotification.type
                    .charAt(0)
                    .toUpperCase() +
                    selectedNotification.type.slice(1)}
                </strong>
              </div>
            </div>

            <div className="student-notification-modal-actions">
              <button
                type="button"
                className="student-notification-close-button"
                onClick={() =>
                  setSelectedNotification(null)
                }
              >
                Close
              </button>

              {!selectedNotification.read && (
                <button
                  type="button"
                  className="student-notification-read-button"
                  onClick={() => {
                    handleMarkRead(
                      selectedNotification.id
                    );

                    setSelectedNotification({
                      ...selectedNotification,
                      read: true
                    });
                  }}
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