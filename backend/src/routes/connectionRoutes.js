
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    sendConnectionRequest,
    getMyConnectionRequests,
} = require("../controllers/connectionController");

const router = express.Router();

router.get("/", protect, getMyConnectionRequests);
router.post("/investors/:investorId", protect, sendConnectionRequest);

module.exports = router;
