
const mongoose = require("mongoose");

const Connection = require("../models/Connection");
const Notification = require("../models/Notification");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Founder = require("../models/Founder");
const User = require("../models/User");

const profileModels = {
  investor: Investor,
  mentor: Mentor,
  student: Student,
  founder: Founder,
};

const allowedTargets = {
  founder: ["investor", "mentor", "student"],
  investor: ["founder", "mentor"],
  mentor: ["founder", "investor", "student"],
  student: ["founder", "mentor"],
};

const getAuthenticatedUserId = (req) =>
  String(req.user?.userId || req.user?.id || req.user?._id || "");

const getAuthenticatedRole = (req) =>
  String(req.user?.role || "").toLowerCase();

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

/**
 * POST /api/connections/:targetRole/:targetId
 * Creates a pending connection and notifies the recipient.
 */
const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = getAuthenticatedUserId(req);
    const senderRole = getAuthenticatedRole(req);
    const { targetRole, targetId } = req.params;

    if (!senderId || !mongoose.isValidObjectId(senderId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!profileModels[targetRole]) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection target role.",
      });
    }

    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target profile ID.",
      });
    }

    if (!allowedTargets[senderRole]?.includes(targetRole)) {
      return res.status(403).json({
        success: false,
        message: "Your role cannot send a request to this profile type.",
      });
    }

    const sender = await User.findById(senderId).select(
      "name role accountStatus"
    );

    if (
      !sender ||
      String(sender.role).toLowerCase() !== senderRole ||
      sender.accountStatus !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is not active or cannot send requests.",
      });
    }

    const TargetProfile = profileModels[targetRole];
    const targetProfile = await TargetProfile.findById(targetId);

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: `${targetRole} profile not found.`,
      });
    }

    const receiverId = String(targetProfile.userId || "");

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(404).json({
        success: false,
        message: "This profile is not linked to a registered account.",
      });
    }

    if (receiverId === senderId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself.",
      });
    }

    const receiver = await User.findOne({
      _id: receiverId,
      role: targetRole,
      accountStatus: "active",
    }).select("_id name role accountStatus");

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "The target account is unavailable or inactive.",
      });
    }

    const existing = await Connection.findOne({
      sender: senderId,
      receiver: receiver._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A connection request already exists.",
        request: existing,
      });
    }

    let request;

    try {
      request = await Connection.create({
        sender: senderId,
        receiver: receiver._id,
        status: "pending",
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A connection request already exists.",
        });
      }

      throw error;
    }

    let notification = null;

    try {
      notification = await Notification.create({
        user: receiver._id,
        type: "profile",
        title: "New connection request",
        message: `${sender.name || "A user"} (${senderRole}) sent you a connection request.`,
        link: `/dashboard/${targetRole}/notifications`,
      });

      const notificationData = serializeNotification(notification);

      // Notify the recipient immediately through their private room.
      emitUserEvent(req, receiver._id, "notification:created", {
        notification: notificationData,
        unread: true,
      });

      // Notify the sender's other active sessions that the request was sent.
      emitUserEvent(req, senderId, "connection:created", {
        requestId: String(request._id),
        receiverId: String(receiver._id),
        status: request.status,
      });
    } catch (notificationError) {
      // Keep the connection request if notification creation fails.
      console.error(
        "Failed to create or emit connection notification:",
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: notification
        ? "Connection request sent successfully."
        : "Connection request sent, but notification creation failed.",
      request,
      notificationCreated: Boolean(notification),
    });
  } catch (error) {
    console.error("Send connection request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send connection request.",
    });
  }
};

/**
 * GET /api/connections
 * Returns requests sent or received by the authenticated user.
 */
const getMyConnectionRequests = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const requests = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get connection requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch connection requests.",
    });
  }
};

/**
 * DELETE /api/connections/:requestId
 * Cancels a pending request only when the authenticated user sent it.
 */
const cancelConnectionRequest = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { requestId } = req.params;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection request ID.",
      });
    }

    const request = await Connection.findOne({
      _id: requestId,
      sender: userId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Pending request not found. It may already be accepted, rejected, or cancelled.",
      });
    }

    await request.deleteOne();

    const payload = {
      requestId: String(request._id),
      senderId: String(request.sender),
      receiverId: String(request.receiver),
    };

    emitUserEvent(req, request.receiver, "connection:cancelled", payload);
    emitUserEvent(req, userId, "connection:cancelled", payload);

    return res.status(200).json({
      success: true,
      message: "Connection request cancelled successfully.",
      requestId: String(request._id),
    });
  } catch (error) {
    console.error("Cancel connection request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel connection request.",
    });
  }
};

module.exports = {
  sendConnectionRequest,
  getMyConnectionRequests,
  cancelConnectionRequest,
};