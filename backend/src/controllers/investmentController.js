
const mongoose = require("mongoose");
const Investment = require("../models/Investment");
const Investor = require("../models/Investor");
const Founder = require("../models/Founder");

const getMyInvestments = async (req, res) => {
    try {

        if (String(req.user.role || "").toLowerCase() !== "investor") {

            return res.status(403).json({
                success: false,
                message: "Only investors can view investment portfolios."
            });
        }

        const investments = await Investment.find({
            investorUserId: req.user.userId
        })
            .populate({
                path: "founderProfileId",
                select: "startupName industry domain description startupStage fundingStage location userId"
            })
            .sort({ investedDate: -1, createdAt: -1 })
            .lean();

        const data = investments.map((investment) => {
            const founder = investment.founderProfileId || {};

            return {
                ...investment,
                startup: {
                    _id: founder._id,
                    startupName: founder.startupName || "Startup",
                    industry: founder.industry || "",
                    domain: founder.domain || "",
                    description: founder.description || "",
                    stage: founder.fundingStage || founder.startupStage || "",
                    location: founder.location || ""
                }
            };
        });

        return res.status(200).json({
            success: true,
            count: data.length,
            investments: data
        });
    } catch (error) {
        console.error("Get investments error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve investments."
        });
    }
};

const createInvestment = async (req, res) => {
    try {

        if (String(req.user.role || "").toLowerCase() !== "investor") {

            return res.status(403).json({
                success: false,
                message: "Only investors can create investment records."
            });
        }

        const {
            founderProfileId,
            investedAmount,
            currentValue,
            ownershipPercentage,
            investedDate,
            status,
            nextMilestone,
            notes
        } = req.body;

        if (
            !founderProfileId ||
            !mongoose.Types.ObjectId.isValid(founderProfileId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid founder profile ID is required."
            });
        }

        const amount = Number(investedAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invested amount must be greater than zero."
            });
        }

        const investorProfile = await Investor.findOne({
            userId: req.user.userId
        });

        if (!investorProfile) {
            return res.status(400).json({
                success: false,
                message: "Complete your investor profile before recording an investment."
            });
        }

        const founder = await Founder.findById(founderProfileId);

        if (!founder) {
            return res.status(404).json({
                success: false,
                message: "Founder profile not found."
            });
        }

        if (String(founder.userId) === String(req.user.userId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot invest in your own startup profile."
            });
        }

        const allowedStatuses = ["Active", "Monitoring", "Exited"];
        const selectedStatus = status || "Active";

        if (!allowedStatuses.includes(selectedStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid investment status."
            });
        }

        const value =
            currentValue === undefined || currentValue === null
                ? amount
                : Number(currentValue);

        const ownership =
            ownershipPercentage === undefined
                ? 0
                : Number(ownershipPercentage);

        if (!Number.isFinite(value) || value < 0) {
            return res.status(400).json({
                success: false,
                message: "Current value must be zero or greater."
            });
        }

        if (
            !Number.isFinite(ownership) ||
            ownership < 0 ||
            ownership > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Ownership must be between 0 and 100."
            });
        }

        const investment = await Investment.create({
            investorUserId: req.user.userId,
            founderProfileId: founder._id,
            investedAmount: amount,
            currentValue: value,
            ownershipPercentage: ownership,
            investedDate: investedDate || new Date(),
            status: selectedStatus,
            nextMilestone: nextMilestone || "",
            notes: notes || ""
        });

        const savedInvestment = await Investment.findById(investment._id)
            .populate({
                path: "founderProfileId",
                select: "startupName industry domain description startupStage fundingStage location"
            })
            .lean();

        return res.status(201).json({
            success: true,
            message: "Investment record created successfully.",
            investment: savedInvestment
        });
    } catch (error) {
        console.error("Create investment error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create investment record."
        });
    }
};

module.exports = {
    getMyInvestments,
    createInvestment
};
