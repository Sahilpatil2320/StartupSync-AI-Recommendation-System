
const User = require("../models/User");
const Founder = require("../models/Founder");
const Investor = require("../models/Investor");
const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Message = require("../models/Message");

const getDashboardStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      totalFounders,
      totalInvestors,
      totalMentors,
      totalStudents,
      totalAdmins,
      totalStartupProfiles,
      totalInvestorProfiles,
      totalMentorProfiles,
      totalStudentProfiles,
      totalMessages,
      registrationsLast30Days
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
      Investor.countDocuments(),
      Mentor.countDocuments(),
      Student.countDocuments(),

      Message.countDocuments(),

      User.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1
          }
        }
      ])
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        blockedUsers,
        totalMessages,

        usersByRole: {
          founders: totalFounders,
          investors: totalInvestors,
          mentors: totalMentors,
          students: totalStudents,
          admins: totalAdmins
        },

        profiles: {
          startups: totalStartupProfiles,
          investors: totalInvestorProfiles,
          mentors: totalMentorProfiles,
          students: totalStudentProfiles
        },

        registrationsLast30Days: registrationsLast30Days.map((item) => ({
          date: [
            item._id.year,
            String(item._id.month).padStart(2, "0"),
            String(item._id.day).padStart(2, "0")
          ].join("-"),
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error("Admin dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics"
    });
  }
};

module.exports = {
  getDashboardStats
};
