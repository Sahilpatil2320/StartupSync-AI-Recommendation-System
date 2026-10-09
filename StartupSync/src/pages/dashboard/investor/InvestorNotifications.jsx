import {
  Bell,
  Check,
  CheckCheck,
  CircleDollarSign,
  MessageSquare,
  Rocket,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./InvestorNotifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "startup",
    title: "New startup match found",
    message:
      "FinFlow matches your investment preferences with a 94% profile match.",
    time: "10 minutes ago",
    read: false,
    details:
      "FinFlow is an early-stage FinTech startup based in Pune. The startup is currently raising ₹75 Lakhs at the Seed stage."
  },
  {
    id: 2,
    type: "investment",
    title: "Investment update",
    message:
      "AgriNova has reached its latest product development milestone.",
    time: "2 hours ago",
    read: false,
    details:
      "AgriNova has completed its latest product development milestone and has started preparing for its next phase of market expansion."
  },
  {
    id: 3,
    type: "message",
    title: "New message from FinFlow",
    message:
      "The founder shared an updated pitch deck with you.",
    time: "3 hours ago",
    read: false,
    details:
      "FinFlow's founder has shared an updated pitch deck and is available for a discussion about the company's current progress."
  },
  {
    id: 4,
    type: "mentor",
    title: "Mentor connection accepted",
    message:
      "Ananya Sharma accepted your networking request.",
    time: "Yesterday",
    read: true,
    details:
      "Ananya Sharma has accepted your networking request. You can now communicate with her through StartupSync Messages."
  },
  {
    id: 5,
    type: "startup",
    title: "HealthNest updated its profile",
    message:
      "HealthNest has updated its funding requirements and startup information.",
    time: "Yesterday",
    read: true,
    details:
      "HealthNest has updated its startup profile. Review the latest information before continuing your investment evaluation."
  },
  {
    id: 6,
    type: "investment",
    title: "Portfolio update",
    message:
      "Your FinFlow investment portfolio value has been updated.",
    time: "2 days ago",
    read: true,
    details:
      "The current demonstration portfolio value for your FinFlow investment has been updated in the StartupSync investor dashboard."
  },
  {
    id: 7,
    type: "system",
    title: "Welcome to Investor Workspace",
    message:
      "Your investor profile is ready. Start discovering startups.",
    time: "4 days ago",
    read: true,
    details:
      "Your StartupSync Investor Workspace is ready. You can discover startups, manage your portfolio, communicate with founders and manage your investment preferences."
  }
];

const notificationFilters = [
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
    id: "investment",
    label: "Investments"
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

function InvestorNotifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeFilter, setActiveFilter] =
    useState("all");

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
      (notification) =>
        notification.type === activeFilter
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

  const markAsRead = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true
      }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications((current) =>
      current.filter(
        (notification) =>
          notification.id !== notificationId
      )
    );

    if (
      selectedNotification?.id ===
      notificationId
    ) {
      setSelectedNotification(null);
    }
  };

  const openNotification = (notification) => {
    setSelectedNotification(notification);
    markAsRead(notification.id);
  };

  return (
    <div className="investor-notifications-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="investor-notifications-header">

        <div>
          <span className="investor-notifications-badge">
            <Bell size={15} />
            Activity Center
          </span>

          <h2>Notifications</h2>

          <p>
            Stay updated with startup activity,
            investment updates and important
            StartupSync events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="investor-mark-all-button"
            onClick={markAllAsRead}
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>
        )}

      </section>

      {/* =========================
          SUMMARY
      ========================= */}

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
                  (notification) =>
                    notification.type === "startup"
                ).length
              }
            </strong>
          </div>
        </div>

      </section>

      {/* =========================
          FILTERS
      ========================= */}

      <section className="investor-notification-panel">

        <div className="investor-notification-filter-row">

          <div className="investor-notification-filters">

            {notificationFilters.map(
              (filter) => (
                <button
                  type="button"
                  key={filter.id}
                  className={
                    activeFilter === filter.id
                      ? "investor-notification-filter-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveFilter(filter.id)
                  }
                >
                  {filter.label}

                  {filter.id === "unread" &&
                    unreadCount > 0 && (
                      <span>
                        {unreadCount}
                      </span>
                    )}
                </button>
              )
            )}

          </div>

        </div>

        {/* =========================
            NOTIFICATION LIST
        ========================= */}

        <div className="investor-notification-list">

          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(
              (notification) => (
                <article
                  key={notification.id}
                  className={`investor-notification-item ${
                    notification.read
                      ? ""
                      : "investor-notification-unread"
                  }`}
                >

                  <div
                    className={`investor-notification-icon investor-notification-icon-${notification.type}`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  <button
                    type="button"
                    className="investor-notification-content"
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                  >

                    <div className="investor-notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="investor-unread-dot" />
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="investor-notification-time">
                      {notification.time}
                    </span>

                  </button>

                  <div className="investor-notification-actions">

                    {!notification.read && (
                      <button
                        type="button"
                        title="Mark as read"
                        aria-label="Mark as read"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
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
                        deleteNotification(
                          notification.id
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </article>
              )
            )
          ) : (
            <div className="investor-notifications-empty">

              <div className="investor-notifications-empty-icon">
                <Bell size={28} />
              </div>

              <h3>No notifications</h3>

              <p>
                There are no notifications in this
                category right now.
              </p>

            </div>
          )}

        </div>

      </section>

      {/* =========================
          NOTIFICATION DETAIL MODAL
      ========================= */}

      {selectedNotification && (
        <div
          className="investor-notification-modal-overlay"
          onClick={() =>
            setSelectedNotification(null)
          }
        >
          <div
            className="investor-notification-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="investor-notification-modal-header">

              <div
                className={`investor-notification-modal-icon investor-notification-icon-${selectedNotification.type}`}
              >
                {getNotificationIcon(
                  selectedNotification.type
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                aria-label="Close notification"
              >
                <X size={19} />
              </button>

            </div>

            <div className="investor-notification-modal-body">

              <span>
                {selectedNotification.time}
              </span>

              <h3>
                {selectedNotification.title}
              </h3>

              <p>
                {selectedNotification.details}
              </p>

            </div>

            <div className="investor-notification-modal-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedNotification(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setSelectedNotification(null)
                }
              >
                Done
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default InvestorNotifications;