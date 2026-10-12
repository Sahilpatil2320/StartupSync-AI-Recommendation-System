
const Connection = require("../models/Connection");
const Investor = require("../models/Investor");
const User = require("../models/User");

const sendConnectionRequest = async (req, res) => {
    try {
        if (req.user.role !== "founder") {
            return res.status(403).json({
                success: false,
                message: "Only founders can send investor requests",
            });
        }

        const investor = await Investor.findById(req.params.investorId);

        if (!investor) {
            return res.status(404).json({
                success: false,
                message: "Investor not found",
            });
        }

        const receiver = await User.findById(investor.userId);

        if (!receiver || receiver.role !== "investor") {
            return res.status(404).json({
                success: false,
                message: "Investor account not found",
            });
        }

        if (receiver._id.toString() === req.user.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot connect to your own account",
            });
        }

        const existing = await Connection.findOne({
            sender: req.user.userId,
            receiver: receiver._id,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "A connection request already exists",
                request: existing,
            });
        }

        const request = await Connection.create({
            sender: req.user.userId,
            receiver: receiver._id,
        });

        return res.status(201).json({
            success: true,
            message: "Connection request sent successfully",
            request,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A connection request already exists",
            });
        }

        console.error("Connection request error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to send connection request",
        });
    }
};

const getMyConnectionRequests = async (req, res) => {
    try {
        const requests = await Connection.find({
            $or: [
                { sender: req.user.userId },
                { receiver: req.user.userId },
            ],
        })
            .populate("sender", "name email role")
            .populate("receiver", "name email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    } catch (error) {
        console.error("Get connection requests error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch connection requests",
        });
    }
};

module.exports = {
    sendConnectionRequest,
    getMyConnectionRequests,
};
