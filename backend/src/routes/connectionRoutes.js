const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    sendConnectionRequest,
    getMyConnectionRequests,
    cancelConnectionRequest,
} = require("../controllers/connectionController");

const router = express.Router();

// Get requests sent or received by the logged-in user.
router.get("/", protect, getMyConnectionRequests);

// Cancel a pending request sent by the logged-in user.
router.delete("/:requestId", protect, cancelConnectionRequest);

// Founder -> Investor
// Mentor -> Investor also uses this route; the controller checks the role.
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
// Investor -> Mentor also uses this route.
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
// Investor -> Founder and Student -> Founder also use this route.
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
