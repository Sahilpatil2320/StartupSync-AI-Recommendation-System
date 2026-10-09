import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Rocket,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X
} from "lucide-react";

import "./AdminNotifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "users",
    title: "New user registrations",
    message:
      "18 new users registered on StartupSync during the last 24 hours.",
    time: "15 minutes ago",
    read: false,
    icon: UserRound
  },
  {
    id: 2,
    type: "startups",
    title: "Startup verification pending",
    message:
      "5 startup profiles are waiting for administrator verification.",
    time: "42 minutes ago",
    read: false,
    icon: Rocket
  },
  {
    id: 3,
    type: "reports",
    title: "Monthly report generated",
    message:
      "The September platform activity report is ready for review.",
    time: "2 hours ago",
    read: true,
    icon: FileText
  },
  {
    id: 4,
    type: "system",
    title: "Security settings updated",
    message:
      "Platform security preferences were successfully updated.",
    time: "4 hours ago",
    read: true,
    icon: ShieldCheck
  },
  {
    id: 5,
    type: "users",
    title: "Multiple account requests",
    message:
      "7 new administrator access requests require review.",
    time: "6 hours ago",
    read: false,
    icon: UserRound
  },
  {
    id: 6,
    type: "startups",
    title: "Startup profile updated",
    message:
      "A verified startup has submitted updated company information.",
    time: "Yesterday",
    read: true,
    icon: Rocket
  },
  {
    id: 7,
    type: "reports",
    title: "Platform activity milestone",
    message:
      "StartupSync crossed a new monthly application activity milestone.",
    time: "Yesterday",
    read: true,
    icon: FileText
  },
  {
    id: 8,
    type: "system",
    title: "System maintenance reminder",
    message:
      "Scheduled platform maintenance is planned for the upcoming maintenance window.",
    time: "2 days ago",
    read: true,
    icon: ShieldCheck
  }
];

const filterOptions = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "users", label: "Users" },
  { id: "startups", label: "Startups" },
  { id: "reports", label: "Reports" },
  { id: "system", label: "System" }
];

function AdminNotifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "unread" && !notification.read) ||
        notification.type === activeFilter;

      const searchValue = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        notification.title
          .toLowerCase()
          .includes(searchValue) ||
        notification.message
          .toLowerCase()
          .includes(searchValue);

      return matchesFilter && matchesSearch;
    });
  }, [notifications, activeFilter, searchTerm]);

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    setSelectedNotification((current) =>
      current && current.id === id
        ? { ...current, read: true }
        : current
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

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );

    if (
      selectedNotification &&
      selectedNotification.id === id
    ) {
      setSelectedNotification(null);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      users: "Users",
      startups: "Startups",
      reports: "Reports",
      system: "System"
    };

    return labels[type] || "Notification";
  };

  return (
    <section className="admin-notifications-page">
      {/* Header */}

      <div className="admin-notifications-header">
        <div>
          <span className="admin-notifications-eyebrow">
            Administration
          </span>

          <h1>Notifications</h1>

          <p>
            Review important platform activity, alerts and
            administrative updates.
          </p>
        </div>

        <div className="admin-notifications-header-actions">
          <span className="admin-unread-count">
            {unreadCount} unread
          </span>

          <button
            type="button"
            className="admin-mark-all-button"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Toolbar */}

      <div className="admin-notifications-toolbar">
        <div className="admin-notification-filters">
          {filterOptions.map((filter) => (
            <button
              type="button"
              key={filter.id}
              className={
                activeFilter === filter.id
                  ? "admin-notification-filter active"
                  : "admin-notification-filter"
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

        <div className="admin-notification-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>
      </div>

      {/* Notification list */}

      <div className="admin-notification-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;

            return (
              <article
                key={notification.id}
                className={`admin-notification-card ${
                  !notification.read
                    ? "admin-notification-unread"
                    : ""
                }`}
              >
                <div
                  className={`admin-notification-icon admin-notification-icon-${notification.type}`}
                >
                  <Icon size={19} />
                </div>

                <div className="admin-notification-content">
                  <div className="admin-notification-title-row">
                    <div>
                      <span className="admin-notification-type">
                        {getTypeLabel(notification.type)}
                      </span>

                      <h2>{notification.title}</h2>
                    </div>

                    {!notification.read && (
                      <span className="admin-notification-new">
                        New
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="admin-notification-bottom">
                    <span>{notification.time}</span>

                    <div className="admin-notification-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedNotification(
                            notification
                          )
                        }
                      >
                        View
                      </button>

                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                        >
                          <Check size={14} />
                          Mark read
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-delete-notification"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        aria-label="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="admin-notifications-empty">
            <div>
              <Bell size={24} />
            </div>

            <h3>No notifications found</h3>

            <p>
              Try changing the filter or search term.
            </p>
          </div>
        )}
      </div>

      {/* Details modal */}

      {selectedNotification && (
        <div
          className="admin-notification-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="admin-notification-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-notification-modal-header">
              <div>
                <span>
                  {getTypeLabel(
                    selectedNotification.type
                  )}
                </span>

                <h2>{selectedNotification.title}</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(null)
                }
                aria-label="Close notification"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className={`admin-notification-modal-icon admin-notification-icon-${selectedNotification.type}`}
            >
              {(() => {
                const Icon = selectedNotification.icon;

                return <Icon size={23} />;
              })()}
            </div>

            <p className="admin-notification-modal-message">
              {selectedNotification.message}
            </p>

            <div className="admin-notification-modal-info">
              <div>
                <span>Received</span>
                <strong>
                  {selectedNotification.time}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedNotification.read
                    ? "Read"
                    : "Unread"}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>
                  {getTypeLabel(
                    selectedNotification.type
                  )}
                </strong>
              </div>
            </div>

            <div className="admin-notification-modal-actions">
              {!selectedNotification.read && (
                <button
                  type="button"
                  onClick={() =>
                    markAsRead(selectedNotification.id)
                  }
                >
                  <Check size={16} />
                  Mark as read
                </button>
              )}

              <button
                type="button"
                className="admin-modal-delete"
                onClick={() =>
                  deleteNotification(
                    selectedNotification.id
                  )
                }
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminNotifications;