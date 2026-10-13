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

        const hasDatasetId = Boolean(
            String(profile.aiDatasetId || "").trim()
        );

        const datasetId = hasDatasetId
            ? String(profile.aiDatasetId).trim()
            : null;

        // Only accept the authenticated user's ID or their linked dataset ID.
        if (
            sourceId !== String(user._id) &&
            sourceId !== datasetId
        ) {
            return res.status(400).json({
                success: false,
                message: "The requested recommendation source does not match your profile.",
            });
        }


        // Custom recommendation path for founders without a dataset ID.
        if (!hasDatasetId) {
            if (role !== "founder" ||
                !["investors", "mentors"].includes(target)) {
                return res.status(409).json({
                    success: false,
                    message: "This profile is not linked to an AI dataset record.",
                });
            }

            const customProfile = {
                startupName: profile.startupName || "",
                domain: [
                    profile.domain || "",
                    profile.industry || "",
                ].filter(Boolean).join(" "),
                description: profile.description || "",
                fundingStage:
                    profile.fundingStage ||
                    profile.startupStage ||
                    "pre_seed",
            };

            const missingFields = [
                "startupName",
                "domain",
                "description",
            ].filter(
                (field) => !String(customProfile[field] || "").trim()
            );

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please complete the required startup profile fields.",
                    missing: missingFields,
                });
            }

            const endpoint =
                target === "investors"
                    ? "/recommend/custom-founder/investors"
                    : "/recommend/custom-founder/mentors";

            const response = await fetch(`${AI_API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customProfile),
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(502).json({
                    success: false,
                    message: "Custom AI recommendation service failed.",
                    error: data,
                });
            }

            return res.status(200).json({
                success: true,
                source: "StartupSync AI Recommendation Engine",
                data,
            });
        }


        // Existing dataset-based recommendation flow.
        const response = await fetch(
            `${AI_API_URL}/recommend/${recommendationMap[role][target]}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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