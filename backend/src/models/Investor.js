const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Basic Information
        firmName: {
            type: String,
            required: true,
            trim: true
        },

        investorType: {
            type: String,
            enum: [
                "angel_investor",
                "venture_capital",
                "corporate_investor",
                "private_equity",
                "family_office",
                "individual_investor"
            ]
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        // Investment Preferences
        investmentIndustries: {
            type: [String],
            default: []
        },

        investmentDomains: {
            type: [String],
            default: []
        },

        preferredStartupStages: {
            type: [String],
            default: []
        },

        preferredGeography: {
            type: [String],
            default: []
        },

        // Investment Range
        minimumInvestment: {
            type: Number,
            default: 0
        },

        maximumInvestment: {
            type: Number,
            default: 0
        },

        // Investment History
        previousInvestments: {
            type: [String],
            default: []
        },

        portfolioCompanies: {
            type: [String],
            default: []
        },

        // Investment Strategy
        investmentThesis: {
            type: String,
            trim: true
        },

        investmentTags: {
            type: [String],
            default: []
        },

        investmentFocus: {
            type: String,
            trim: true
        },

        bio: {
            type: String,
            trim: true
        },

        // Links
        website: {
            type: String,
            trim: true
        },

        linkedin: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Investor", investorSchema);