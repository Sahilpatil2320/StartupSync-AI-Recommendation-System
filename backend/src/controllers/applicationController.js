const mongoose = require("mongoose");
const OpportunityRegistration = require("../models/OpportunityRegistration");

const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view their applications",
      });
    }

    const applications = await OpportunityRegistration.find({
      student: req.user.userId,
    })
      .populate("opportunity")
      .sort({ createdAt: -1 })
      .lean();

    const data = applications
      .filter((item) => item.opportunity)
      .map((item) => ({
        _id: item._id,
        opportunityId: item.opportunity._id,
        title: item.opportunity.title,
        company: item.opportunity.organizer,
        organizer: item.opportunity.organizer,
        type: item.opportunity.type,
        category: item.opportunity.category,
        location: item.opportunity.location,
        mode: item.opportunity.mode,
        description: item.opportunity.description,
        applicationDate: item.createdAt,
        status: item.status === "cancelled" ? "Withdrawn" : "Submitted",
        canWithdraw: item.status === "registered",
      }));

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get applications error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can withdraw applications",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await OpportunityRegistration.findOne({
      _id: id,
      student: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status === "cancelled") {
      return res.status(409).json({
        success: false,
        message: "This application has already been withdrawn",
      });
    }

    application.status = "cancelled";
    await application.save();

    return res.json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    console.error("Withdraw application error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to withdraw application",
    });
  }
};

module.exports = {
  getMyApplications,
  withdrawApplication,
};