const User = require("../models/User");
const Founder = require("../models/Founder");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Connection = require("../models/Connection");
const Opportunity = require("../models/Opportunity");
const Investment = require("../models/Investment");
const Message = require("../models/Message");
const AuditLog = require("../models/AuditLog");
const datasetService = require("../services/datasetService");

const AI_API_URL = process.env.AI_API_URL || "http://127.0.0.1:8000";

// Admin Overview Statistics (100% database & dataset backed)
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      founderCount,
      investorCount,
      mentorCount,
      studentCount,
      adminCount,
      registeredStartupCount,
      opportunityCount,
      connectionCount,
      investmentCount,
      messageCount,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: "active" }),
      User.countDocuments({ accountStatus: "inactive" }),
      User.countDocuments({ accountStatus: "blocked" }),
      User.countDocuments({ role: "founder" }),
      User.countDocuments({ role: "investor" }),
      User.countDocuments({ role: "mentor" }),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      Founder.countDocuments(),
      Opportunity.countDocuments(),
      Connection.countDocuments(),
      Investment.countDocuments().catch(() => 0),
      Message.countDocuments().catch(() => 0),
      User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const datasetStats = datasetService.getStats();

    // Check AI Engine health
    let aiHealth = { online: false, modelVersion: "2.1.0-hybrid" };
    try {
      const aiRes = await fetch(`${AI_API_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiHealth = { online: true, ...aiData };
      }
    } catch {
      aiHealth = { online: false, message: "AI microservice unreachable on port 8000" };
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        accountStatus: {
          active: activeUsers,
          inactive: inactiveUsers,
          blocked: blockedUsers,
        },
        roles: {
          founders: founderCount,
          investors: investorCount,
          mentors: mentorCount,
          students: studentCount,
          admins: adminCount,
        },
        startups: {
          registered: registeredStartupCount,
          dataset: datasetStats.startupsCount,
          total: registeredStartupCount + datasetStats.startupsCount,
        },
        datasetEntities: {
          startups: datasetStats.startupsCount,
          investors: datasetStats.investorsCount,
          mentors: datasetStats.mentorsCount,
          students: datasetStats.studentsCount,
          founders: datasetStats.foundersCount,
          version: datasetStats.datasetVersion,
          lastLoaded: datasetStats.lastLoaded,
        },
        platformActivity: {
          opportunities: opportunityCount,
          connections: connectionCount,
          investments: investmentCount,
          messages: messageCount,
        },
        registrationsOverTime: recentUsers.map((u) => ({ month: u._id, count: u.count })),
        aiEngine: {
          status: aiHealth.online ? "healthy" : "offline",
          modelVersion: "2.1.0-hybrid",
          preprocessingVersion: "1.2.0",
          datasetVersion: "2026.1",
          algorithms: "TF-IDF + Cosine Similarity + Weighted Feature Scoring",
        },
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform statistics",
    });
  }
};

// Get All Users for Admin Table
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

    const [founders, investors, mentors, students] = await Promise.all([
      Founder.find().lean(),
      Investor.find().lean(),
      Mentor.find().lean(),
      Student.find().lean(),
    ]);

    const founderMap = new Map(founders.map((f) => [String(f.userId), f]));
    const investorMap = new Map(investors.map((i) => [String(i.userId), i]));
    const mentorMap = new Map(mentors.map((m) => [String(m.userId), m]));
    const studentMap = new Map(students.map((s) => [String(s.userId), s]));

    const enriched = users.map((user) => {
      const userId = String(user._id);
      let organization = "";
      let location = "";

      if (user.role === "founder") {
        const f = founderMap.get(userId);
        organization = f?.startupName || "Startup";
        location = f?.location || "";
      } else if (user.role === "investor") {
        const i = investorMap.get(userId);
        organization = i?.firmName || "Investment Firm";
        location = i?.location || "";
      } else if (user.role === "mentor") {
        const m = mentorMap.get(userId);
        organization = m?.industry || "Mentorship";
        location = m?.location || "";
      } else if (user.role === "student") {
        const s = studentMap.get(userId);
        organization = s?.college || "College / University";
        location = s?.branch ? `${s.branch} (${s.college || ""})` : "";
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        rawRole: user.role,
        organization: organization || "StartupSync Member",
        location: location || "Global",
        status: user.accountStatus === "active" ? "Active" : user.accountStatus === "inactive" ? "Inactive" : "Blocked",
        accountStatus: user.accountStatus,
        joined: new Date(user.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        verified: user.profileCompleted || false,
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      users: enriched,
    });
  } catch (error) {
    console.error("Admin users error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch user list" });
  }
};

// Update User Account Status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verified, accountStatus } = req.body;

    const targetStatus = (accountStatus || status || "").toLowerCase();
    const updateData = {};

    if (targetStatus) {
      if (!["active", "inactive", "blocked"].includes(targetStatus)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
      updateData.accountStatus = targetStatus;
    }

    if (verified !== undefined) {
      updateData.profileCompleted = Boolean(verified);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Log the audit event
    await AuditLog.create({
      userId: req.user.userId,
      userRole: "admin",
      action: `Updated user ${user.email} status to ${user.accountStatus}`,
      category: "admin",
      details: { targetUserId: user._id, updateData },
      status: "success",
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `User status updated to ${user.accountStatus}`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

// Get All Startups for Admin Table (Combines Registered + Dataset Startups)
const getAdminStartups = async (req, res) => {
  try {
    const founders = await Founder.find()
      .populate("userId", "name email accountStatus profileCompleted createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const registeredStartups = founders.map((founder) => {
      const user = founder.userId || {};
      return {
        id: String(founder._id),
        name: founder.startupName || "Startup",
        founder: user.name || "Founder",
        industry: founder.industry || founder.domain || "Technology",
        stage: (founder.startupStage || founder.fundingStage || "Pre-Seed").replace("_", " ").toUpperCase(),
        location: founder.location || "Pune, India",
        teamSize: founder.teamSize || 1,
        fundingRequired: founder.fundingRequired ? `₹${(founder.fundingRequired / 100000).toFixed(0)} Lakhs` : "Undisclosed",
        status: user.accountStatus === "active" ? "Active" : "Blocked",
        verified: user.profileCompleted || false,
        source: "Registered",
        isDataset: false,
        joined: new Date(founder.createdAt || user.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        description: founder.description || "No description provided.",
      };
    });

    const datasetList = datasetService.getAllStartups({ limit: 50 }).items.map((s) => ({
      id: s.id,
      name: s.name,
      founder: "Public Dataset Entity",
      industry: s.industry,
      stage: String(s.fundingStage).toUpperCase(),
      location: s.location,
      teamSize: "—",
      fundingRequired: s.fundingDisplay,
      status: "Verified Dataset",
      verified: true,
      source: "AI Dataset",
      isDataset: true,
      joined: "2026 Dataset Import",
      description: s.description,
    }));

    const combined = [...registeredStartups, ...datasetList];

    return res.status(200).json({
      success: true,
      count: combined.length,
      startups: combined,
    });
  } catch (error) {
    console.error("Admin startups error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch startup list" });
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;

    const logs = await AuditLog.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 50, 100))
      .lean();

    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error("Get audit logs error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
};

// Get AI Model Monitoring & Evaluation Status
const getAiMonitoring = async (req, res) => {
  try {
    let aiEvaluation = null;
    try {
      const evalRes = await fetch(`${AI_API_URL}/evaluate`, { signal: AbortSignal.timeout(8000) });
      if (evalRes.ok) {
        const data = await evalRes.json();
        aiEvaluation = data.metrics;
      }
    } catch {
      // Offline fallback metrics if AI service is starting
      // aiEvaluation = {
      //   founder_to_investor: { precision_at_k: 1.0, recall_at_k: 1.0, ndcg_at_k: 0.9998, catalog_coverage: 10.28 },
      //   student_to_startup: { precision_at_k: 0.898, ndcg_at_k: 0.9001, catalog_coverage: 6.0 },
      // };
    }

    const datasetStats = datasetService.getStats();

    return res.status(200).json({
      success: true,
      modelMonitoring: {
        modelVersion: "2.1.0-hybrid",
        preprocessingVersion: "1.2.0",
        datasetVersion: "2026.1",
        engine: "TF-IDF + Cosine Similarity + Weighted Feature Scoring",
        healthStatus: "Operational",
        metrics: aiEvaluation,
        datasets: datasetStats,
      },
    });
  } catch (error) {
    console.error("Get AI monitoring error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch AI monitoring stats" });
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminStartups,
  getAuditLogs,
  getAiMonitoring,
};
