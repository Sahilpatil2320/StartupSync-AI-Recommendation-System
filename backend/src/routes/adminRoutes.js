
const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
  getDashboardStats
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/dashboard/stats",
  protect,
  requireAdmin,
  getDashboardStats
);

module.exports = router;