const PitchRoom = require("../models/PitchRoom");
const User = require("../models/User");
const Founder = require("../models/Founder");

// Get logged-in founder's pitch room
const getMyPitchRoom = async (req, res) => {
  try {
    if (req.user.role !== "founder") {
      return res.status(403).json({ success: false, message: "Only founders can manage their pitch room" });
    }

    let room = await PitchRoom.findOne({ founderUserId: req.user.userId })
      .populate({
        path: "authorizedUsers.userId",
        select: "name email role",
      })
      .populate({
        path: "accessRequests.userId",
        select: "name email role",
      });

    if (!room) {
      // Find founder startup name
      const founder = await Founder.findOne({ userId: req.user.userId });
      room = await PitchRoom.create({
        founderUserId: req.user.userId,
        title: founder?.startupName ? `${founder.startupName} Official Pitch Deck` : "Startup Pitch Deck",
        version: "v1.0",
        summary: founder?.description || "Executive summary and business model overview.",
        fileName: `${founder?.startupName || "Startup"}_Pitch_Deck_v1.0.pdf`,
        fileSizeKB: 2450,
        isPublic: false,
      });
    }

    return res.status(200).json({ success: true, pitchRoom: room });
  } catch (error) {
    console.error("Get my pitch room error:", error.message);
    return res.status(500).json({ success: false, message: "Server error fetching pitch room" });
  }
};

// Update pitch room info / upload new version
const updatePitchRoom = async (req, res) => {
  try {
    if (req.user.role !== "founder") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { title, version, summary, documentUrl, fileName, fileSizeKB, isPublic, notes } = req.body;

    let room = await PitchRoom.findOne({ founderUserId: req.user.userId });
    if (!room) {
      return res.status(404).json({ success: false, message: "Pitch room not found" });
    }

    if (title) room.title = title;
    if (summary !== undefined) room.summary = summary;
    if (documentUrl) room.documentUrl = documentUrl;
    if (fileName) room.fileName = fileName;
    if (fileSizeKB) room.fileSizeKB = Number(fileSizeKB);
    if (isPublic !== undefined) room.isPublic = Boolean(isPublic);

    if (version && version !== room.version) {
      room.history.push({
        version: room.version,
        updatedAt: new Date(),
        notes: notes || `Updated to ${version}`,
      });
      room.version = version;
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Pitch room updated successfully",
      pitchRoom: room,
    });
  } catch (error) {
    console.error("Update pitch room error:", error.message);
    return res.status(500).json({ success: false, message: "Server error updating pitch room" });
  }
};

// Investor views pitch room (checks authorization)
const getPitchRoomByFounderId = async (req, res) => {
  try {
    const { founderId } = req.params;
    let founderUser = await User.findById(founderId);
    let founderUserId = founderUser ? founderUser._id : null;

    if (!founderUserId) {
      const founderProfile = await Founder.findById(founderId);
      if (founderProfile) founderUserId = founderProfile.userId;
    }

    if (!founderUserId) {
      return res.status(404).json({ success: false, message: "Founder not found" });
    }

    const room = await PitchRoom.findOne({ founderUserId })
      .populate({ path: "founderUserId", select: "name email" })
      .lean();

    if (!room) {
      return res.status(404).json({ success: false, message: "No pitch room has been published for this startup" });
    }

    const userIdStr = String(req.user.userId);
    const isOwner = String(room.founderUserId._id || room.founderUserId) === userIdStr;
    const isAuthorized = room.authorizedUsers?.some((u) => String(u.userId) === userIdStr);
    const pendingRequest = room.accessRequests?.find((r) => String(r.userId) === userIdStr && r.status === "pending");

    if (room.isPublic || isOwner || isAuthorized) {
      return res.status(200).json({
        success: true,
        hasAccess: true,
        pitchRoom: room,
      });
    }

    // Obfuscate private deck URL for unauthorized users
    return res.status(200).json({
      success: true,
      hasAccess: false,
      isPendingRequest: Boolean(pendingRequest),
      pitchRoom: {
        title: room.title,
        version: room.version,
        summary: room.summary,
        fileName: room.fileName,
        fileSizeKB: room.fileSizeKB,
        updatedAt: room.updatedAt,
      },
      message: pendingRequest
        ? "Access request is pending founder review."
        : "Pitch deck access requires founder approval.",
    });
  } catch (error) {
    console.error("Get pitch room by founder error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to access pitch room" });
  }
};

// Investor requests access to a startup's pitch room
const requestAccess = async (req, res) => {
  try {
    const { founderId } = req.params;
    const { message } = req.body;

    let founderUser = await User.findById(founderId);
    let founderUserId = founderUser ? founderUser._id : null;
    if (!founderUserId) {
      const founderProfile = await Founder.findById(founderId);
      if (founderProfile) founderUserId = founderProfile.userId;
    }

    if (!founderUserId) {
      return res.status(404).json({ success: false, message: "Founder not found" });
    }

    const room = await PitchRoom.findOne({ founderUserId });
    if (!room) {
      return res.status(404).json({ success: false, message: "Pitch room not found for this startup" });
    }

    const userIdStr = String(req.user.userId);
    const existingReq = room.accessRequests.find((r) => String(r.userId) === userIdStr);

    const investorUser = await User.findById(req.user.userId).select("name");

    if (existingReq) {
      if (existingReq.status === "pending") {
        return res.status(409).json({ success: false, message: "Access request is already pending." });
      }
      existingReq.status = "pending";
      existingReq.requestedAt = new Date();
      existingReq.message = message || "";
    } else {
      room.accessRequests.push({
        userId: req.user.userId,
        investorName: investorUser?.name || "Investor",
        requestedAt: new Date(),
        status: "pending",
        message: message || "Interested in reviewing your investment materials.",
      });
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Access request submitted to founder",
    });
  } catch (error) {
    console.error("Request access error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to request pitch room access" });
  }
};

// Founder approves or rejects access request
const handleAccessRequest = async (req, res) => {
  try {
    if (req.user.role !== "founder") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { requestId } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }

    const room = await PitchRoom.findOne({ founderUserId: req.user.userId });
    if (!room) {
      return res.status(404).json({ success: false, message: "Pitch room not found" });
    }

    const requestItem = room.accessRequests.id(requestId);
    if (!requestItem) {
      return res.status(404).json({ success: false, message: "Access request not found" });
    }

    requestItem.status = status;

    if (status === "approved") {
      const alreadyAuth = room.authorizedUsers.some((u) => String(u.userId) === String(requestItem.userId));
      if (!alreadyAuth) {
        room.authorizedUsers.push({
          userId: requestItem.userId,
          approvedAt: new Date(),
        });
      }
    } else {
      room.authorizedUsers = room.authorizedUsers.filter((u) => String(u.userId) !== String(requestItem.userId));
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: `Access request ${status} successfully`,
      pitchRoom: room,
    });
  } catch (error) {
    console.error("Handle access request error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to process access request" });
  }
};

module.exports = {
  getMyPitchRoom,
  updatePitchRoom,
  getPitchRoomByFounderId,
  requestAccess,
  handleAccessRequest,
};
