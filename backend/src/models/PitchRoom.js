const mongoose = require("mongoose");

const pitchRoomSchema = new mongoose.Schema(
  {
    founderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Startup Pitch Deck",
    },
    version: {
      type: String,
      default: "v1.0",
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    documentUrl: {
      type: String,
      default: "",
      trim: true,
    },
    fileName: {
      type: String,
      default: "pitch_deck.pdf",
    },
    fileSizeKB: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Authorized users who have been granted access
    authorizedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date, default: Date.now },
      },
    ],
    // Pending access requests
    accessRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        investorName: { type: String, default: "Investor" },
        requestedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        message: { type: String, default: "" },
      },
    ],
    history: [
      {
        version: String,
        updatedAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PitchRoom", pitchRoomSchema);
