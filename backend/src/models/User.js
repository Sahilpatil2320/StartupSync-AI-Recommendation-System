const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            required: true,
            enum: ["founder", "investor", "mentor", "student"]
        },

        profileCompleted: {
            type: Boolean,
            default: false
        },

        profileImage: {
            type: String,
            default: ""
        },

        accountStatus: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);