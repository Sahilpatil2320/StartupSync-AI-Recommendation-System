
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Message = require("../src/models/Message");

async function seedTestMessages() {
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

    const emails = [
      "foundertester@startupsync.local",
      "investortester@startupsync.local",
      "mentortester@startupsync.local",
      "studenttester@startupsync.local",
      "admintester@startupsync.local",
    ];

    const users = await User.find({ email: { $in: emails } });
    const byRole = Object.fromEntries(
      users.map((user) => [user.role, user])
    );

    for (const role of ["founder", "investor", "mentor", "student", "admin"]) {
      if (!byRole[role]) {
        throw new Error(`Missing ${role} test account. Seed test users first.`);
      }
    }

    const conversations = [
      {
        from: "founder",
        to: "investor",
        messages: [
          ["founder", "Hello! I'm building a startup and looking for investment opportunities."],
          ["investor", "Hi! Please share your startup idea, industry, and funding requirements."],
          ["founder", "We're developing an AI-powered platform to connect startup ecosystem members."],
        ],
      },
      {
        from: "founder",
        to: "mentor",
        messages: [
          ["founder", "Hello, I'd appreciate some guidance on validating our startup idea."],
          ["mentor", "Happy to help. Have you interviewed potential users yet?"],
        ],
      },
      {
        from: "student",
        to: "founder",
        messages: [
          ["student", "Hello! Are there any internship opportunities available at your startup?"],
          ["founder", "Thanks for reaching out. Please share your skills and project experience."],
        ],
      },
      {
        from: "investor",
        to: "mentor",
        messages: [
          ["investor", "I'm reviewing early-stage startups. Which areas do you mentor in?"],
          ["mentor", "I focus on product strategy, validation, and startup growth."],
        ],
      },
      {
        from: "admin",
        to: "founder",
        messages: [
          ["admin", "Welcome to the StartupSync test environment. This is a sample support conversation."],
        ],
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const conversation of conversations) {
      const sender = byRole[conversation.from];
      const receiver = byRole[conversation.to];

      // Skip this conversation if it already contains messages.
      const existing = await Message.exists({
        $or: [
          { sender: sender._id, receiver: receiver._id },
          { sender: receiver._id, receiver: sender._id },
        ],
      });

      if (existing) {
        console.log(
          `Skipped existing conversation: ${conversation.from} ↔ ${conversation.to}`
        );
        skipped++;
        continue;
      }

      for (const [fromRole, text] of conversation.messages) {
        const from = byRole[fromRole];
        const to = fromRole === conversation.from ? receiver : sender;

        await Message.create({
          sender: from._id,
          receiver: to._id,
          text,
          readAt: null,
        });

        created++;
      }
    }

    console.log(`Sample messages created: ${created}`);
    console.log(`Conversations skipped: ${skipped}`);
  } catch (error) {
    console.error("Message seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedTestMessages();