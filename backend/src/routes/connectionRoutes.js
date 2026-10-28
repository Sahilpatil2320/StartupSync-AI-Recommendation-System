const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    sendConnectionRequest,
    getMyConnectionRequests,
    cancelConnectionRequest,
} = require("../controllers/connectionController");

const router = express.Router();

router.use(protect);

router.get("/", getMyConnectionRequests);

router.post("/investors/:investorId", (req, res, next) => {
    req.params.targetRole = "investor";
    req.params.targetId = req.params.investorId;
    next();
}, sendConnectionRequest);

router.post("/mentors/:mentorId", (req, res, next) => {
    req.params.targetRole = "mentor";
    req.params.targetId = req.params.mentorId;
    next();
}, sendConnectionRequest);

router.post("/students/:studentId", (req, res, next) => {
    req.params.targetRole = "student";
    req.params.targetId = req.params.studentId;
    next();
}, sendConnectionRequest);

router.post("/founders/:founderId", (req, res, next) => {
    req.params.targetRole = "founder";
    req.params.targetId = req.params.founderId;
    next();
}, sendConnectionRequest);

router.delete("/:requestId", cancelConnectionRequest);

module.exports = router;