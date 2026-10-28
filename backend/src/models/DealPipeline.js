const mongoose = require("mongoose");

const dealPipelineSchema = new mongoose.Schema(
  {
    investorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Either a registered founder profile or a dataset startup ID
    startupIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    startupName: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      default: "Technology",
    },
    isDataset: {
      type: Boolean,
      default: false,
    },
    founderProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Founder",
      default: null,
    },
    stage: {
      type: String,
      enum: [
        "Prospect",
        "Initial Contact",
        "Meeting Scheduled",
        "Due Diligence",
        "Term Sheet",
        "Invested",
        "Passed",
      ],
      default: "Prospect",
    },
    notes: [
      {
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    targetAmount: {
      type: Number,
      default: 0,
    },
    proposedValuation: {
      type: Number,
      default: 0,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    dueDiligenceChecklist: [
      {
        item: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
      },
    ],
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
  },
  {
    timestamps: true,
  }
);

dealPipelineSchema.index({ investorUserId: 1, startupIdentifier: 1 }, { unique: true });

module.exports = mongoose.model("DealPipeline", dealPipelineSchema);
