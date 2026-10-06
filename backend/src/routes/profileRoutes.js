const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createFounderProfile,
    createInvestorProfile,
    createMentorProfile,
    createStudentProfile,
    getMyProfile,
    updateMyProfile
} = require("../controllers/profileController");

const router = express.Router();
router.get("/me", protect, getMyProfile);

router.put("/me", protect, updateMyProfile);

router.post("/founder", protect, createFounderProfile);

router.post("/investor", protect, createInvestorProfile);

router.post("/mentor", protect, createMentorProfile);

router.post("/student", protect, createStudentProfile);

module.exports = router;