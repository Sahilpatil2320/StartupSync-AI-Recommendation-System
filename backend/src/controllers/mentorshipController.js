const MentorshipSession = require("../models/MentorshipSession");
const User = require("../models/User");
const Mentor = require("../models/Mentor");

// Get sessions for current user (either as mentor or mentee)
const getSessions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      $or: [{ mentorUserId: req.user.userId }, { menteeUserId: req.user.userId }],
    };

    if (status && status !== "All") filter.status = status;

    const sessions = await MentorshipSession.find(filter)
      .populate({ path: "mentorUserId", select: "name email profileImage" })
      .populate({ path: "menteeUserId", select: "name email role profileImage" })
      .sort({ scheduledDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get mentorship sessions error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch mentorship sessions" });
  }
};

// Book a session
const bookSession = async (req, res) => {
  try {
    const { mentorUserId, scheduledDate, durationMinutes, title, initialGoals } = req.body;

    if (!mentorUserId || !scheduledDate) {
      return res.status(400).json({ success: false, message: "Mentor and scheduled date are required" });
    }

    if (!["founder", "student"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only founders or students can book mentorship sessions" });
    }

    const mentorUser = await User.findById(mentorUserId);
    if (!mentorUser || mentorUser.role !== "mentor") {
      return res.status(404).json({ success: false, message: "Valid mentor account not found" });
    }

    const goals = Array.isArray(initialGoals)
      ? initialGoals.map((g) => ({ text: String(g), completed: false }))
      : initialGoals ? [{ text: String(initialGoals), completed: false }] : [];

    const session = await MentorshipSession.create({
      mentorUserId,
      menteeUserId: req.user.userId,
      menteeRole: req.user.role,
      title: title || "Startup Strategic Guidance Session",
      scheduledDate: new Date(scheduledDate),
      durationMinutes: Number(durationMinutes) || 45,
      status: "Requested",
      goals,
      meetingLink: `https://meet.jit.si/startupsync-${Date.now().toString(36)}`,
    });

    return res.status(201).json({
      success: true,
      message: "Mentorship session requested successfully",
      session,
    });
  } catch (error) {
    console.error("Book session error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to request mentorship session" });
  }
};

// Update session status (Confirm, Complete, Cancel)
const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingLink } = req.body;

    const validStatuses = ["Confirmed", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const userIdStr = String(req.user.userId);
    const isMentor = String(session.mentorUserId) === userIdStr;
    const isMentee = String(session.menteeUserId) === userIdStr;

    if (!isMentor && !isMentee) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    session.status = status;
    if (meetingLink) session.meetingLink = meetingLink;

    await session.save();

    return res.status(200).json({
      success: true,
      message: `Session marked as ${status}`,
      session,
    });
  } catch (error) {
    console.error("Update session status error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update session" });
  }
};

// Add notes, update goals & action items
const updateSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorNotes, goals, actionItems, feedbackRating } = req.body;

    const session = await MentorshipSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const userIdStr = String(req.user.userId);
    const isMentor = String(session.mentorUserId) === userIdStr;
    const isMentee = String(session.menteeUserId) === userIdStr;

    if (!isMentor && !isMentee) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (mentorNotes !== undefined && isMentor) session.mentorNotes = mentorNotes;
    if (goals !== undefined) session.goals = goals;
    if (actionItems !== undefined) session.actionItems = actionItems;
    if (feedbackRating !== undefined && isMentee) session.feedbackRating = Number(feedbackRating);

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Session details updated",
      session,
    });
  } catch (error) {
    console.error("Update session details error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update session details" });
  }
};

module.exports = {
  getSessions,
  bookSession,
  updateSessionStatus,
  updateSessionDetails,
};
