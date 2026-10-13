const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getMyApplications,
  withdrawApplication,
} = require("../controllers/applicationController");

const router = express.Router();

router.use(protect);

router.get("/my", getMyApplications);
router.patch("/:id/withdraw", withdrawApplication);

module.exports = router;