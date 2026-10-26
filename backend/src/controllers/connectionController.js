
const Connection = require("../models/Connection");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Founder = require("../models/Founder");
const User = require("../models/User");

const profileModels = {
    investor: Investor,
    mentor: Mentor,
    student: Student,
    founder: Founder,
};

// Send a connection request to a supported profile type.
const sendConnectionRequest = async (req, res) => {
    try {
        const { targetRole, targetId } = req.params;

        const Model = profileModels[targetRole];

        if (!Model) {
            return res.status(400).json({
                success: false,
                message: "Invalid connection target.",
            });
        }

        // Preserve the existing restriction for Founder -> Investor.
        // Other role combinations are allowed only when explicitly listed.
        const allowedTargets = {
            founder: ["investor", "mentor", "student"],
            investor: ["founder", "mentor"],
            mentor: ["founder", "investor", "student"],
            student: ["founder", "mentor", "investor"],
        };

        if (!allowedTargets[req.user.role]?.includes(targetRole)) {
            return res.status(403).json({
                success: false,
                message: "Your role cannot send a request to this profile type.",
            });
        }

        const targetProfile = await Model.findById(targetId);

        if (!targetProfile) {
            return res.status(404).json({
                success: false,
                message: `${targetRole} profile not found.`,
            });
        }

        const receiver = await User.findById(targetProfile.userId);

        if (
            !receiver ||
            receiver.role !== targetRole ||
            receiver.accountStatus !== "active"
        ) {
            return res.status(404).json({
                success: false,
                message: "Active target account not found.",
            });
        }

        if (String(receiver._id) === String(req.user.userId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot connect to your own account.",
            });
        }

        const existing = await Connection.findOne({
            sender: req.user.userId,
            receiver: receiver._id,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "A connection request already exists.",
                request: existing,
            });
        }

        const request = await Connection.create({
            sender: req.user.userId,
            receiver: receiver._id,
        });

        return res.status(201).json({
            success: true,
            message: "Connection request sent successfully.",
            request,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A connection request already exists.",
            });
        }

        console.error("Connection request error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to send connection request.",
        });
    }
};

// Get requests sent or received by the logged-in user.
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
            message: "Unable to fetch connection requests.",
        });
    }
};

module.exports = {
    sendConnectionRequest,
    getMyConnectionRequests,
};