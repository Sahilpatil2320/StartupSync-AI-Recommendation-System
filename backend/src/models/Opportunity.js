const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Hackathon",
        "Workshop",
        "Competition",
        "Event",
        "Program",
        "Scholarship",
        "Internship",
        "Job",
        "Other",
      ],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Hybrid", "On-site"],
      default: "Online",
    },
    location: {
      type: String,
      default: "Online",
      trim: true,
    },
    date: {
      type: Date,
    },
    duration: {
      type: String,
      default: "",
    },
    participants: {
      type: String,
      default: "Not specified",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    registrationUrl: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["founder", "investor", "mentor"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);