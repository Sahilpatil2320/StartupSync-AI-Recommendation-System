const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let profile = null;

        if (user.role === "founder") {
            profile = await Founder.findOne({
                userId: user._id
            });
        }

        else if (user.role === "investor") {
            profile = await Investor.findOne({
                userId: user._id
            });
        }

        else if (user.role === "mentor") {
            profile = await Mentor.findOne({
                userId: user._id
            });
        }

        else if (user.role === "student") {
            profile = await Student.findOne({
                userId: user._id
            });
        }

        res.status(200).json({
            success: true,
            user,
            profile
        });

    } catch (error) {
        console.error("Get profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};