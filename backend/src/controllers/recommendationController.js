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
        investors: "student/investors",
    },
};

const profileModels = {
    founder: Founder,
    investor: Investor,
    mentor: Mentor,
    student: Student,
};

const profileTokens = (value) => {
    const values = [];
    const visit = (item) => {
        if (typeof item === "string" || typeof item === "number") {
            values.push(String(item));
        } else if (Array.isArray(item)) {
            item.forEach(visit);
        } else if (item && typeof item === "object") {
            Object.entries(item).forEach(([key, nested]) => {
                if (!["_id", "id", "userId", "aiDatasetId", "__v", "createdAt", "updatedAt"].includes(key)) {
                    visit(nested);
                }
            });
        }
    };
    visit(value);
    return new Set(values.join(" ").toLowerCase().match(/[a-z0-9+#.-]{2,}/g) || []);
};

const serializeRecommendationProfile = (role, profile, score) => {
    const user = profile.userId && typeof profile.userId === "object"
        ? profile.userId
        : null;
    const common = {
        id: String(profile._id),
        aiDatasetId: profile.aiDatasetId || "",
        score_percentage: score,
        location: profile.location || "Location not specified",
    };

    if (role === "founder") {
        return {
            ...common,
            name: profile.startupName || user?.name || "Startup",
            startupName: profile.startupName || "",
            industry: profile.industry || "",
            domain: profile.domain || "",
            description: profile.description || "",
            startupStage: profile.startupStage || "",
            fundingStage: profile.fundingStage || "",
            teamSize: profile.teamSize ?? null,
            technologies: profile.technologies || [],
            lookingFor: profile.lookingFor || [],
        };
    }
    if (role === "investor") {
        return {
            ...common,
            name: profile.firmName || user?.name || "Investor",
            firmName: profile.firmName || "",
            type: profile.investorType || "Investor",
            industries: [
                ...(profile.investmentIndustries || []),
                ...(profile.investmentDomains || []),
                ...(profile.investmentTags || []),
            ],
            stages: profile.preferredStartupStages || [],
            bio: profile.bio || "",
            investmentThesis: profile.investmentThesis || "",
        };
    }
    if (role === "mentor") {
        return {
            ...common,
            name: user?.name || "Mentor",
            industry: profile.industry || "",
            domain: profile.domain || "",
            expertise: profile.expertise || [],
            skills: profile.skills || [],
            experienceYears: profile.experienceYears ?? null,
            mentoringAreas: profile.mentoringAreas || [],
            availability: profile.availability || "Not specified",
            bio: profile.bio || "",
        };
    }
    return {
        ...common,
        name: user?.name || "Student",
        college: profile.college || "",
        branch: profile.branch || "",
        graduationYear: profile.graduationYear ?? "",
        technicalSkills: profile.technicalSkills || [],
        interestedIndustry: profile.interestedIndustry || [],
        interestedDomain: profile.interestedDomain || [],
        careerGoal: profile.careerGoal || "",
    };
};

const getRegisteredProfileFallback = async (sourceRole, target, sourceProfile) => {
    const targetRole = target.endsWith("s") ? target.slice(0, -1) : target;
    const TargetModel = profileModels[targetRole];
    if (!TargetModel) return [];

    const candidates = await TargetModel.find({})
        .populate({
            path: "userId",
            select: "name role profileCompleted accountStatus",
        })
        .lean();

    const sourceTokens = profileTokens(sourceProfile);
    const ranked = candidates
        .filter((candidate) =>
            candidate.userId &&
            candidate.userId.role === targetRole &&
            candidate.userId.accountStatus === "active" &&
            candidate.userId.profileCompleted &&
            String(candidate.userId._id) !== String(sourceProfile.userId)
        )
        .map((candidate) => {
            const targetTokens = profileTokens(candidate);
            let overlap = 0;
            targetTokens.forEach((token) => {
                if (sourceTokens.has(token)) overlap += 1;
            });
            const union = new Set([...sourceTokens, ...targetTokens]).size || 1;
            const score = Math.round((overlap / union) * 1000) / 10;
            return { candidate, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ candidate, score }) =>
            serializeRecommendationProfile(targetRole, candidate, score)
        );

    return ranked;
};

const fallbackResponse = async (res, role, target, profile, status = 200) => {
    const recommendations = await getRegisteredProfileFallback(role, target, profile);
    return res.status(status).json({
        success: true,
        source: "Registered-profile matching fallback",
        recommendationMode: "profile-fallback",
        data: { recommendations },
        message: recommendations.length
            ? "Recommendations were ranked using registered profile similarity because the AI dataset was unavailable."
            : "No complete registered profiles are available for this recommendation direction yet.",
    });
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


        const requestedLimit = Math.max(
            1,
            Math.min(Number.parseInt(req.query.limit, 10) || 2500, 2500)
        );

        // A founder without a dataset link can still use the existing custom-founder
        // ranking engines for investor and mentor discovery.
        if (!hasDatasetId && role === "founder" && ["investors", "mentors"].includes(target)) {
            const customProfile = {
                startupName: profile.startupName || "",
                domain: [profile.domain || "", profile.industry || ""].filter(Boolean).join(" "),
                description: profile.description || "",
                fundingStage: profile.fundingStage || profile.startupStage || "pre_seed",
                top_n: requestedLimit,
            };

            const endpoint = target === "investors"
                ? "/recommend/custom-founder/investors"
                : "/recommend/custom-founder/mentors";

            const response = await fetch(`${AI_API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customProfile),
            });
            const data = await response.json();

            if (!response.ok) {
                console.warn("Custom founder recommendation service failed; using registered-profile fallback.");
                return await fallbackResponse(res, role, target, {
                    ...profile.toObject(),
                    userId: user._id,
                });
            }

            return res.status(200).json({
                success: true,
                source: "StartupSync AI Recommendation Engine",
                data,
            });
        }

        // Any role without a reliable dataset ID is matched against the appropriate
        // full role dataset rather than being restricted to registered website users.
        if (
            !hasDatasetId ||
            (target === "founders" && role !== "investor") ||
            (role === "student" && target === "investors")
        ) {
            const response = await fetch(`${AI_API_URL}/recommend/custom?top_n=${requestedLimit}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_role: role,
                    target_role: target,
                    profile: profile.toObject(),
                    top_n: requestedLimit,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                console.warn("Custom dataset recommendation service failed; using registered-profile fallback.");
                return await fallbackResponse(res, role, target, {
                    ...profile.toObject(),
                    userId: user._id,
                });
            }

            return res.status(200).json({
                success: true,
                source: "StartupSync AI Recommendation API",
                data,
            });
        }

        // Existing dataset-based recommendation flow.
        const response = await fetch(
            `${AI_API_URL}/recommend/${recommendationMap[role][target]}?top_n=${requestedLimit}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    [`${role}_id`]: datasetId,
                    top_n: requestedLimit,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.warn("AI recommendation service returned a non-success response; using registered-profile fallback.");
            return await fallbackResponse(res, role, target, {
                ...profile.toObject(),
                userId: user._id,
            });
        }

        return res.status(200).json({
            success: true,
            source: "StartupSync AI Recommendation Engine",
            data,
        });
    } catch (error) {
        console.error("Recommendation error:", error.message);

        try {
            const { role, target } = req.params;
            if (req.user?.role === role && recommendationMap[role]?.[target]) {
                const user = await User.findById(req.user.userId);
                const Model = profileModels[role];
                const profile = user && Model
                    ? await Model.findOne({ userId: user._id })
                    : null;
                if (profile) {
                    return await fallbackResponse(res, role, target, {
                        ...profile.toObject(),
                        userId: user._id,
                    });
                }
            }
        } catch (fallbackError) {
            console.error("Recommendation fallback error:", fallbackError.message);
        }

        return res.status(500).json({
            success: false,
            message: "Unable to load recommendations. Please try again.",
        });
    }
};

module.exports = { getRecommendations };