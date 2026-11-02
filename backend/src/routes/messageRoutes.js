const express = require("express");
const protect = require("../middleware/authMiddleware");
const messageUpload = require("../middleware/messageUpload");

const {
  getConversations,
  getMessages,
  sendMessage,
  searchUsers,
} = require("../controllers/messageController");

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/users", searchUsers);
router.get("/:userId", getMessages);

// Supports both JSON text messages and multipart messages with attachments.
router.post(
  "/:userId",
  messageUpload.array("files", 10),
  sendMessage
);

module.exports = router;