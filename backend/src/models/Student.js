const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Education
        college: {
            type: String,
            required: true,
            trim: true
        },

        branch: {
            type: String,
            required: true,
            trim: true
        },

        graduationYear: {
            type: Number,
            required: true
        },

        gpa: {
            type: Number,
            min: 0,
            max: 10
        },

        // Technical Skills
        technicalSkills: {
            type: [String],
            default: []
        },

        programmingLanguages: {
            type: [String],
            default: []
        },

        frameworks: {
            type: [String],
            default: []
        },

        tools: {
            type: [String],
            default: []
        },

        // Internship
        internshipDone: {
            type: Boolean,
            default: false
        },

        internshipDomain: {
            type: String,
            trim: true
        },

        internshipDescription: {
            type: String,
            trim: true
        },

        // Projects
        projects: {
            type: [String],
            default: []
        },

        // Career Interests
        interestedIndustry: {
            type: [String],
            default: []
        },

        interestedDomain: {
            type: [String],
            default: []
        },

        placementDomain: {
            type: String,
            trim: true
        },

        careerGoal: {
            type: String,
            trim: true
        },

        // Activities
        clubs: {
            type: [String],
            default: []
        },

        certifications: {
            type: [String],
            default: []
        },

        achievements: {
            type: [String],
            default: []
        },

        // Startup Interests
        startupInterests: {
            type: [String],
            enum: [
                "startup_internship",
                "startup_job",
                "mentorship",
                "project_collaboration",
                "entrepreneurship"
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);