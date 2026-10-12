
const User = require("../models/User");
const Founder = require("../models/Founder");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

// Create Founder Profile
const createFounderProfile = async (req, res) => {
    try {
        if (req.user.role !== "founder") {
            return res.status(403).json({
                success: false,
                message: "Only founders can create founder profiles",
            });
        }

        const existingProfile = await Founder.findOne({
            userId: req.user.userId,
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Founder profile already exists",
            });
        }

        const {
            aiDatasetId,
            startupName,
            industry,
            domain,
            description,
            foundedYear,
            startupStage,
            teamSize,
            businessModel,
            problemStatement,
            solution,
            targetMarket,
            targetCustomers,
            technologies,
            programmingLanguages,
            aiMlUsed,
            fundingStage,
            fundingRaised,
            fundingRequired,
            revenue,
            usersCount,
            growthRate,
            productStatus,
            competitors,
            competitiveAdvantage,
            lookingFor,
            website,
            linkedin,
            github,
            productDemo,
        } = req.body;

        if (!startupName || !industry || !domain || !description) {
            return res.status(400).json({
                success: false,
                message:
                    "Startup name, industry, domain and description are required",
            });
        }

        const founder = await Founder.create({
            userId: req.user.userId,
            aiDatasetId,
            startupName,
            industry,
            domain,
            description,
            foundedYear,
            startupStage,
            teamSize,
            businessModel,
            problemStatement,
            solution,
            targetMarket,
            targetCustomers,
            technologies,
            programmingLanguages,
            aiMlUsed,
            fundingStage,
            fundingRaised,
            fundingRequired,
            revenue,
            usersCount,
            growthRate,
            productStatus,
            competitors,
            competitiveAdvantage,
            lookingFor,
            website,
            linkedin,
            github,
            productDemo,
        });

        await User.findByIdAndUpdate(req.user.userId, {
            profileCompleted: true,
        });

        return res.status(201).json({
            success: true,
            message: "Founder profile created successfully",
            profile: founder,
        });
    } catch (error) {
        console.error("Founder profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while creating founder profile",
        });
    }
};

// Create Investor Profile
const createInvestorProfile = async (req, res) => {
    try {
        if (req.user.role !== "investor") {
            return res.status(403).json({
                success: false,
                message: "Only investors can create investor profiles",
            });
        }

        const existingProfile = await Investor.findOne({
            userId: req.user.userId,
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Investor profile already exists",
            });
        }

        const {
            aiDatasetId,
            firmName,
            investorType,
            location,
            investmentIndustries,
            investmentDomains,
            preferredStartupStages,
            preferredGeography,
            minimumInvestment,
            maximumInvestment,
            previousInvestments,
            portfolioCompanies,
            investmentThesis,
            investmentTags,
            investmentFocus,
            bio,
            website,
            linkedin,
        } = req.body;


        const cleanText = (value) =>
            typeof value === "string" ? value.trim() : "";

        const cleanedFirmName = cleanText(firmName);
        const cleanedLocation = cleanText(location);

        if (cleanedFirmName.length < 2 || cleanedLocation.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Firm name and location must each contain at least 2 characters",
            });
        }


        const investor = await Investor.create({
            userId: req.user.userId,
            aiDatasetId,
            firmName: cleanedFirmName,
            investorType,
            location: cleanedLocation,
            investmentIndustries,
            investmentDomains,
            preferredStartupStages,
            preferredGeography,
            minimumInvestment,
            maximumInvestment,
            previousInvestments,
            portfolioCompanies,
            investmentThesis,
            investmentTags,
            investmentFocus,
            bio,
            website,
            linkedin,
        });

        await User.findByIdAndUpdate(req.user.userId, {
            profileCompleted: true,
        });

        return res.status(201).json({
            success: true,
            message: "Investor profile created successfully",
            profile: investor,
        });
    } catch (error) {
        console.error("Investor profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while creating investor profile",
        });
    }
};

// Create Mentor Profile
const createMentorProfile = async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Only mentors can create mentor profiles",
            });
        }

        const existingProfile = await Mentor.findOne({
            userId: req.user.userId,
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Mentor profile already exists",
            });
        }

        const {
            aiDatasetId,
            location,
            industry,
            domain,
            expertise,
            skills,
            experienceYears,
            professionalInterests,
            mentoringInterests,
            mentoringAreas,
            preferredStartupStages,
            preferredDomains,
            availability,
            bio,
            linkedin,
            website,
        } = req.body;

        if (!location || !industry || !domain) {
            return res.status(400).json({
                success: false,
                message: "Location, industry and domain are required",
            });
        }

        const mentor = await Mentor.create({
            userId: req.user.userId,
            aiDatasetId,
            location,
            industry,
            domain,
            expertise,
            skills,
            experienceYears,
            professionalInterests,
            mentoringInterests,
            mentoringAreas,
            preferredStartupStages,
            preferredDomains,
            availability,
            bio,
            linkedin,
            website,
        });

        await User.findByIdAndUpdate(req.user.userId, {
            profileCompleted: true,
        });

        return res.status(201).json({
            success: true,
            message: "Mentor profile created successfully",
            profile: mentor,
        });
    } catch (error) {
        console.error("Mentor profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while creating mentor profile",
        });
    }
};

// Create Student Profile
const createStudentProfile = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can create student profiles",
            });
        }

        const existingProfile = await Student.findOne({
            userId: req.user.userId,
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Student profile already exists",
            });
        }

        const {
            aiDatasetId,
            college,
            branch,
            graduationYear,
            gpa,
            technicalSkills,
            programmingLanguages,
            frameworks,
            tools,
            internshipDone,
            internshipDomain,
            internshipDescription,
            projects,
            interestedIndustry,
            interestedDomain,
            placementDomain,
            careerGoal,
            clubs,
            certifications,
            achievements,
            startupInterests,
        } = req.body;

        if (!college || !branch || !graduationYear) {
            return res.status(400).json({
                success: false,
                message: "College, branch and graduation year are required",
            });
        }

        const student = await Student.create({
            userId: req.user.userId,
            aiDatasetId,
            college,
            branch,
            graduationYear,
            gpa,
            technicalSkills,
            programmingLanguages,
            frameworks,
            tools,
            internshipDone,
            internshipDomain,
            internshipDescription,
            projects,
            interestedIndustry,
            interestedDomain,
            placementDomain,
            careerGoal,
            clubs,
            certifications,
            achievements,
            startupInterests,
        });

        await User.findByIdAndUpdate(req.user.userId, {
            profileCompleted: true,
        });

        return res.status(201).json({
            success: true,
            message: "Student profile created successfully",
            profile: student,
        });
    } catch (error) {
        console.error("Student profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while creating student profile",
        });
    }
};

// Get the logged-in user's profile
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let profile = null;

        if (user.role === "founder") {
            profile = await Founder.findOne({ userId: user._id });
        } else if (user.role === "investor") {
            profile = await Investor.findOne({ userId: user._id });
        } else if (user.role === "mentor") {
            profile = await Mentor.findOne({ userId: user._id });
        } else if (user.role === "student") {
            profile = await Student.findOne({ userId: user._id });
        }

        return res.status(200).json({
            success: true,
            user,
            profile,
        });
    } catch (error) {
        console.error("Get profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching profile",
        });
    }
};

// Update the logged-in user's profile
const updateMyProfile = async (req, res) => {
    try {
        const profileModels = {
            founder: Founder,
            investor: Investor,
            mentor: Mentor,
            student: Student,
        };

        const Model = profileModels[req.user.role];

        if (!Model) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role",
            });
        }

        // Only allow legitimate profile fields to be updated.
        // Never allow changing userId through this endpoint.
        const {
            userId,
            _id,
            __v,
            ...updates
        } = req.body;

        const profile = await Model.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("Update profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Server error while updating profile",
        });
    }
};


/**
 * Get registered investor profiles for discovery.
 * Public profile fields only; never return passwords or private account data.
 */
const getAllInvestors = async (req, res) => {
    try {
        const investors = await Investor.find({})
            .select("-aiDatasetId -__v")
            .populate({
                path: "userId",
                select: "name profileImage role profileCompleted accountStatus"
            })
            .lean();

        const results = investors
            .filter(
                (investor) =>
                    investor.userId &&
                    investor.userId.accountStatus === "active" &&
                    investor.userId.profileCompleted
            )
            .map((investor) => ({
                id: investor._id,
                userId: investor.userId._id,
                name: investor.firmName || investor.userId.name,
                type: investor.investorType || "Investor",
                location: investor.location || "Location not provided",
                industries: [
                    ...(investor.investmentIndustries || []),
                    ...(investor.investmentDomains || []),
                    ...(investor.investmentTags || [])
                ].filter(Boolean),
                stages: investor.preferredStartupStages || [],
                minimumInvestment: investor.minimumInvestment ?? 0,
                maximumInvestment: investor.maximumInvestment ?? 0,
                bio: investor.bio || "",
                investmentThesis: investor.investmentThesis || "",
                website: investor.website || "",
                linkedin: investor.linkedin || ""
            }));

        return res.status(200).json({
            success: true,
            count: results.length,
            investors: results
        });
    } catch (error) {
        console.error("Get investors error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch investor profiles"
        });
    }
};



module.exports = {
    createFounderProfile,
    createInvestorProfile,
    createMentorProfile,
    createStudentProfile,
    getMyProfile,
    updateMyProfile,
    getAllInvestors,
};
