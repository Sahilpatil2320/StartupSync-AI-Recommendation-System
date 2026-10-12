const User = require("../models/User");
const Founder = require("../models/Founder");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

const AI_API_URL = "http://127.0.0.1:8000";

const recommendationMap = {
    founder: {
        investors: "founder/investors",
        mentors: "founder/mentors",
        students: "founder/students",
    },
    investor: {
        founders: "investor/founders",
        mentors: "investor/mentors",
    },
    mentor: {
        founders: "mentor/founders",
        investors: "mentor/investors",
        students: "mentor/students",
    },
    student: {
        founders: "student/founders",
        mentors: "student/mentors",
    },
};

const profileModels = {
    founder: Founder,
    investor: Investor,
    mentor: Mentor,
    student: Student,
};

const getRecommendations = async (req, res) => {
    try {
        const { role, sourceId, target } = req.params;

        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "You can only request recommendations for your own role.",
            });
        }

        if (!recommendationMap[role]?.[target]) {
            return res.status(400).json({
                success: false,
                message: "Invalid recommendation direction.",
            });
        }

        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const Model = profileModels[role];
        const profile = await Model.findOne({ userId: user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Please complete your profile before viewing recommendations.",
            });
        }

        if (!profile.aiDatasetId) {
            return res.status(409).json({
                success: false,
                message:
                    "Your profile is not linked to an AI dataset record yet. Configure its AI dataset ID before requesting recommendations.",
            });
        }

        const datasetId = String(profile.aiDatasetId).trim();

        // Do not trust a dataset ID supplied by the URL.
        if (sourceId !== String(user._id) && sourceId !== datasetId) {
            return res.status(400).json({
                success: false,
                message: "The requested recommendation source does not match your profile.",
            });
        }

        const response = await fetch(
            `${AI_API_URL}/recommend/${recommendationMap[role][target]}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    [`${role}_id`]: datasetId,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(502).json({
                success: false,
                message: "AI recommendation service failed.",
                error: data,
            });
        }

        return res.status(200).json({
            success: true,
            source: "StartupSync AI Recommendation Engine",
            data,
        });
    } catch (error) {
        console.error("Recommendation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to connect to AI recommendation service.",
            error: error.message,
        });
    }
};

module.exports = { getRecommendations };