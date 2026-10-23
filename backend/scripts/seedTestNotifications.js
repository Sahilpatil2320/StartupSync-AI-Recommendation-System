
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Notification = require("../src/models/Notification");

async function seedTestNotifications() {
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

    const accounts = [
      ["founder", "foundertester@startupsync.local"],
      ["investor", "investortester@startupsync.local"],
      ["mentor", "mentortester@startupsync.local"],
      ["student", "studenttester@startupsync.local"],
      ["admin", "admintester@startupsync.local"],
    ];

    const users = await User.find({
      email: { $in: accounts.map(([, email]) => email) },
    });

    const byRole = Object.fromEntries(
      users.map((user) => [user.role, user])
    );

    for (const [role] of accounts) {
      if (!byRole[role]) {
        throw new Error(`Missing ${role} test account.`);
      }
    }

    const samples = [
      {
        role: "founder",
        type: "message",
        title: "New message from an investor",
        message: "An investor has sent you a message about your startup.",
        link: "/dashboard/founder/messages",
      },
      {
        role: "founder",
        type: "opportunity",
        title: "Mentorship opportunity",
        message: "A mentor is available to discuss your startup strategy.",
        link: "/dashboard/founder/recommendations",
      },
      {
        role: "founder",
        type: "application",
        title: "New application",
        message: "A student has expressed interest in an opportunity.",
        link: "/dashboard/founder/applications",
      },
      {
        role: "investor",
        type: "message",
        title: "Message from a founder",
        message: "A founder would like to discuss their startup idea.",
        link: "/dashboard/investor/messages",
      },
      {
        role: "investor",
        type: "opportunity",
        title: "Startup recommendation",
        message: "Explore startups that may match your investment interests.",
        link: "/dashboard/investor/recommendations",
      },
      {
        role: "mentor",
        type: "message",
        title: "Mentorship inquiry",
        message: "A founder has sent you a message requesting guidance.",
        link: "/dashboard/mentor/messages",
      },
      {
        role: "mentor",
        type: "profile",
        title: "Complete your profile",
        message: "Keep your expertise and skills up to date for better matches.",
        link: "/dashboard/mentor/profile",
      },
      {
        role: "student",
        type: "opportunity",
        title: "New opportunity to explore",
        message: "Check your dashboard for opportunities relevant to your interests.",
        link: "/dashboard/student/opportunities",
      },
      {
        role: "student",
        type: "message",
        title: "Message from a founder",
        message: "A founder has replied to your internship inquiry.",
        link: "/dashboard/student/messages",
      },
      {
        role: "admin",
        type: "system",
        title: "Test environment ready",
        message: "The StartupSync test account is ready for development review.",
        link: "/dashboard/admin",
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const sample of samples) {
      const user = byRole[sample.role];

      // Use a stable marker to avoid inserting the same sample twice.
      const marker = `[StartupSync test seed: ${sample.role}:${sample.title}]`;

      const exists = await Notification.exists({
        user: user._id,
        message: marker,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Notification.create({
        user: user._id,
        type: sample.type,
        title: sample.title,
        message: `${sample.message} ${marker}`,
        isRead: false,
        link: sample.link,
      });

      created++;
    }

    console.log(`Sample notifications created: ${created}`);
    console.log(`Existing sample notifications skipped: ${skipped}`);
  } catch (error) {
    console.error("Notification seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedTestNotifications();