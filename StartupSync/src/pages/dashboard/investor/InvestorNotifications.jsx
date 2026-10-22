
import {
    Bell,
    Check,
    CheckCheck,
    CircleDollarSign,
    MessageSquare,
    Rocket,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./InvestorNotifications.css";

const notificationFilters = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "startup", label: "Startups" },
    { id: "investment", label: "Investments" },
    { id: "message", label: "Messages" },
    { id: "mentor", label: "Mentors" },
    { id: "system", label: "System" },
];

const getNotificationId = (notification) =>
    notification?._id || notification?.id;

const getNotificationType = (notification) => {
    const value = String(
        notification?.type || notification?.category || "system"
    ).toLowerCase();

    if (value.includes("startup") || value.includes("founder")) {
        return "startup";
    }
    if (value.includes("invest")) return "investment";
    if (value.includes("message") || value.includes("chat")) return "message";
    if (value.includes("mentor") || value.includes("connection")) {
        return "mentor";
    }

    return "system";
};

const getNotificationMessage = (notification) =>
    notification?.message ||
    notification?.description ||
    notification?.body ||
    "";

const getNotificationTitle = (notification) =>
    notification?.title ||
    notification?.subject ||
    "Notification";

const getNotificationDate = (notification) => {
    const date = notification?.createdAt || notification?.updatedAt;

    if (!date) return "Recently";

    const timestamp = new Date(date).getTime();
    if (Number.isNaN(timestamp)) return "Recently";

    const difference = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return new Date(date).toLocaleDateString();
};

const normalizeNotification = (notification) => {
    const message = getNotificationMessage(notification);

    return {
        ...notification,
        id: getNotificationId(notification),
        type: getNotificationType(notification),
        title: getNotificationTitle(notification),
        message,
        details: notification?.details || message,
        time: getNotificationDate(notification),
        read: Boolean(
            notification?.read ??
            notification?.isRead ??
            notification?.readAt
        ),
    };
};

const extractNotifications = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.data)) return data.data;

    return [];
};

function InvestorNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/notifications/");
            setNotifications(extractNotifications(response).map(normalizeNotification));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load notifications. Please sign in again or try later."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const filteredNotifications = useMemo(() => {
        if (activeFilter === "all") return notifications;

        if (activeFilter === "unread") {
            return notifications.filter((notification) => !notification.read);
        }

        return notifications.filter(
            (notification) => notification.type === activeFilter
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

    const markAsRead = async (notification) => {
        if (notification.read || !notification.id || actionLoading) return;

        setActionLoading(true);

        try {
            await api.patch(
                `/notifications/${encodeURIComponent(notification.id)}/read`
            );

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id ? { ...item, read: true } : item
                )
            );

            setSelectedNotification((current) =>
                current?.id === notification.id ? { ...current, read: true } : current
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not mark notification as read."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0 || actionLoading) return;

        setActionLoading(true);
        setError("");

        try {
            await api.patch("/notifications/read-all");

            setNotifications((current) =>
                current.map((notification) => ({ ...notification, read: true }))
            );

            setSelectedNotification((current) =>
                current ? { ...current, read: true } : current
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not mark all notifications as read."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const deleteNotification = async (notification) => {
        if (!notification.id || actionLoading) return;

        setActionLoading(true);
        setError("");

        try {
            await api.delete(
                `/notifications/${encodeURIComponent(notification.id)}`
            );

            setNotifications((current) =>
                current.filter((item) => item.id !== notification.id)
            );

            setSelectedNotification((current) =>
                current?.id === notification.id ? null : current
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not delete notification."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openNotification = async (notification) => {
        setSelectedNotification(notification);

        if (!notification.read) {
            await markAsRead(notification);
        }
    };

    return (
        <div className="investor-notifications-page">
            <section className="investor-notifications-header">
                <div>
                    <span className="investor-notifications-badge">
                        <Bell size={15} />
                        Activity Center
                    </span>

                    <h2>Notifications</h2>

                    <p>
                        Stay updated with startup activity, investment updates and
                        important StartupSync events.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        type="button"
                        className="investor-mark-all-button"
                        onClick={markAllAsRead}
                        disabled={actionLoading}
                    >
                        <CheckCheck size={17} />
                        Mark all as read
                    </button>
                )}
            </section>

            {error && (
                <div role="alert" style={{ marginBottom: 16, color: "#dc2626" }}>
                    {error}
                    <button
                        type="button"
                        onClick={loadNotifications}
                        style={{ marginLeft: 10 }}
                    >
                        Retry
                    </button>
                </div>
            )}

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
                                    (notification) => notification.type === "startup"
                                ).length
                            }
                        </strong>
                    </div>
                </div>
            </section>

            <section className="investor-notification-panel">
                <div className="investor-notification-filter-row">
                    <div className="investor-notification-filters">
                        {notificationFilters.map((filter) => (
                            <button
                                type="button"
                                key={filter.id}
                                className={
                                    activeFilter === filter.id
                                        ? "investor-notification-filter-active"
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
                </div>

                <div className="investor-notification-list">
                    {loading ? (
                        <div className="investor-notifications-empty">
                            <div className="investor-notifications-empty-icon">
                                <Bell size={28} />
                            </div>
                            <h3>Loading notifications...</h3>
                            <p>Please wait while we retrieve your notifications.</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <article
                                key={notification.id}
                                className={`investor-notification-item ${notification.read ? "" : "investor-notification-unread"
                                    }`}
                            >
                                <div
                                    className={`investor-notification-icon investor-notification-icon-${notification.type}`}
                                >
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <button
                                    type="button"
                                    className="investor-notification-content"
                                    onClick={() => openNotification(notification)}
                                >
                                    <div className="investor-notification-title-row">
                                        <h3>{notification.title}</h3>
                                        {!notification.read && (
                                            <span className="investor-unread-dot" />
                                        )}
                                    </div>

                                    <p>{notification.message}</p>

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
                                            disabled={actionLoading}
                                            onClick={() => markAsRead(notification)}
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        title="Delete notification"
                                        aria-label="Delete notification"
                                        disabled={actionLoading}
                                        onClick={() => deleteNotification(notification)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="investor-notifications-empty">
                            <div className="investor-notifications-empty-icon">
                                <Bell size={28} />
                            </div>
                            <h3>{notifications.length ? "No notifications" : "You're all caught up"}</h3>
                            <p>
                                {notifications.length
                                    ? "There are no notifications in this category right now."
                                    : "New notifications will appear here when available."}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {selectedNotification && (
                <div
                    className="investor-notification-modal-overlay"
                    onClick={() => setSelectedNotification(null)}
                >
                    <div
                        className="investor-notification-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="investor-notification-modal-header">
                            <div
                                className={`investor-notification-modal-icon investor-notification-icon-${selectedNotification.type}`}
                            >
                                {getNotificationIcon(selectedNotification.type)}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedNotification(null)}
                                aria-label="Close notification"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="investor-notification-modal-body">
                            <span>{selectedNotification.time}</span>
                            <h3>{selectedNotification.title}</h3>
                            <p>{selectedNotification.details || selectedNotification.message}</p>
                        </div>

                        <div className="investor-notification-modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSelectedNotification(null)}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setSelectedNotification(null)}
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