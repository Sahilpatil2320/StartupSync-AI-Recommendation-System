const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createFounderProfile,
    createInvestorProfile,
    createMentorProfile,
    createStudentProfile,
    getMyProfile
} = require("../controllers/profileController");

const router = express.Router();
router.get("/me", protect, getMyProfile);

router.post("/founder", protect, createFounderProfile);

router.post("/investor", protect, createInvestorProfile);

router.post("/mentor", protect, createMentorProfile);

router.post("/student", protect, createStudentProfile);

module.exports = router;