import { useMemo, useState } from "react";
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

import "./IncubatorNotifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "startups",
    title: "New startup joined your cohort",
    message:
      "FinFlow Technologies has completed its onboarding and joined your active incubation cohort.",
    time: "12 minutes ago",
    read: false,
    icon: Rocket
  },
  {
    id: 2,
    type: "mentorships",
    title: "Mentor assignment completed",
    message:
      "Priya Sharma has accepted the mentorship assignment for the product strategy track.",
    time: "1 hour ago",
    read: false,
    icon: UserRound
  },
  {
    id: 3,
    type: "messages",
    title: "New message from a founder",
    message:
      "Aarav Kulkarni sent you a message regarding the next incubation review.",
    time: "2 hours ago",
    read: false,
    icon: MessageSquare
  },
  {
    id: 4,
    type: "events",
    title: "Founder orientation scheduled",
    message:
      "The next founder orientation session is scheduled for Friday at 11:00 AM.",
    time: "Yesterday",
    read: true,
    icon: CalendarDays
  },
  {
    id: 5,
    type: "startups",
    title: "Startup profile updated",
    message:
      "AgriNova Labs has updated its startup profile, funding requirement and team information.",
    time: "Yesterday",
    read: true,
    icon: Rocket
  },
  {
    id: 6,
    type: "messages",
    title: "New message from investor",
    message:
      "Ananya Mehta requested the startup list for your upcoming cohort.",
    time: "2 days ago",
    read: true,
    icon: MessageSquare
  },
  {
    id: 7,
    type: "mentorships",
    title: "Mentor session completed",
    message:
      "Rahul Deshmukh completed a mentoring session with GreenGrid Systems.",
    time: "3 days ago",
    read: true,
    icon: UserRound
  },
  {
    id: 8,
    type: "events",
    title: "Program review reminder",
    message:
      "Your monthly incubation program review is scheduled for next Monday.",
    time: "4 days ago",
    read: true,
    icon: CalendarDays
  },
  {
    id: 9,
    type: "system",
    title: "Incubator profile verified",
    message:
      "Your organization profile has successfully completed the platform verification process.",
    time: "5 days ago",
    read: true,
    icon: CheckCheck
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
    id: "startups",
    label: "Startups"
  },
  {
    id: "mentorships",
    label: "Mentorships"
  },
  {
    id: "messages",
    label: "Messages"
  },
  {
    id: "events",
    label: "Events"
  },
  {
    id: "system",
    label: "System"
  }
];

function IncubatorNotifications() {
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

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    handleMarkRead(notification.id);
  };

  return (
    <section className="incubator-notifications-page">
      <div className="incubator-notifications-header">
        <div>
          <span className="incubator-notifications-eyebrow">
            Activity Center
          </span>

          <h1>Notifications</h1>

          <p>
            Stay updated with your startups, mentors, programs
            and ecosystem activities.
          </p>
        </div>

        <div className="incubator-notification-summary">
          <div className="incubator-notification-summary-icon">
            <Bell size={20} />
          </div>

          <div>
            <strong>{unreadCount}</strong>
            <span>Unread notifications</span>
          </div>
        </div>
      </div>

      <div className="incubator-notifications-card">
        <div className="incubator-notification-toolbar">
          <div className="incubator-notification-filters">
            {notificationFilters.map((filter) => {
              const count =
                filter.id === "unread"
                  ? unreadCount
                  : filter.id === "all"
                    ? notifications.length
                    : notifications.filter(
                        (notification) =>
                          notification.type === filter.id
                      ).length;

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`incubator-notification-filter ${
                    activeFilter === filter.id
                      ? "incubator-notification-filter-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveFilter(filter.id)
                  }
                >
                  {filter.label}

                  <span>{count}</span>
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="incubator-mark-all-button"
              onClick={handleMarkAllRead}
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        <div className="incubator-notification-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;

              return (
                <article
                  key={notification.id}
                  className={`incubator-notification-item ${
                    !notification.read
                      ? "incubator-notification-unread"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="incubator-notification-main"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                  >
                    <div className="incubator-notification-icon">
                      <Icon size={19} />
                    </div>

                    <div className="incubator-notification-content">
                      <div className="incubator-notification-title-row">
                        <h3>{notification.title}</h3>

                        {!notification.read && (
                          <span className="incubator-unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="incubator-notification-time">
                        {notification.time}
                      </span>
                    </div>
                  </button>

                  <div className="incubator-notification-actions">
                    {!notification.read && (
                      <button
                        type="button"
                        title="Mark as read"
                        aria-label="Mark as read"
                        onClick={() =>
                          handleMarkRead(notification.id)
                        }
                      >
                        <Check size={17} />
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
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="incubator-no-notifications">
              <div className="incubator-no-notifications-icon">
                <Bell size={27} />
              </div>

              <h2>No notifications found</h2>

              <p>
                There are no notifications available for this
                filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedNotification && (
        <div
          className="incubator-notification-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="incubator-notification-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="incubator-notification-modal-header">
              <div className="incubator-notification-modal-icon">
                {(() => {
                  const Icon = selectedNotification.icon;
                  return <Icon size={21} />;
                })()}
              </div>

              <button
                type="button"
                className="incubator-notification-modal-close"
                onClick={() =>
                  setSelectedNotification(null)
                }
                aria-label="Close notification"
              >
                <X size={20} />
              </button>
            </div>

            <span className="incubator-modal-category">
              {selectedNotification.type}
            </span>

            <h2>{selectedNotification.title}</h2>

            <p>{selectedNotification.message}</p>

            <div className="incubator-modal-time">
              {selectedNotification.time}
            </div>

            <button
              type="button"
              className="btn btn-primary incubator-modal-button"
              onClick={() =>
                setSelectedNotification(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default IncubatorNotifications;