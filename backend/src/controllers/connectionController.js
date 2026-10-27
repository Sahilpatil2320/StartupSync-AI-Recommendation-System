const Connection = require("../models/Connection");
const Notification = require("../models/Notification");
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

// Role combinations allowed to send connection requests.
const allowedTargets = {
    founder: ["investor", "mentor", "student"],
    investor: ["founder", "mentor"],
    mentor: ["founder", "investor", "student"],
    student: ["founder", "mentor"],
};

// Send a connection request.
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
            status: "pending",
        });

        // Notify the recipient.
        try {
            const senderUser = await User.findById(req.user.userId)
                .select("name role");

            await Notification.create({
                user: receiver._id,
                type: "profile",
                title: "New connection request",
                message: `${senderUser?.name || "A user"} (${req.user.role}) sent you a connection request.`,
                link: "/dashboard/notifications",
            });
        } catch (notificationError) {
            console.error(
                "Connection notification error:",
                notificationError.message
            );
        }

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

// Cancel a request sent by the logged-in user.
// Only pending requests can be cancelled.
const cancelConnectionRequest = async (req, res) => {
    try {
        const request = await Connection.findOne({
            _id: req.params.requestId,
            sender: req.user.userId,
            status: "pending",
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Pending connection request not found.",
            });
        }

        await request.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Connection request cancelled successfully.",
        });
    } catch (error) {
        console.error("Cancel connection request error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel connection request.",
        });
    }
};

module.exports = {
    sendConnectionRequest,
    getMyConnectionRequests,
    cancelConnectionRequest,
};