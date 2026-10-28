const mongoose = require("mongoose");

const recommendationFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ["founder", "investor", "mentor", "student"],
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    targetName: {
      type: String,
      trim: true,
      default: "",
    },
    action: {
      type: String,
      enum: ["save", "shortlist", "dismiss", "like", "dislike"],
      required: true,
    },
    rating: {
      type: Number,
      min: -1,
      max: 5,
      default: null,
    },
    feedbackNotes: {
      type: String,
      trim: true,
      default: "",
    },
    matchScore: {
      type: Number,
      default: null,
    },
    matchExplanation: {
      type: String,
      default: "",
    },
    isDataset: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

recommendationFeedbackSchema.index({ userId: 1, targetRole: 1, targetId: 1, action: 1 });

module.exports = mongoose.model("RecommendationFeedback", recommendationFeedbackSchema);
