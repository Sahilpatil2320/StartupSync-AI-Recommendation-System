const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getSessions,
  bookSession,
  updateSessionStatus,
  updateSessionDetails,
} = require("../controllers/mentorshipController");

const router = express.Router();

router.use(protect);

router.get("/sessions", getSessions);
router.post("/sessions", bookSession);
router.patch("/sessions/:id/status", updateSessionStatus);
router.patch("/sessions/:id/details", updateSessionDetails);

module.exports = router;
