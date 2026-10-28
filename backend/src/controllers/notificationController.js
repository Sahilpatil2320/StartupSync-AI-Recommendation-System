
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const emitUserEvent = (req, userId, event, payload) => {
  try {
    const io = req.app.get("io");

    if (io && userId) {
      io.to(`user:${String(userId)}`).emit(event, payload);
    }
  } catch (error) {
    console.error(`Socket event "${event}" failed:`, error.message);
  }
};

const serializeNotification = (notification) => {
  const item =
    typeof notification.toObject === "function"
      ? notification.toObject()
      : notification;

  return {
    ...item,
    id: String(item._id),
    read: Boolean(item.isRead),
  };
};

const getAuthenticatedUserId = (req) => {
  const userId = req.user?.userId;

  return userId && mongoose.isValidObjectId(String(userId))
    ? String(userId)
    : null;
};

/**
 * GET /api/notifications
 * Return only the authenticated user's notifications.
 */
const getNotifications = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const data = notifications.map(serializeNotification);
    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      success: true,
      count: data.length,
      unreadCount,
      data,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark one notification as read.
 */
const markNotificationRead = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const data = serializeNotification(notification);

    emitUserEvent(req, userId, "notification:updated", {
      notification: data,
      notificationId: data.id,
      unread: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data,
    });
  } catch (error) {
    console.error("Mark notification read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all of the authenticated user's notifications as read.
 */
const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const modifiedCount =
      result.modifiedCount ?? result.nModified ?? 0;

    const payload = {
      userId,
      unreadCount: 0,
      modifiedCount,
      updatedAt: new Date().toISOString(),
    };

    emitUserEvent(req, userId, "notification:read-all", payload);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete only a notification owned by the authenticated user.
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const payload = {
      notificationId: String(notification._id),
      userId,
    };

    emitUserEvent(req, userId, "notification:deleted", payload);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
      data: payload,
    });
  } catch (error) {
    console.error("Delete notification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};