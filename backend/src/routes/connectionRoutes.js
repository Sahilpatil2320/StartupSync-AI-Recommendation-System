
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    sendConnectionRequest,
    getMyConnectionRequests,
} = require("../controllers/connectionController");

const router = express.Router();

// Get requests sent or received by the logged-in user.
router.get("/", protect, getMyConnectionRequests);

// Existing route preserved for Founder -> Investor.
router.post(
    "/investors/:investorId",
    protect,
    (req, res, next) => {
        req.params.targetRole = "investor";
        req.params.targetId = req.params.investorId;
        next();
    },
    sendConnectionRequest
);

// Founder -> Mentor
router.post(
    "/mentors/:mentorId",
    protect,
    (req, res, next) => {
        req.params.targetRole = "mentor";
        req.params.targetId = req.params.mentorId;
        next();
    },
    sendConnectionRequest
);

// Founder -> Student
router.post(
    "/students/:studentId",
    protect,
    (req, res, next) => {
        req.params.targetRole = "student";
        req.params.targetId = req.params.studentId;
        next();
    },
    sendConnectionRequest
);

// Mentor -> Founder
router.post(
    "/founders/:founderId",
    protect,
    (req, res, next) => {
        req.params.targetRole = "founder";
        req.params.targetId = req.params.founderId;
        next();
    },
    sendConnectionRequest
);

module.exports = router;