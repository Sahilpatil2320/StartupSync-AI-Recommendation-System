const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMyPitchRoom,
  updatePitchRoom,
  getPitchRoomByFounderId,
  requestAccess,
  handleAccessRequest,
} = require("../controllers/pitchRoomController");

const router = express.Router();

router.use(protect);

router.get("/me", getMyPitchRoom);
router.put("/me", updatePitchRoom);
router.get("/founder/:founderId", getPitchRoomByFounderId);
router.post("/founder/:founderId/request-access", requestAccess);
router.patch("/requests/:requestId", handleAccessRequest);

module.exports = router;
