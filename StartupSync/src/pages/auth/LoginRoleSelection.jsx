import { ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import RoleSelectionGrid from "../../components/auth/RoleSelectionGrid";

import "./LoginRoleSelection.css";

function LoginRoleSelection() {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  // A cached admin session may skip role selection; protected routes and APIs
  // must still validate the session and authorization on the server.
  useEffect(() => {
    try {
      const token = localStorage.getItem("startupsync_token");
      const storedUser = localStorage.getItem("startupsync_user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (token && user?.role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      }
    } catch {
      // Ignore malformed cached user data and keep the login page available.
    }
  }, [navigate]);

  const handleContinue = () => {
    if (!selectedRole) return;
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
          <span className="authentication-badge">Secure Access</span>
          <h1>Welcome Back to StartupSync</h1>
          <p>
            Select your role to continue to your personalized StartupSync account.
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

        <div className="login-admin-access">
          <span className="login-admin-divider-label">SYSTEM ADMINISTRATION</span>
          <button
            type="button"
            className="login-admin-button"
            onClick={() => navigate("/login/admin")}
          >
            <ShieldCheck size={20} />
            Admin Login
          </button>
        </div>

        <div className="authentication-footer-text">
          <span>Don't have a StartupSync account?</span>
          <button type="button" onClick={() => navigate("/signup")}>
            Create an account
          </button>
        </div>
      </div>
    </main>
  );
}

export default LoginRoleSelection;
