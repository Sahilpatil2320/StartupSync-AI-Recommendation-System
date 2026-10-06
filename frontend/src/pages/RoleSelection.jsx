import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

const roles = [
    {
        id: "founder",
        icon: "🚀",
        title: "Founder",
        description: "Build and grow your startup"
    },
    {
        id: "investor",
        icon: "📈",
        title: "Investor",
        description: "Discover promising startups"
    },
    {
        id: "mentor",
        icon: "💡",
        title: "Mentor",
        description: "Share expertise and guidance"
    },
    {
        id: "student",
        icon: "🎓",
        title: "Student",
        description: "Discover opportunities and connections"
    }
];

function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState("");
    const navigate = useNavigate();

    const handleContinue = () => {
        if (!selectedRole) return;

        navigate(`/register?role=${selectedRole}`);
    };

    return (
        <div className="role-page">
            <div className="role-container">

                <div className="role-badge">
                    StartupSync
                </div>

                <h1>
                    Choose Your <span>Role</span>
                </h1>

                <p className="role-subtitle">
                    Select how you want to use StartupSync and discover
                    opportunities tailored to your goals.
                </p>

                <div className="roles-grid">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className={`role-card ${
                                selectedRole === role.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <div className="role-card-icon">
                                {role.icon}
                            </div>

                            <div className="role-card-content">
                                <h3>{role.title}</h3>
                                <p>{role.description}</p>
                            </div>

                            <div className="role-radio">
                                {selectedRole === role.id && "✓"}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className={`continue-btn ${
                        selectedRole ? "active" : ""
                    }`}
                    onClick={handleContinue}
                    disabled={!selectedRole}
                >
                    Continue
                    <span>→</span>
                </button>

                <p className="role-footer">
                    Already have an account?
                    <button onClick={() => navigate("/login")}>
                        Login
                    </button>
                </p>

            </div>
        </div>
    );
}

export default RoleSelection;