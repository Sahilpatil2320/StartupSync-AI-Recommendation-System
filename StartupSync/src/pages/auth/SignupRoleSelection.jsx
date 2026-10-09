import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import RoleSelectionGrid from "../../components/auth/RoleSelectionGrid";

import "./SignupRoleSelection.css";

function SignupRoleSelection() {
    const [selectedRole, setSelectedRole] = useState("");

    const navigate = useNavigate();

    const handleContinue = () => {
        if (!selectedRole) {
            return;
        }

        navigate(`/signup/${selectedRole}`);
    };

    return (
        <main className="signup-role-page">
            <div className="signup-role-container">

                <button
                    type="button"
                    className="signup-role-brand"
                    onClick={() => navigate("/")}
                    aria-label="Go to StartupSync home"
                >
                    <BrandLogo variant="light" />
                </button>

                <div className="signup-role-header">

                    <span className="signup-role-badge">
                        Create Your Account
                    </span>

                    <h1>Join StartupSync</h1>

                    <p>
                        Choose your role to create a personalized
                        StartupSync account and access opportunities
                        designed for you.
                    </p>

                </div>

                <RoleSelectionGrid
                    selectedRole={selectedRole}
                    onSelect={setSelectedRole}
                />

                <div className="signup-role-action">

                    <button
                        type="button"
                        className="btn btn-primary signup-continue-button"
                        disabled={!selectedRole}
                        onClick={handleContinue}
                    >
                        Continue
                        <ArrowRight size={18} />
                    </button>

                </div>

                <div className="signup-role-footer-text">

                    <span>
                        Already have a StartupSync account?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Sign in
                    </button>

                </div>

            </div>
        </main>
    );
}

export default SignupRoleSelection;