import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import RoleSelectionGrid from "../../components/auth/RoleSelectionGrid";

import "./LoginRoleSelection.css";

function LoginRoleSelection() {
  const [selectedRole, setSelectedRole] = useState("");

  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }

    navigate(`/login/${selectedRole}`);
  };

  return (
    <main className="authentication-page">

      <div className="authentication-container">

        <div className="authentication-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="role-selection-header">

          <div className="authentication-icon">
            <ShieldCheck size={26} />
          </div>

          <span className="authentication-badge">
            Secure Access
          </span>

          <h1>
            Welcome Back to StartupSync
          </h1>

          <p>
            Select your role to continue to your
            personalized StartupSync account.
          </p>

        </div>

        <RoleSelectionGrid
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
        />

        <div className="role-selection-action">

          <button
            type="button"
            className="btn btn-primary login-continue-button"
            disabled={!selectedRole}
            onClick={handleContinue}
          >
            Continue

            <ArrowRight size={18} />
          </button>

        </div>

        <div className="authentication-footer-text">

          <span>
            Don't have a StartupSync account?
          </span>

          <button
            type="button"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>

        </div>

      </div>

    </main>
  );
}

export default LoginRoleSelection;