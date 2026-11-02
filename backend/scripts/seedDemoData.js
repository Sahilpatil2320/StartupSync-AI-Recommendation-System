require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");

const User = require("../src/models/User");
const Founder = require("../src/models/Founder");
const Investor = require("../src/models/Investor");
const Mentor = require("../src/models/Mentor");
const Student = require("../src/models/Student");

const PASSWORD = "Test@12345";

const demoAccounts = [
  {
    role: "founder",
    users: [
      ["Aarya Kulkarni", "founder1@demo.startupsync.local"],
      ["Rohan Deshmukh", "founder2@demo.startupsync.local"],
      ["Neha Patil", "founder3@demo.startupsync.local"],
      ["Arjun Shah", "founder4@demo.startupsync.local"],
      ["Isha Mehta", "founder5@demo.startupsync.local"],
    ],
  },
  {
    role: "investor",
    users: [
      ["Meera Capital", "investor1@demo.startupsync.local"],
      ["BluePeak Ventures", "investor2@demo.startupsync.local"],
      ["Aarav Angel Network", "investor3@demo.startupsync.local"],
      ["Saffron Seed Fund", "investor4@demo.startupsync.local"],
      ["NextWave Capital", "investor5@demo.startupsync.local"],
    ],
  },
  {
    role: "mentor",
    users: [
      ["Ananya Rao", "mentor1@demo.startupsync.local"],
      ["Vikram Joshi", "mentor2@demo.startupsync.local"],
      ["Priya Nair", "mentor3@demo.startupsync.local"],
      ["Kunal Shah", "mentor4@demo.startupsync.local"],
      ["Ritu Deshpande", "mentor5@demo.startupsync.local"],
    ],
  },
  {
    role: "student",
    users: [
      ["Kavya Patil", "student1@demo.startupsync.local"],
      ["Omkar Jadhav", "student2@demo.startupsync.local"],
      ["Sana Khan", "student3@demo.startupsync.local"],
      ["Aditya More", "student4@demo.startupsync.local"],
      ["Anvi Kulkarni", "student5@demo.startupsync.local"],
    ],
  },
];

const profileModels = {
  founder: Founder,
  investor: Investor,
  mentor: Mentor,
  student: Student,
};

const stages = ["idea", "prototype", "mvp", "early_stage", "growth"];
const fundingStages = ["bootstrapped", "pre_seed", "seed", "series_a", "series_b"];
const investorTypes = [
  "angel_investor",
  "venture_capital",
  "corporate_investor",
  "private_equity",
  "family_office",
];
const startupNames = [
  "EcoTrack",
  "HealthBridge",
  "AgriNova",
  "SkillOrbit",
  "UrbanFlow",
];
const industries = [
  "Environmental Technology",
  "Healthcare Technology",
  "Agriculture Technology",
  "Education Technology",
  "Smart Mobility",
];

const makeProfile = (role, index, name) => {
  const common = {
    aiDatasetId: `DEMO-${role.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
  };

  if (role === "founder") {
    const startupName = startupNames[index];
    return {
      ...common,
      startupName,
      industry: industries[index],
      domain: ["Sustainability", "Digital Health", "AgriTech", "EdTech", "Mobility"][index],
      description: `${startupName} is a demo startup founded by ${name}, built to solve a practical ${industries[index].toLowerCase()} problem.`,
      foundedYear: 2024 + (index % 3),
      startupStage: stages[index],
      teamSize: 2 + index,
      businessModel: index % 2 ? "B2B SaaS" : "B2C Platform",
      problemStatement: `A common challenge in ${industries[index].toLowerCase()}.`,
      solution: `A technology platform that makes ${startupName} services easier to access.`,
      targetMarket: "Indian startups and small businesses",
      targetCustomers: "Early adopters and growing businesses",
      technologies: [["React", "Node.js"], ["Java", "Spring Boot"], ["Python", "Django"], ["React", "MongoDB"], ["Flutter", "Firebase"]][index],
      programmingLanguages: [["JavaScript"], ["Java"], ["Python"], ["JavaScript"], ["Dart"]][index],
      fundingStage: fundingStages[index],
      fundingRaised: index * 100000,
      fundingRequired: 500000 + index * 250000,
      revenue: index * 25000,
      usersCount: 100 + index * 40,
      growthRate: 8 + index * 3,
      productStatus: ["idea", "development", "beta", "launched", "scaling"][index],
      competitors: ["Existing industry platforms"],
      competitiveAdvantage: "Simple user experience and focused domain expertise.",
      lookingFor: ["investors", "mentors", "students"],
      website: "https://example.com",
    };
  }

  if (role === "investor") {
    return {
      ...common,
      firmName: name,
      investorType: investorTypes[index],
      location: ["Pune, India", "Mumbai, India", "Bengaluru, India", "Delhi, India", "Hyderabad, India"][index],
      investmentIndustries: [industries[index], "Software"],
      investmentDomains: ["SaaS", "Artificial Intelligence", "Digital Platforms"],
      preferredStartupStages: [stages[index], "mvp"],
      preferredGeography: ["India"],
      minimumInvestment: 250000 + index * 100000,
      maximumInvestment: 2500000 + index * 500000,
      previousInvestments: ["Demo Startup Portfolio"],
      portfolioCompanies: ["Sample Portfolio Company"],
      investmentThesis: `Supporting early-stage founders working in ${industries[index].toLowerCase()}.`,
      investmentTags: ["SaaS", "Early Stage", "Technology"],
      investmentFocus: "Early-stage technology startups",
      bio: `Demo investor profile ${index + 1} for testing StartupSync connections.`,
      website: "https://example.com",
    };
  }

  if (role === "mentor") {
    return {
      ...common,
      location: ["Pune, India", "Mumbai, India", "Bengaluru, India", "Kolhapur, India", "Hyderabad, India"][index],
      industry: ["Information Technology", "Healthcare", "Agriculture", "Education", "Product Design"][index],
      domain: ["Startup Strategy", "Product Management", "Growth Marketing", "Full Stack Development", "Fundraising"][index],
      expertise: [["Business Strategy", "Market Research"], ["Product Design", "UX"], ["Digital Marketing", "Growth"], ["React", "Node.js"], ["Pitch Decks", "Fundraising"]][index],
      skills: [["Leadership", "Communication"], ["UI/UX", "Research"], ["SEO", "Analytics"], ["JavaScript", "APIs"], ["Financial Modelling", "Negotiation"]][index],
      experienceYears: 5 + index * 2,
      professionalInterests: ["Startups", "Innovation", "Technology"],
      mentoringInterests: ["Early-stage founders", "Student entrepreneurs"],
      mentoringAreas: ["Product Validation", "Career Guidance", "Go-to-Market Strategy"],
      preferredStartupStages: ["idea", "mvp", "early_stage"],
      preferredDomains: ["SaaS", "AI", "Software"],
      availability: "available",
      bio: `Demo mentor profile ${index + 1}; available to guide founders and students.`,
      website: "https://example.com",
    };
  }

  return {
    ...common,
    college: [
      "D. Y. Patil College of Engineering",
      "Shivaji University",
      "COEP Technological University",
      "Walchand College of Engineering",
      "VIT Pune",
    ][index],
    branch: "Computer Science and Engineering",
    graduationYear: 2027,
    gpa: 7.2 + index * 0.2,
    technicalSkills: [["HTML", "CSS", "JavaScript"], ["Java", "SQL"], ["Python", "Data Analysis"], ["React", "Node.js"], ["UI/UX", "Figma"]][index],
    programmingLanguages: [["JavaScript"], ["Java"], ["Python"], ["JavaScript"], ["Python"]][index],
    frameworks: [["React"], ["Spring Boot"], ["Flask"], ["Express"], ["Bootstrap"]][index],
    tools: ["VS Code", "Git", "GitHub"],
    internshipDone: index % 2 === 0,
    internshipDomain: "Software Development",
    internshipDescription: "Demo internship details for testing.",
    projects: [`${name}'s Demo Project`, "StartupSync Profile"],
    interestedIndustry: [industries[index], "Software"],
    interestedDomain: ["Full Stack Development", "Artificial Intelligence"],
    placementDomain: "Software Engineering",
    careerGoal: "Build useful software products and learn from experienced professionals.",
    clubs: ["Coding Club"],
    certifications: ["Programming Fundamentals"],
    achievements: ["Completed academic projects"],
    startupInterests: ["startup_internship", "mentorship", "project_collaboration"],
  };
};

async function seedDemoData() {
  if (process.env.NODE_ENV === "production" || process.env.SEED_TEST_USERS !== "true") {
    throw new Error(
      "Demo seeding is allowed only in development. Set SEED_TEST_USERS=true first."
    );
  }

  try {
    await connectDB();
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    let createdUsers = 0;
    let existingUsers = 0;
    let createdProfiles = 0;
    let existingProfiles = 0;

    for (const group of demoAccounts) {
      const Model = profileModels[group.role];

      for (let index = 0; index < group.users.length; index += 1) {
        const [name, email] = group.users[index];
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name,
            email,
            password: passwordHash,
            role: group.role,
            profileCompleted: false,
            accountStatus: "active",
          });
          createdUsers += 1;
        } else {
          if (user.role !== group.role) {
            throw new Error(`Role mismatch for ${email}; existing account was not changed.`);
          }
          existingUsers += 1;
        }

        const existingProfile = await Model.findOne({ userId: user._id });
        if (!existingProfile) {
          await Model.create({
            userId: user._id,
            ...makeProfile(group.role, index, name),
          });
          createdProfiles += 1;
        } else {
          existingProfiles += 1;
        }

        await User.updateOne(
          { _id: user._id },
          { $set: { profileCompleted: true } }
        );
      }
    }

    console.log("\nStartupSync demo data ready.");
    console.log(`Users created: ${createdUsers}; existing users reused: ${existingUsers}`);
    console.log(`Profiles created: ${createdProfiles}; existing profiles kept: ${existingProfiles}`);
    console.log("\nLogin password for all 20 demo accounts: " + PASSWORD);
    console.log("\nDemo account emails:");
    for (const group of demoAccounts) {
      console.log(`\n${group.role.toUpperCase()}`);
      group.users.forEach(([name, email]) => console.log(`  ${name}: ${email}`));
    }
    console.log("\nNo existing profile details were overwritten.");
  } catch (error) {
    console.error("Demo data seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedDemoData();
