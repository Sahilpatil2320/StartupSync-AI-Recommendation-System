const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

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

    const conversations = new Map();

    for (const message of messages) {
      const senderId = String(message.sender?._id || message.sender);
      const receiverId = String(message.receiver?._id || message.receiver);
      const otherId = senderId === String(userId) ? receiverId : senderId;

      if (otherId === String(userId) || conversations.has(otherId)) continue;

      const otherUser =
        senderId === otherId ? message.sender : message.receiver;

      if (!otherUser || !otherUser._id) continue;

      conversations.set(otherId, {
        user: otherUser,
        lastMessage: {
          _id: message._id,
          text: message.text,
          createdAt: message.createdAt,
          senderId,
        },
        unreadCount: messages.filter(
          (item) =>
            String(item.sender?._id || item.sender) === otherId &&
            String(item.receiver?._id || item.receiver) === String(userId) &&
            !item.readAt
        ).length,
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

    const receiver = await User.findById(receiverId).select("_id name role");

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

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
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

    const users = await User.find({
      _id: { $ne: req.user.userId },
      name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
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