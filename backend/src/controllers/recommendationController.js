const getFounderInvestors = async (req, res) => {
    try {
        const { founderId } = req.params;

        if (!founderId) {
            return res.status(400).json({
                success: false,
                message: "Founder ID is required"
            });
        }

        const response = await fetch(
            "http://127.0.0.1:8000/recommend/founder/investors",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    founder_id: founderId
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({
                success: false,
                message: "AI recommendation service failed",
                error: data
            });
        }

        return res.status(200).json({
            success: true,
            source: "StartupSync AI Recommendation Engine",
            data
        });

    } catch (error) {
        console.error(
            "Founder to Investor recommendation error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to connect to AI recommendation service",
            error: error.message
        });
    }
};

module.exports = {
    getFounderInvestors
};