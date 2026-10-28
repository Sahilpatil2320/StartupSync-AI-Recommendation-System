const User = require("../models/User");
const Founder = require("../models/Founder");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Connection = require("../models/Connection");
const Investment = require("../models/Investment");
const DealPipeline = require("../models/DealPipeline");
const MentorshipSession = require("../models/MentorshipSession");
const datasetService = require("../services/datasetService");

// Get real Ecosystem Network Graph data (nodes & edges)
const getEcosystemGraph = async (req, res) => {
  try {
    const { limitPerRole = 15 } = req.query;
    const limitNum = Math.min(parseInt(limitPerRole, 10) || 15, 50);

    const [founders, investors, mentors, students, connections, investments, deals] = await Promise.all([
      Founder.find({}).populate("userId", "name role").limit(limitNum).lean(),
      Investor.find({}).populate("userId", "name role").limit(limitNum).lean(),
      Mentor.find({}).populate("userId", "name role").limit(limitNum).lean(),
      Student.find({}).populate("userId", "name role").limit(limitNum).lean(),
      Connection.find({ status: "accepted" }).limit(100).lean(),
      Investment.find({}).limit(50).lean(),
      DealPipeline.find({}).limit(50).lean(),
    ]);

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();
    const industriesSet = new Set();

    // Helper to add node
    const addNode = (id, label, type, metadata = {}) => {
      const sId = String(id);
      if (!nodeIds.has(sId)) {
        nodeIds.add(sId);
        nodes.push({ id: sId, label, type, ...metadata });
      }
    };

    // Helper to add edge
    const addEdge = (source, target, relationship, weight = 1) => {
      const sSource = String(source);
      const sTarget = String(target);
      if (nodeIds.has(sSource) && nodeIds.has(sTarget) && sSource !== sTarget) {
        edges.push({ source: sSource, target: sTarget, relationship, weight });
      }
    };

    // 1. Founder nodes
    founders.forEach((f) => {
      const id = String(f.userId?._id || f._id);
      const name = f.startupName || f.userId?.name || "Startup";
      addNode(id, name, "founder", {
        industry: f.industry,
        fundingStage: f.fundingStage,
      });
      if (f.industry) industriesSet.add(f.industry);
    });

    // 2. Investor nodes
    investors.forEach((i) => {
      const id = String(i.userId?._id || i._id);
      const name = i.firmName || i.userId?.name || "Investor";
      addNode(id, name, "investor", {
        type: i.investorType,
        location: i.location,
      });
    });

    // 3. Mentor nodes
    mentors.forEach((m) => {
      const id = String(m.userId?._id || m._id);
      const name = m.userId?.name || "Mentor";
      addNode(id, name, "mentor", {
        expertise: m.expertise,
        industry: m.industry,
      });
      if (m.industry) industriesSet.add(m.industry);
    });

    // 4. Student nodes
    students.forEach((st) => {
      const id = String(st.userId?._id || st._id);
      const name = st.userId?.name || "Student";
      addNode(id, name, "student", {
        branch: st.branch,
      });
    });

    // 5. Industry cluster nodes
    industriesSet.forEach((ind) => {
      const indId = `ind_${ind.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      addNode(indId, ind, "industry");
    });

    // Link founders & mentors to industry nodes
    founders.forEach((f) => {
      if (f.industry) {
        const id = String(f.userId?._id || f._id);
        const indId = `ind_${f.industry.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        addEdge(id, indId, "operates_in", 1);
      }
    });

    mentors.forEach((m) => {
      if (m.industry) {
        const id = String(m.userId?._id || m._id);
        const indId = `ind_${m.industry.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        addEdge(id, indId, "advises_in", 1);
      }
    });

    // 6. Real Connection edges from DB
    connections.forEach((conn) => {
      const s = String(conn.senderId || conn.requesterId || conn.userId || "");
      const r = String(conn.receiverId || conn.targetId || "");
      if (s && r) addEdge(s, r, "connected", 2);
    });

    // 7. Real Investment edges
    investments.forEach((inv) => {
      addEdge(String(inv.investorUserId), String(inv.founderProfileId), "invested_in", 3);
    });

    // 8. Real Deal Pipeline edges
    deals.forEach((deal) => {
      if (deal.founderProfileId) {
        addEdge(String(deal.investorUserId), String(deal.founderProfileId), deal.stage.toLowerCase(), 2);
      }
    });

    return res.status(200).json({
      success: true,
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        industriesCount: industriesSet.size,
      },
    });
  } catch (error) {
    console.error("Get ecosystem graph error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to build ecosystem graph" });
  }
};

// Module 9: Startup Analytics & Funding Readiness
const getStartupFundingReadiness = async (req, res) => {
  try {
    const founder = await Founder.findOne({ userId: req.user.userId }).populate("userId", "name email");
    if (!founder) {
      return res.status(404).json({ success: false, message: "Founder profile not found" });
    }

    // Completeness calculation
    const criticalFields = [
      "startupName", "industry", "domain", "description",
      "foundedYear", "startupStage", "teamSize", "businessModel",
      "problemStatement", "solution", "targetMarket",
      "technologies", "fundingStage", "fundingRequired",
    ];

    let completedCount = 0;
    const missingFields = [];

    criticalFields.forEach((field) => {
      const val = founder[field];
      if (val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0)) {
        completedCount++;
      } else {
        missingFields.push(field);
      }
    });

    const completenessScore = Math.round((completedCount / criticalFields.length) * 100);

    // Funding calculations
    const required = founder.fundingRequired || 0;
    const raised = founder.fundingRaised || 0;
    const progressPct = required > 0 ? Math.min(Math.round((raised / required) * 100), 100) : 0;

    // Real enquiry activity (connections received)
    const connectionCount = await Connection.countDocuments({
      $or: [{ receiverId: req.user.userId }, { senderId: req.user.userId }],
    });

    const pipelineDeals = await DealPipeline.find({
      $or: [{ founderProfileId: founder._id }, { startupName: founder.startupName }],
    }).lean();

    return res.status(200).json({
      success: true,
      readiness: {
        startupName: founder.startupName,
        fundingStage: founder.fundingStage || "seed",
        completenessScore,
        missingFields,
        metrics: {
          fundingRequired: required,
          fundingRaised: raised,
          fundingProgressPercentage: progressPct,
          annualRevenue: founder.revenue || 0,
          usersCount: founder.usersCount || 0,
          growthRate: founder.growthRate || 0,
          teamSize: founder.teamSize || 1,
        },
        pipelineActivity: {
          investorEnquiriesCount: connectionCount,
          activeDueDiligenceCount: pipelineDeals.filter((d) => d.stage === "Due Diligence").length,
          totalDealsInPipeline: pipelineDeals.length,
        },
        readinessLevel:
          completenessScore >= 85 && required > 0
            ? "High — Pitch Ready"
            : completenessScore >= 60
              ? "Medium — Profile Polish Advised"
              : "Low — Critical Information Missing",
      },
    });
  } catch (error) {
    console.error("Get funding readiness error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to evaluate funding readiness" });
  }
};

module.exports = {
  getEcosystemGraph,
  getStartupFundingReadiness,
};
