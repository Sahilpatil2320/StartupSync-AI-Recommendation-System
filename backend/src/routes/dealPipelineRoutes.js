const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getPipeline,
  addToPipeline,
  updateDeal,
  removeDeal,
} = require("../controllers/dealPipelineController");

const router = express.Router();

router.use(protect);

router.get("/", getPipeline);
router.post("/", addToPipeline);
router.patch("/:id", updateDeal);
router.delete("/:id", removeDeal);

module.exports = router;
