
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createFounderProfile,
    createInvestorProfile,
    createMentorProfile,
    createStudentProfile,
    getMyProfile,
    updateMyProfile,
    getAllFounders,
    getAllInvestors,
    getAllMentors,
    getAllStudents,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/founders", protect, getAllFounders);
router.get("/investors", protect, getAllInvestors);
router.get("/mentors", protect, getAllMentors);
router.get("/students", protect, getAllStudents);

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.post("/founder", protect, createFounderProfile);
router.post("/investor", protect, createInvestorProfile);
router.post("/mentor", protect, createMentorProfile);
router.post("/student", protect, createStudentProfile);

module.exports = router;