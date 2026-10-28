const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getEcosystemGraph,
  getStartupFundingReadiness,
} = require("../controllers/ecosystemController");

const router = express.Router();

router.use(protect);

router.get("/graph", getEcosystemGraph);
router.get("/analytics/funding-readiness", getStartupFundingReadiness);

module.exports = router;
