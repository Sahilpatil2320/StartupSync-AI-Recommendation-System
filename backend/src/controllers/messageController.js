
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");

const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name role")
      .populate("receiver", "name role")
      .lean();

    const unreadCounts = new Map();

    for (const item of messages) {
      const senderId = String(item.sender?._id || item.sender);
      const receiverId = String(item.receiver?._id || item.receiver);

      if (receiverId === String(userId) && senderId !== String(userId) && !item.readAt) {
        unreadCounts.set(senderId, (unreadCounts.get(senderId) || 0) + 1);
      }
    }

    const conversations = new Map();

    for (const message of messages) {
      const senderId = String(message.sender?._id || message.sender);
      const receiverId = String(message.receiver?._id || message.receiver);
      const otherId = senderId === String(userId) ? receiverId : senderId;

      if (otherId === String(userId) || conversations.has(otherId)) continue;

      const otherUser = senderId === otherId ? message.sender : message.receiver;
      if (!otherUser?._id) continue;

      conversations.set(otherId, {
        user: otherUser,
        lastMessage: {
          _id: message._id,
          text: message.text,
          createdAt: message.createdAt,
          senderId,
        },
        unreadCount: unreadCounts.get(otherId) || 0,
      });
    }

    return res.json({
      success: true,
      data: Array.from(conversations.values()),
    });
  } catch (error) {
    console.error("Get conversations error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.userId;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation user ID",
      });
    }

    if (String(currentUserId) === String(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    const otherUser = await User.findById(otherUserId).select("name role");

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${currentUserId}`).emit("messages:read", {
        conversationUserId: String(otherUserId),
      });
    }

    return res.json({
      success: true,
      user: otherUser,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const senderId = req.user.userId;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    if (!text || text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must contain between 1 and 5000 characters",
      });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("_id name role"),
      User.findById(receiverId).select("_id name role"),
    ]);

    if (!sender) {
      return res.status(401).json({
        success: false,
        message: "Sender account not found",
      });
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    const messageData = {
      _id: String(message._id),
      sender: String(senderId),
      receiver: String(receiverId),
      text: message.text,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    let notificationData = null;

    try {
      const notification = await Notification.create({
        user: receiverId,
        type: "message",
        title: `New message from ${sender.name}`,
        message: text.length > 180
          ? `${text.slice(0, 177)}...`
          : text,
        link: "/dashboard/messages",
      });

      notificationData = {
        _id: String(notification._id),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      };
    } catch (notificationError) {
      // The message is already saved; don't report it as failed
      // just because notification creation failed.
      console.error("Create message notification error:", notificationError.message);
    }

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${receiverId}`).emit("message:new", {
        ...messageData,
        sender: {
          _id: String(sender._id),
          name: sender.name,
          role: sender.role,
        },
      });

      io.to(`user:${senderId}`).emit("message:sent", messageData);

      if (notificationData) {
        io.to(`user:${receiverId}`).emit("notification:new", notificationData);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: messageData,
      notification: notificationData,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    if (search.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
      _id: { $ne: req.user.userId },
      name: { $regex: escapedSearch, $options: "i" },
    })
      .select("name role")
      .limit(20)
      .lean();

    return res.json({ success: true, data: users });
  } catch (error) {
    console.error("Search users error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  searchUsers,
};