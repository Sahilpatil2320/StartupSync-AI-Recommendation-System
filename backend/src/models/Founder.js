const mongoose = require("mongoose");

const founderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Basic Startup Information
        startupName: {
            type: String,
            required: true,
            trim: true
        },

        industry: {
            type: String,
            required: true,
            trim: true
        },

        domain: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        foundedYear: {
            type: Number
        },

        startupStage: {
            type: String,
            enum: [
                "idea",
                "prototype",
                "mvp",
                "early_stage",
                "growth",
                "scaling"
            ]
        },

        teamSize: {
            type: Number,
            min: 1
        },

        businessModel: {
            type: String,
            trim: true
        },

        // Problem and Solution
        problemStatement: {
            type: String,
            trim: true
        },

        solution: {
            type: String,
            trim: true
        },

        targetMarket: {
            type: String,
            trim: true
        },

        targetCustomers: {
            type: String,
            trim: true
        },

        // Technology
        technologies: {
            type: [String],
            default: []
        },

        programmingLanguages: {
            type: [String],
            default: []
        },

        aiMlUsed: {
            type: Boolean,
            default: false
        },

        // Funding
        fundingStage: {
            type: String,
            enum: [
                "bootstrapped",
                "pre_seed",
                "seed",
                "series_a",
                "series_b",
                "series_c",
                "growth"
            ]
        },

        fundingRaised: {
            type: Number,
            default: 0
        },

        fundingRequired: {
            type: Number,
            default: 0
        },

        // Traction
        revenue: {
            type: Number,
            default: 0
        },

        usersCount: {
            type: Number,
            default: 0
        },

        growthRate: {
            type: Number,
            default: 0
        },

        productStatus: {
            type: String,
            enum: [
                "idea",
                "development",
                "beta",
                "launched",
                "scaling"
            ]
        },

        // Competition
        competitors: {
            type: [String],
            default: []
        },

        competitiveAdvantage: {
            type: String,
            trim: true
        },

        // What the founder is looking for
        lookingFor: {
            type: [String],
            enum: [
                "investors",
                "mentors",
                "students",
                "co_founders"
            ],
            default: []
        },

        // Links
        website: {
            type: String,
            trim: true
        },

        linkedin: {
            type: String,
            trim: true
        },

        github: {
            type: String,
            trim: true
        },

        productDemo: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Founder", founderSchema);