
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMyInvestments,
  createInvestment
} = require("../controllers/investmentController");

const router = express.Router();

router.get("/mine", protect, getMyInvestments);
router.post("/", protect, createInvestment);

module.exports = router;
