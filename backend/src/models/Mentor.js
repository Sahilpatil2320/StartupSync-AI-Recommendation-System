const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Basic Information
        location: {
            type: String,
            required: true,
            trim: true
        },

        // Professional Profile
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

        expertise: {
            type: [String],
            default: []
        },

        skills: {
            type: [String],
            default: []
        },

        experienceYears: {
            type: Number,
            min: 0
        },

        // Interests
        professionalInterests: {
            type: [String],
            default: []
        },

        mentoringInterests: {
            type: [String],
            default: []
        },

        mentoringAreas: {
            type: [String],
            default: []
        },

        // Mentoring Preferences
        preferredStartupStages: {
            type: [String],
            default: []
        },

        preferredDomains: {
            type: [String],
            default: []
        },

        availability: {
            type: String,
            enum: [
                "available",
                "limited",
                "not_available"
            ],
            default: "available"
        },

        // Profile
        bio: {
            type: String,
            trim: true
        },

        // Links
        linkedin: {
            type: String,
            trim: true
        },

        website: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Mentor", mentorSchema);