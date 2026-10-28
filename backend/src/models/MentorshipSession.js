const mongoose = require("mongoose");

const mentorshipSessionSchema = new mongoose.Schema(
  {
    mentorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    menteeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    menteeRole: {
      type: String,
      enum: ["founder", "student"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Mentorship Session",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    status: {
      type: String,
      enum: ["Requested", "Confirmed", "Completed", "Cancelled"],
      default: "Requested",
    },
    meetingLink: {
      type: String,
      default: "",
    },
    goals: [
      {
        text: String,
        completed: { type: Boolean, default: false },
      },
    ],
    mentorNotes: {
      type: String,
      default: "",
    },
    actionItems: [
      {
        item: String,
        dueDate: Date,
        completed: { type: Boolean, default: false },
      },
    ],
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MentorshipSession", mentorshipSessionSchema);
