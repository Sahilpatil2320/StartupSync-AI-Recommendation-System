require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "StartupSync API is running"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Profile routes
app.use("/api/profiles", profileRoutes);

// Recommendation routes
app.use("/api/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`StartupSync server running on port ${PORT}`);
    });
};

startServer();