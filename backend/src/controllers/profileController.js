const User = require("../models/User");
const Founder = require("../models/Founder");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

const createFounderProfile = async (req, res) => {
    try {
        if (req.user.role !== "founder") {
            return res.status(403).json({
                success: false,
                message: "Only founders can create founder profiles"
            });
        }

        const existingProfile = await Founder.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Founder profile already exists"
            });
        }

        const {
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
            productDemo
        } = req.body;

        if (
            !startupName ||
            !industry ||
            !domain ||
            !description
        ) {
            return res.status(400).json({
                success: false,
                message: "Startup name, industry, domain and description are required"
            });
        }

        const founder = await Founder.create({
            userId: req.user.userId,
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
            productDemo
        });

        await User.findByIdAndUpdate(
            req.user.userId,
            {
                profileCompleted: true
            }
        );

        res.status(201).json({
            success: true,
            message: "Founder profile created successfully",
            profile: founder
        });

    } catch (error) {
        console.error("Founder profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while creating founder profile"
        });
    }
};


const createInvestorProfile = async (req, res) => {
    try {
        if (req.user.role !== "investor") {
            return res.status(403).json({
                success: false,
                message: "Only investors can create investor profiles"
            });
        }

        const existingProfile = await Investor.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Investor profile already exists"
            });
        }

        const {
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
            linkedin
        } = req.body;

        if (!firmName || !location) {
            return res.status(400).json({
                success: false,
                message: "Firm name and location are required"
            });
        }

        const investor = await Investor.create({
            userId: req.user.userId,
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
            linkedin
        });

        await User.findByIdAndUpdate(
            req.user.userId,
            {
                profileCompleted: true
            }
        );

        res.status(201).json({
            success: true,
            message: "Investor profile created successfully",
            profile: investor
        });

    } catch (error) {
        console.error("Investor profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while creating investor profile"
        });
    }
};


const createMentorProfile = async (req, res) => {
    try {
        if (req.user.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Only mentors can create mentor profiles"
            });
        }

        const existingProfile = await Mentor.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Mentor profile already exists"
            });
        }

        const {
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
            website
        } = req.body;

        if (
            !location ||
            !industry ||
            !domain
        ) {
            return res.status(400).json({
                success: false,
                message: "Location, industry and domain are required"
            });
        }

        const mentor = await Mentor.create({
            userId: req.user.userId,
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
            website
        });

        await User.findByIdAndUpdate(
            req.user.userId,
            {
                profileCompleted: true
            }
        );

        res.status(201).json({
            success: true,
            message: "Mentor profile created successfully",
            profile: mentor
        });

    } catch (error) {
        console.error("Mentor profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while creating mentor profile"
        });
    }
};


const createStudentProfile = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can create student profiles"
            });
        }

        const existingProfile = await Student.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Student profile already exists"
            });
        }

        const {
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
            startupInterests
        } = req.body;

        if (
            !college ||
            !branch ||
            !graduationYear
        ) {
            return res.status(400).json({
                success: false,
                message: "College, branch and graduation year are required"
            });
        }

        const student = await Student.create({
            userId: req.user.userId,
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
            startupInterests
        });

        await User.findByIdAndUpdate(
            req.user.userId,
            {
                profileCompleted: true
            }
        );

        res.status(201).json({
            success: true,
            message: "Student profile created successfully",
            profile: student
        });

    } catch (error) {
        console.error("Student profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while creating student profile"
        });
    }
};


module.exports = {
    createFounderProfile,
    createInvestorProfile,
    createMentorProfile,
    createStudentProfile
};