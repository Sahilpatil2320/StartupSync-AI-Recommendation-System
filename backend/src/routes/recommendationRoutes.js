const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    getFounderInvestors
} = require("../controllers/recommendationController");

const router = express.Router();

router.get(
    "/founder/:founderId/investors",
    protect,
    getFounderInvestors
);

module.exports = router;