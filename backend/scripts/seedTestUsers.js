
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");

const testUsers = [
  { name: "Founder Tester", email: "foundertester@startupsync.local", role: "founder" },
  { name: "Investor Tester", email: "investortester@startupsync.local", role: "investor" },
  { name: "Mentor Tester", email: "mentortester@startupsync.local", role: "mentor" },
  { name: "Student Tester", email: "studenttester@startupsync.local", role: "student" },
  { name: "Admin Tester", email: "admintester@startupsync.local", role: "admin" },
];

async function seedTestUsers() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Test-user seeding is disabled in production.");
  }

  if (process.env.SEED_TEST_USERS !== "true") {
    throw new Error("Set SEED_TEST_USERS=true in your local backend .env first.");
  }

  try {
    await connectDB();

    const password = await bcrypt.hash("Test@12345", 10);

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`Already exists; unchanged: ${userData.email}`);
        continue;
      }

      await User.create({
        ...userData,
        password,
        profileCompleted: true,
        accountStatus: "active",
      });

      console.log(`Created: ${userData.email}`);
    }

    console.log("\nSeeding finished.");
    console.log("Password for newly created accounts: Test@12345");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedTestUsers();