const AI_API_URL = "http://127.0.0.1:8000";


const recommendationMap = {

    founder: {
        investors: "founder/investors",
        mentors: "founder/mentors",
        students: "founder/students"
    },

    investor: {
        founders: "investor/founders",
        mentors: "investor/mentors"
    },

    mentor: {
        founders: "mentor/founders",
        investors: "mentor/investors",
        students: "mentor/students"
    },

    student: {
        founders: "student/founders",
        mentors: "student/mentors"
    }
};


const getRecommendations = async (req, res) => {

    try {

        const { role, sourceId, target } = req.params;

        if (!role || !sourceId || !target) {

            return res.status(400).json({
                success: false,
                message:
                    "Role, source ID and target are required"
            });
        }


        const roleTargets = recommendationMap[role];

        if (!roleTargets || !roleTargets[target]) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid recommendation direction"
            });
        }


        const aiPath = roleTargets[target];


        let sourceField;

        if (role === "founder") {
            sourceField = "founder_id";
        } else if (role === "investor") {
            sourceField = "investor_id";
        } else if (role === "mentor") {
            sourceField = "mentor_id";
        } else if (role === "student") {
            sourceField = "student_id";
        }


        const response = await fetch(
            `${AI_API_URL}/recommend/${aiPath}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    [sourceField]: sourceId
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            return res.status(500).json({
                success: false,
                message:
                    "AI recommendation service failed",
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
            "Recommendation error:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to connect to AI recommendation service",

            error: error.message

        });
    }
};


module.exports = {
    getRecommendations
};