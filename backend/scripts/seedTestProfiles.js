
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

const User = require("../src/models/User");
const Founder = require("../src/models/Founder");
const Investor = require("../src/models/Investor");
const Mentor = require("../src/models/Mentor");
const Student = require("../src/models/Student");

async function seedTestProfiles() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.SEED_TEST_USERS !== "true"
  ) {
    throw new Error(
      "Allowed only in development with SEED_TEST_USERS=true."
    );
  }

  try {
    await connectDB();

    const accounts = await User.find({
      email: {
        $in: [
          "foundertester@startupsync.local",
          "investortester@startupsync.local",
          "mentortester@startupsync.local",
          "studenttester@startupsync.local",
        ],
      },
    });

    const users = Object.fromEntries(
      accounts.map((user) => [user.role, user])
    );

    const requiredRoles = ["founder", "investor", "mentor", "student"];

    for (const role of requiredRoles) {
      if (!users[role]) {
        throw new Error(`Missing ${role} test account.`);
      }
    }

    const profiles = [
      {
        role: "founder",
        Model: Founder,
        data: {
          aiDatasetId: "TEST-FOUNDER-001",
          startupName: "EcoTrack",
          industry: "Environmental Technology",
          domain: "Sustainability",
          description:
            "A sample startup helping businesses monitor and reduce their environmental impact.",
          foundedYear: 2025,
          startupStage: "mvp",
          teamSize: 4,
          businessModel: "B2B SaaS",
          problemStatement:
            "Businesses need simpler ways to track environmental performance.",
          solution:
            "A dashboard for monitoring sustainability metrics and progress.",
          targetMarket: "Small and medium-sized businesses",
          targetCustomers: "Companies working toward sustainability goals",
          technologies: ["React", "Node.js", "MongoDB"],
          programmingLanguages: ["JavaScript", "Python"],
          aiMlUsed: true,
          fundingStage: "pre_seed",
          fundingRaised: 0,
          fundingRequired: 500000,
          revenue: 0,
          usersCount: 25,
          growthRate: 10,
          productStatus: "beta",
          competitors: ["Sustainability dashboards"],
          competitiveAdvantage:
            "Simple reporting designed for small businesses.",
          lookingFor: ["investors", "mentors", "students"],
          website: "https://example.com",
        },
      },
      {
        role: "investor",
        Model: Investor,
        data: {
          aiDatasetId: "TEST-INVESTOR-001",
          firmName: "Demo Ventures",
          investorType: "venture_capital",
          location: "Pune, India",
          investmentIndustries: [
            "Environmental Technology",
            "Software",
            "Artificial Intelligence",
          ],
          investmentDomains: ["SaaS", "Sustainability", "AI"],
          preferredStartupStages: ["idea", "mvp", "early_stage"],
          preferredGeography: ["India"],
          minimumInvestment: 500000,
          maximumInvestment: 5000000,
          previousInvestments: ["Demo SaaS Startup"],
          portfolioCompanies: ["Demo SaaS Startup"],
          investmentThesis:
            "Support early-stage startups solving meaningful business problems.",
          investmentTags: ["SaaS", "AI", "Sustainability"],
          investmentFocus: "Early-stage technology startups",
          bio: "A sample investor profile for development and demonstrations.",
          website: "https://example.com",
        },
      },
      {
        role: "mentor",
        Model: Mentor,
        data: {
          aiDatasetId: "TEST-MENTOR-001",
          location: "Mumbai, India",
          industry: "Information Technology",
          domain: "Startup Strategy",
          expertise: ["Product Strategy", "Business Development"],
          skills: ["Market Research", "Product Management", "Leadership"],
          experienceYears: 8,
          professionalInterests: ["Startups", "Innovation", "Technology"],
          mentoringInterests: ["Early-stage founders", "Student entrepreneurs"],
          mentoringAreas: ["Product Validation", "Go-to-Market Strategy"],
          preferredStartupStages: ["idea", "mvp", "early_stage"],
          preferredDomains: ["SaaS", "AI", "Software"],
          availability: "available",
          bio: "A sample mentor profile for StartupSync demonstrations.",
          website: "https://example.com",
        },
      },
      {
        role: "student",
        Model: Student,
        data: {
          aiDatasetId: "TEST-STUDENT-001",
          college: "Demo Engineering College",
          branch: "Computer Science and Engineering",
          graduationYear: 2027,
          gpa: 8.2,
          technicalSkills: ["Web Development", "REST APIs", "DSA"],
          programmingLanguages: ["Java", "Python", "JavaScript"],
          frameworks: ["React", "Node.js", "Express"],
          tools: ["Git", "GitHub", "VS Code"],
          internshipDone: false,
          projects: [
            "Startup Recommendation Platform",
            "Real-Time Chat Application",
          ],
          interestedIndustry: ["Software", "Artificial Intelligence"],
          interestedDomain: ["Full Stack Development", "Backend Development"],
          placementDomain: "Software Engineering",
          careerGoal:
            "Become a software engineer and contribute to real-world products.",
          clubs: ["Coding Club"],
          certifications: ["Java Programming"],
          achievements: ["Completed multiple coding challenges"],
          startupInterests: [
            "startup_internship",
            "mentorship",
            "project_collaboration",
          ],
        },
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const profile of profiles) {
      const user = users[profile.role];

      const existing = await profile.Model.findOne({
        userId: user._id,
      });

      if (existing) {
        console.log(`Existing ${profile.role} profile left unchanged.`);
        skipped++;
        continue;
      }

      await profile.Model.create({
        userId: user._id,
        ...profile.data,
      });

      await User.updateOne(
        { _id: user._id },
        { $set: { profileCompleted: true } }
      );

      console.log(`Created ${profile.role} test profile.`);
      created++;
    }

    console.log(`Profiles created: ${created}`);
    console.log(`Existing profiles skipped: ${skipped}`);
  } catch (error) {
    console.error("Profile seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedTestProfiles();