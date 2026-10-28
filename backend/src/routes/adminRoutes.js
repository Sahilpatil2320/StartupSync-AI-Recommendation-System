const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const legacyAdmin = require("../controllers/adminController");
const advancedAdmin = require("../controllers/adminAdvancedController");

const router = express.Router();

// Every endpoint in this router requires a valid JWT and the admin role.
router.use(protect, requireAdmin);

// Existing endpoint retained for backward compatibility with DashboardOverview.
router.get("/dashboard/stats", legacyAdmin.getDashboardStats);

// Database-backed operations used by the enhanced admin workspace.
router.get("/stats", advancedAdmin.getAdminStats);
router.get("/users", advancedAdmin.getAdminUsers);
router.patch("/users/:id/status", advancedAdmin.updateUserStatus);
router.get("/startups", advancedAdmin.getAdminStartups);
router.get("/audit-logs", advancedAdmin.getAuditLogs);
router.get("/ai-monitoring", advancedAdmin.getAiMonitoring);

module.exports = router;
