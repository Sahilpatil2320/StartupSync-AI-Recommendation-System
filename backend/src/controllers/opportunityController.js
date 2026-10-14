const mongoose = require("mongoose");
const Opportunity = require("../models/Opportunity");
const OpportunitySave = require("../models/OpportunitySave");
const OpportunityRegistration = require("../models/OpportunityRegistration");
const Student = require("../models/Student");

const getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ isActive: true })
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    let savedIds = [];
    let registeredIds = [];
    let recommendations = [];
    let recommendationAvailable = false;
    let recommendationMessage = "";

    if (req.user.role === "student") {
      const [saved, registered, student] = await Promise.all([
        OpportunitySave.find({ student: req.user.userId })
          .select("opportunity")
          .lean(),

        OpportunityRegistration.find({
          student: req.user.userId,
          status: "registered",
        })
          .select("opportunity")
          .lean(),

        Student.findOne({ userId: req.user.userId }).lean(),
      ]);

      savedIds = saved.map((item) => String(item.opportunity));
      registeredIds = registered.map((item) => String(item.opportunity));

      if (student && opportunities.length > 0) {
        try {
          const aiResponse = await fetch(
            `${process.env.AI_API_URL || "http://127.0.0.1:8000"}/recommend/student/opportunities`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                student,
                opportunities: opportunities.map((item) => ({
                  _id: String(item._id),
                  title: item.title,
                  type: item.type,
                  category: item.category,
                  description: item.description,
                  tags: item.tags,
                  organizer: item.organizer,
                })),
              }),
              signal: AbortSignal.timeout(10000),
            }
          );

          const aiData = await aiResponse.json();

          if (aiResponse.ok && aiData.success) {
            recommendations = aiData.recommendations || [];
            recommendationAvailable = true;
            recommendationMessage = aiData.message || "";
          } else {
            recommendationMessage =
              aiData.message || "AI recommendations are temporarily unavailable";
          }
        } catch (aiError) {
          console.error("Opportunity AI error:", aiError.message);
          recommendationMessage =
            "AI recommendations are temporarily unavailable";
        }
      } else if (!student) {
        recommendationMessage =
          "Complete your student profile to receive recommendations";
      }
    }

    const scoreById = new Map(
      recommendations.map((item) => [
        String(item.opportunityId),
        Number(item.score),
      ])
    );

    const rankedOpportunities = opportunities.map((item) => {
      const match = scoreById.has(String(item._id))
        ? scoreById.get(String(item._id))
        : null;

      return {
        ...item,
        saved: savedIds.includes(String(item._id)),
        registered: registeredIds.includes(String(item._id)),
        match,
        recommended: match !== null && recommendationAvailable,
      };
    });

    if (recommendationAvailable) {
      rankedOpportunities.sort((a, b) => {
        if (a.match === null) return 1;
        if (b.match === null) return -1;
        return b.match - a.match;
      });
    }

    const recommendedIds = new Set(
      rankedOpportunities
        .filter((item) => item.recommended)
        .slice(0, 5)
        .map((item) => String(item._id))
    );

    const data = rankedOpportunities.map((item) => ({
      ...item,
      recommended: recommendedIds.has(String(item._id)),
    }));

    return res.json({
      success: true,
      count: data.length,
      recommendationAvailable,
      recommendationMessage,
      data,
    });
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch opportunities",
    });
  }
};

const createOpportunity = async (req, res) => {
  try {
    if (!["founder", "investor", "mentor"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only founders, investors, and mentors can create opportunities",
      });
    }

    const {
      title,
      organizer,
      type,
      category,
      mode,
      location,
      date,
      duration,
      participants,
      description,
      tags,
      registrationUrl,
    } = req.body;

    if (!title || !organizer || !type || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, organizer, type, category, and description are required",
      });
    }

    if (date && Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid opportunity date",
      });
    }

    const opportunity = await Opportunity.create({
      title,
      organizer,
      type,
      category,
      mode,
      location,
      date: date || undefined,
      duration,
      participants,
      description,
      tags: Array.isArray(tags) ? tags : [],
      registrationUrl,
      createdBy: req.user.userId,
      createdByRole: req.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: opportunity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create opportunity",
    });
  }
};

const toggleSaveOpportunity = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can save opportunities",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findOne({
      _id: id,
      isActive: true,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    const existing = await OpportunitySave.findOne({
      student: req.user.userId,
      opportunity: id,
    });

    if (existing) {
      await existing.deleteOne();

      return res.json({
        success: true,
        saved: false,
        message: "Opportunity removed from saved items",
      });
    }

    await OpportunitySave.create({
      student: req.user.userId,
      opportunity: id,
    });

    return res.json({
      success: true,
      saved: true,
      message: "Opportunity saved successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: true, saved: true });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to save opportunity",
    });
  }
};

const registerForOpportunity = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can register for opportunities",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findOne({
      _id: id,
      isActive: true,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    let registration = await OpportunityRegistration.findOne({
      student: req.user.userId,
      opportunity: id,
    });

    if (registration?.status === "registered") {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this opportunity",
      });
    }

    if (registration) {
      registration.status = "registered";
      await registration.save();
    } else {
      registration = await OpportunityRegistration.create({
        student: req.user.userId,
        opportunity: id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      data: registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this opportunity",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register for opportunity",
    });
  }
};

const getMyOpportunityActivity = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is available to students only",
      });
    }

    const [saved, registrations] = await Promise.all([
      OpportunitySave.find({ student: req.user.userId })
        .populate("opportunity")
        .sort({ createdAt: -1 })
        .lean(),
      OpportunityRegistration.find({
        student: req.user.userId,
        status: "registered",
      })
        .populate("opportunity")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return res.json({
      success: true,
      data: {
        saved: saved
          .filter((item) => item.opportunity?.isActive)
          .map((item) => item.opportunity),
        registered: registrations
          .filter((item) => item.opportunity?.isActive)
          .map((item) => item.opportunity),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your opportunity activity",
    });
  }
};

module.exports = {
  getOpportunities,
  createOpportunity,
  toggleSaveOpportunity,
  registerForOpportunity,
  getMyOpportunityActivity,
};