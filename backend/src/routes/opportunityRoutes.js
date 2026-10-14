const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getOpportunities,
  createOpportunity,
  toggleSaveOpportunity,
  registerForOpportunity,
  getMyOpportunityActivity,
} = require("../controllers/opportunityController");

const router = express.Router();

// Protect all opportunity routes
router.use(protect);

// Get all opportunities
router.get("/", getOpportunities);

// Get current user's opportunity activity
router.get("/my-activity", getMyOpportunityActivity);

// Create a new opportunity
router.post("/", createOpportunity);

// Save or unsave an opportunity
router.post("/:id/save", toggleSaveOpportunity);

// Register for an opportunity
router.post("/:id/register", registerForOpportunity);

module.exports = router;
