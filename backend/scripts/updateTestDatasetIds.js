
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

const User = require("../src/models/User");
const Founder = require("../src/models/Founder");
const Investor = require("../src/models/Investor");
const Mentor = require("../src/models/Mentor");
const Student = require("../src/models/Student");

async function updateTestDatasetIds() {
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

    const mappings = [
      {
        email: "foundertester@startupsync.local",
        role: "founder",
        Model: Founder,
        datasetId: "781",
      },
      {
        email: "investortester@startupsync.local",
        role: "investor",
        Model: Investor,
        datasetId: "3",
      },
      {
        email: "mentortester@startupsync.local",
        role: "mentor",
        Model: Mentor,
        datasetId: "M001",
      },
      {
        email: "studenttester@startupsync.local",
        role: "student",
        Model: Student,
        datasetId: "b37412a3-fa5c-40ca-b087-7109a47482d7",
      },
    ];

    for (const mapping of mappings) {
      const user = await User.findOne({
        email: mapping.email,
        role: mapping.role,
      });

      if (!user) {
        console.log(`Skipped: account not found (${mapping.email})`);
        continue;
      }

      const profile = await mapping.Model.findOneAndUpdate(
        { userId: user._id },
        { $set: { aiDatasetId: mapping.datasetId } },
        { returnDocument: "after", runValidators: true }
      );

      if (!profile) {
        console.log(`Skipped: ${mapping.role} profile not found`);
        continue;
      }

      console.log(
        `Updated ${mapping.role}: aiDatasetId=${profile.aiDatasetId}`
      );
    }

    console.log("Test dataset ID update finished.");
  } catch (error) {
    console.error("Dataset ID update failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

updateTestDatasetIds();