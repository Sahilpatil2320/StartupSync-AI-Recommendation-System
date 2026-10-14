
const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    investorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    founderProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Founder",
      required: true
    },

    investedAmount: {
      type: Number,
      required: true,
      min: 0
    },

    currentValue: {
      type: Number,
      min: 0,
      default: function () {
        return this.investedAmount;
      }
    },

    ownershipPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    investedDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Active", "Monitoring", "Exited"],
      default: "Active"
    },

    nextMilestone: {
      type: String,
      trim: true,
      default: ""
    },

    notes: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

investmentSchema.index({
  investorUserId: 1,
  createdAt: -1
});

module.exports = mongoose.model("Investment", investmentSchema);
