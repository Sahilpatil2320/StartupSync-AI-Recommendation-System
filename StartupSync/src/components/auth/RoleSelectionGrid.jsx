import {
    Rocket,
    TrendingUp,
    GraduationCap,
    Lightbulb
} from "lucide-react";

import "./RoleSelectionGrid.css";

const roles = [
    {
        id: "founder",
        name: "Startup Founder",
        description: "Build and grow your startup",
        icon: Rocket
    },
    {
        id: "investor",
        name: "Investor",
        description: "Discover promising startups",
        icon: TrendingUp
    },
    {
        id: "mentor",
        name: "Mentor",
        description: "Share expertise and guidance",
        icon: Lightbulb
    },
    {
        id: "student",
        name: "Student",
        description: "Discover internships and opportunities",
        icon: GraduationCap
    }
];

function RoleSelectionGrid({ selectedRole, onSelect }) {
    return (
        <div className="role-selection-grid">

            {roles.map((role) => {
                const Icon = role.icon;

                const isSelected = selectedRole === role.id;

                return (
                    <button
                        key={role.id}
                        type="button"
                        className={`role-card ${isSelected ? "role-card-selected" : ""
                            }`}
                        onClick={() => onSelect(role.id)}
                    >
                        <div className="role-icon">
                            <Icon size={25} />
                        </div>

                        <div className="role-card-content">
                            <h3>{role.name}</h3>

                            <p>{role.description}</p>
                        </div>

                        <div className="role-selection-indicator">
                            {isSelected && "✓"}
                        </div>
                    </button>
                );
            })}

        </div>
    );
}

export default RoleSelectionGrid;