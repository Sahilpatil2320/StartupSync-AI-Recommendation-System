const DealPipeline = require("../models/DealPipeline");
const Founder = require("../models/Founder");
const datasetService = require("../services/datasetService");

// Get all deals in the investor's pipeline
const getPipeline = async (req, res) => {
  try {
    if (req.user.role !== "investor") {
      return res.status(403).json({ success: false, message: "Only investors can access the deal pipeline" });
    }

    const { stage, priority, search } = req.query;
    const filter = { investorUserId: req.user.userId };

    if (stage && stage !== "All") filter.stage = stage;
    if (priority && priority !== "All") filter.priority = priority;
    if (search) filter.startupName = { $regex: search, $options: "i" };

    const deals = await DealPipeline.find(filter)
      .populate({
        path: "founderProfileId",
        select: "startupName industry fundingStage fundingRequired fundingRaised revenue website pitchDeckUrl",
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Group deals by stage for kanban/pipeline view
    const stages = [
      "Prospect",
      "Initial Contact",
      "Meeting Scheduled",
      "Due Diligence",
      "Term Sheet",
      "Invested",
      "Passed",
    ];

    const grouped = {};
    stages.forEach((s) => (grouped[s] = []));
    deals.forEach((d) => {
      if (grouped[d.stage]) {
        grouped[d.stage].push(d);
      } else {
        grouped["Prospect"].push(d);
      }
    });

    return res.status(200).json({
      success: true,
      count: deals.length,
      deals,
      grouped,
    });
  } catch (error) {
    console.error("Get pipeline error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch deal pipeline" });
  }
};

// Add startup to deal pipeline
const addToPipeline = async (req, res) => {
  try {
    if (req.user.role !== "investor") {
      return res.status(403).json({ success: false, message: "Only investors can add deals" });
    }

    const {
      startupIdentifier,
      startupName,
      industry,
      isDataset,
      founderProfileId,
      stage,
      targetAmount,
      priority,
      note,
    } = req.body;

    if (!startupIdentifier || !startupName) {
      return res.status(400).json({ success: false, message: "Startup identifier and name are required" });
    }

    const initialNotes = note ? [{ content: note, createdAt: new Date() }] : [];

    const defaultChecklist = [
      { item: "Pitch deck reviewed", completed: false },
      { item: "Initial intro meeting held", completed: false },
      { item: "Cap table & financial model verified", completed: false },
      { item: "Product demo & technical diligence", completed: false },
      { item: "Customer reference calls completed", completed: false },
      { item: "Term sheet issued & negotiated", completed: false },
    ];

    const deal = await DealPipeline.findOneAndUpdate(
      {
        investorUserId: req.user.userId,
        startupIdentifier,
      },
      {
        $setOnInsert: {
          dueDiligenceChecklist: defaultChecklist,
        },
        $set: {
          startupName,
          industry: industry || "Technology",
          isDataset: Boolean(isDataset),
          founderProfileId: founderProfileId || null,
          stage: stage || "Prospect",
          targetAmount: Number(targetAmount) || 0,
          priority: priority || "Medium",
        },
        ...(note ? { $push: { notes: { content: note, createdAt: new Date() } } } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: `${startupName} added to deal pipeline`,
      deal,
    });
  } catch (error) {
    console.error("Add to pipeline error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to add deal to pipeline" });
  }
};

// Update deal stage, note, follow-up date, checklist
const updateDeal = async (req, res) => {
  try {
    if (req.user.role !== "investor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { stage, priority, nextFollowUpDate, targetAmount, proposedValuation, note, checklistItemIndex, checklistCompleted } = req.body;

    const deal = await DealPipeline.findOne({ _id: id, investorUserId: req.user.userId });
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found or access denied" });
    }

    if (stage) deal.stage = stage;
    if (priority) deal.priority = priority;
    if (nextFollowUpDate !== undefined) deal.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
    if (targetAmount !== undefined) deal.targetAmount = Number(targetAmount);
    if (proposedValuation !== undefined) deal.proposedValuation = Number(proposedValuation);

    if (note && typeof note === "string" && note.trim()) {
      deal.notes.push({ content: note.trim(), createdAt: new Date() });
    }

    if (checklistItemIndex !== undefined && deal.dueDiligenceChecklist[checklistItemIndex]) {
      deal.dueDiligenceChecklist[checklistItemIndex].completed = Boolean(checklistCompleted);
      deal.dueDiligenceChecklist[checklistItemIndex].completedAt = checklistCompleted ? new Date() : null;
    }

    await deal.save();

    return res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      deal,
    });
  } catch (error) {
    console.error("Update deal error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update deal" });
  }
};

// Remove deal from pipeline
const removeDeal = async (req, res) => {
  try {
    if (req.user.role !== "investor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const deleted = await DealPipeline.findOneAndDelete({ _id: id, investorUserId: req.user.userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    return res.status(200).json({ success: true, message: "Deal removed from pipeline" });
  } catch (error) {
    console.error("Remove deal error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to remove deal" });
  }
};

module.exports = {
  getPipeline,
  addToPipeline,
  updateDeal,
  removeDeal,
};
