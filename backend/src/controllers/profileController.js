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

        if (await Founder.findOne({ userId: req.user.userId })) {
            return res.status(409).json({
                success: false,
                message: "Founder profile already exists",
            });
        }

        const {
            aiDatasetId, startupName, industry, domain, description,
            foundedYear, startupStage, teamSize, businessModel,
            problemStatement, solution, targetMarket, targetCustomers,
            technologies, programmingLanguages, aiMlUsed, fundingStage,
            fundingRaised, fundingRequired, revenue, usersCount, growthRate,
            productStatus, competitors, competitiveAdvantage, lookingFor,
            website, linkedin, github, productDemo,
        } = req.body;

        if (!startupName || !industry || !domain || !description) {
            return res.status(400).json({
                success: false,
                message: "Startup name, industry, domain and description are required",
            });
        }

        const profile = await Founder.create({
            userId: req.user.userId,
            aiDatasetId, startupName, industry, domain, description,
            foundedYear, startupStage, teamSize, businessModel,
            problemStatement, solution, targetMarket, targetCustomers,
            technologies, programmingLanguages, aiMlUsed, fundingStage,
            fundingRaised, fundingRequired, revenue, usersCount, growthRate,
            productStatus, competitors, competitiveAdvantage, lookingFor,
            website, linkedin, github, productDemo,
        });

        await User.findByIdAndUpdate(req.user.userId, {
            profileCompleted: true,
        });

        return res.status(201).json({
            success: true,
            message: "Founder profile created successfully",
            profile,
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

        if (await Investor.findOne({ userId: req.user.userId })) {
            return res.status(409).json({
                success: false,
                message: "Investor profile already exists",
            });
        }

        const {
            aiDatasetId, firmName, investorType, location,
            investmentIndustries, investmentDomains, preferredStartupStages,
            preferredGeography, minimumInvestment, maximumInvestment,
            previousInvestments, portfolioCompanies, investmentThesis,
            investmentTags, investmentFocus, bio, website, linkedin,
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

        const profile = await Investor.create({
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
            profile,
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

        if (await Mentor.findOne({ userId: req.user.userId })) {
            return res.status(409).json({
                success: false,
                message: "Mentor profile already exists",
            });
        }

        const {
            aiDatasetId, location, industry, domain, expertise, skills,
            experienceYears, professionalInterests, mentoringInterests,
            mentoringAreas, preferredStartupStages, preferredDomains,
            availability, bio, linkedin, website,
        } = req.body;

        if (!location || !industry || !domain) {
            return res.status(400).json({
                success: false,
                message: "Location, industry and domain are required",
            });
        }

        const profile = await Mentor.create({
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
            profile,
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

        if (await Student.findOne({ userId: req.user.userId })) {
            return res.status(409).json({
                success: false,
                message: "Student profile already exists",
            });
        }

        const {
            aiDatasetId, college, branch, graduationYear, gpa,
            technicalSkills, programmingLanguages, frameworks, tools,
            internshipDone, internshipDomain, internshipDescription,
            projects, interestedIndustry, interestedDomain, placementDomain,
            careerGoal, clubs, certifications, achievements, startupInterests,
        } = req.body;

        if (!college || !branch || !graduationYear) {
            return res.status(400).json({
                success: false,
                message: "College, branch and graduation year are required",
            });
        }

        const profile = await Student.create({
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
            profile,
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

        const profileModels = {
            founder: Founder,
            investor: Investor,
            mentor: Mentor,
            student: Student,
        };

        const Model = profileModels[user.role];
        const profile = Model
            ? await Model.findOne({ userId: user._id })
            : null;

        return res.status(200).json({ success: true, user, profile });
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

        const { userId, _id, __v, ...updates } = req.body;

        const profile = await Model.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: updates },
            { new: true, runValidators: true }
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

// Get registered founder profiles for discovery and recommendation matching.
const getAllFounders = async (req, res) => {
    try {
        const founders = await Founder.find({})
            .select("-__v")
            .populate({
                path: "userId",
                select: "name profileImage role profileCompleted accountStatus",
            })
            .lean();

        const results = founders
            .filter((item) =>
                item.userId &&
                item.userId.role === "founder" &&
                item.userId.accountStatus === "active" &&
                item.userId.profileCompleted
            )
            .map((item) => ({
                id: item._id,
                aiDatasetId: item.aiDatasetId || "",
                userId: item.userId._id,
                name: item.startupName || item.userId.name || "Startup",
                startupName: item.startupName || "",
                industry: item.industry || "",
                domain: item.domain || "",
                description: item.description || "",
                location: item.location || item.preferredGeography || "Location not specified",
                startupStage: item.startupStage || item.fundingStage || "",
                fundingStage: item.fundingStage || "",
                teamSize: item.teamSize ?? null,
                technologies: item.technologies || [],
                lookingFor: item.lookingFor || [],
                website: item.website || "",
                linkedin: item.linkedin || "",
                github: item.github || "",
                createdAt: item.createdAt || null,
            }));

        return res.status(200).json({
            success: true,
            count: results.length,
            founders: results,
        });
    } catch (error) {
        console.error("Get founders error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch founder profiles",
        });
    }
};

// Get registered investor profiles for discovery
const getAllInvestors = async (req, res) => {
    try {
        const investors = await Investor.find({})
            .select("-__v")
            .populate({
                path: "userId",
                select: "name profileImage role profileCompleted accountStatus",
            })
            .lean();

        const results = investors
            .filter((item) =>
                item.userId &&
                item.userId.accountStatus === "active" &&
                item.userId.profileCompleted
            )
            .map((item) => ({
                id: item._id,
                aiDatasetId: item.aiDatasetId || "",
                userId: item.userId._id,
                name: item.firmName || item.userId.name,
                type: item.investorType || "Investor",
                location: item.location || "Location not provided",
                industries: [
                    ...(item.investmentIndustries || []),
                    ...(item.investmentDomains || []),
                    ...(item.investmentTags || []),
                ].filter(Boolean),
                stages: item.preferredStartupStages || [],
                minimumInvestment: item.minimumInvestment ?? 0,
                maximumInvestment: item.maximumInvestment ?? 0,
                bio: item.bio || "",
                investmentThesis: item.investmentThesis || "",
                website: item.website || "",
                linkedin: item.linkedin || "",
            }));

        return res.status(200).json({
            success: true,
            count: results.length,
            investors: results,
        });
    } catch (error) {
        console.error("Get investors error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch investor profiles",
        });
    }
};

// Get registered mentor profiles for discovery
const getAllMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find({})
            .select("-__v")
            .populate({
                path: "userId",
                select: "name profileImage role profileCompleted accountStatus",
            })
            .lean();

        const results = mentors
            .filter((item) =>
                item.userId &&
                item.userId.accountStatus === "active" &&
                item.userId.profileCompleted
            )
            .map((item) => ({
                id: item._id,
                aiDatasetId: item.aiDatasetId || "",
                userId: item.userId._id,
                name: item.userId.name || "Mentor",
                location: item.location || "Location not provided",
                industry: item.industry || "",
                domain: item.domain || "",
                expertise: item.expertise || "",
                skills: item.skills || [],
                experienceYears: item.experienceYears ?? null,
                professionalInterests: item.professionalInterests || [],
                mentoringInterests: item.mentoringInterests || [],
                mentoringAreas: item.mentoringAreas || [],
                preferredStartupStages: item.preferredStartupStages || [],
                preferredDomains: item.preferredDomains || [],
                availability: item.availability || "Not specified",
                bio: item.bio || "",
                linkedin: item.linkedin || "",
                website: item.website || "",
            }));

        return res.status(200).json({
            success: true,
            count: results.length,
            mentors: results,
        });
    } catch (error) {
        console.error("Get mentors error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch mentor profiles",
        });
    }
};

// Get registered student profiles for founder talent discovery
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({})
            .select("-__v")
            .populate({
                path: "userId",
                select: "name profileImage role profileCompleted accountStatus",
            })
            .lean();

        const results = students
            .filter((item) =>
                item.userId &&
                item.userId.role === "student" &&
                item.userId.accountStatus === "active" &&
                item.userId.profileCompleted
            )
            .map((item) => ({
                id: item._id,
                aiDatasetId: item.aiDatasetId || "",
                userId: item.userId._id,
                name: item.userId.name || "Student",
                profileImage: item.userId.profileImage || "",
                role: "Student",
                college: item.college || "",
                branch: item.branch || "",
                graduationYear: item.graduationYear ?? "",
                technicalSkills: item.technicalSkills || [],
                programmingLanguages: item.programmingLanguages || [],
                frameworks: item.frameworks || [],
                tools: item.tools || [],
                projects: item.projects || [],
                interestedIndustry: item.interestedIndustry || [],
                interestedDomain: item.interestedDomain || [],
                careerGoal: item.careerGoal || "",
                startupInterests: item.startupInterests || [],
            }));

        return res.status(200).json({
            success: true,
            count: results.length,
            students: results,
        });
    } catch (error) {
        console.error("Get students error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch student profiles",
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
    getAllFounders,
    getAllInvestors,
    getAllMentors,
    getAllStudents,
};