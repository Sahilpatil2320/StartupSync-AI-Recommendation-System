const express = require("express");
const protect = require("../middleware/authMiddleware");

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
router.post("/:userId", sendMessage);

module.exports = router;