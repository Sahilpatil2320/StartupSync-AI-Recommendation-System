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

router.use(protect);

router.get("/", getOpportunities);
router.get("/my-activity", getMyOpportunityActivity);
router.post("/", createOpportunity);
router.post("/:id/save", toggleSaveOpportunity);
router.post("/:id/register", registerForOpportunity);

module.exports = router;