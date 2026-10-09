import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Mail,
  Rocket,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../BrandLogo";

import "./RoleLogin.css";

const roleIcons = {
  founder: Rocket,
  investor: TrendingUp,
  mentor: Lightbulb,
  student: GraduationCap,
  incubator: Building2,
  admin: ShieldCheck
};

const roleInformation = {
  founder: {
    name: "Startup Founder",
    badge: "Startup Founder",
    description:
      "Sign in to manage your startup, connect with investors, mentors and opportunities.",
    signup: true
  },

  investor: {
    name: "Investor",
    badge: "Investor",
    description:
      "Sign in to discover startups, explore investment opportunities and connect with founders.",
    signup: true
  },

  mentor: {
    name: "Mentor",
    badge: "Mentor",
    description:
      "Sign in to share your expertise, guide startups and connect with entrepreneurs.",
    signup: true
  },

  student: {
    name: "Student",
    badge: "Student",
    description:
      "Sign in to discover internships, startup opportunities, mentors and career connections.",
    signup: true
  },

  incubator: {
    name: "Incubator",
    badge: "Incubator",
    description:
      "Sign in to manage your incubation programs, support startups and connect with founders.",
    signup: true
  },

  admin: {
    name: "Administrator",
    badge: "Administrator",
    description:
      "Sign in to securely manage users, startups, applications and the StartupSync platform.",
    signup: false
  }
};

function RoleLogin({ role }) {
  const navigate = useNavigate();

  const information = roleInformation[role];

  if (!information) {
    return null;
  }

  const Icon = roleIcons[role];

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(`${information.name} login submitted`);
  };

  return (
    <main className="role-login-page">

      <div className="role-login-container">

        <div className="role-login-brand">
          <BrandLogo variant="light" />
        </div>

        <button
          type="button"
          className="role-login-back"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft size={17} />
          Back to role selection
        </button>

        <section className="role-login-card">

          <div className="role-login-header">

            <div className="role-login-icon">
              <Icon size={27} />
            </div>

            <span className="role-login-badge">
              {information.badge}
            </span>

            <h1>
              Welcome Back, {information.name}
            </h1>

            <p>
              {information.description}
            </p>

          </div>

          <form
            className="role-login-form"
            onSubmit={handleSubmit}
          >

            <div className="role-form-field">

              <label htmlFor={`${role}-email`}>
                Email Address
              </label>

              <div className="role-input-wrapper">

                <Mail size={18} />

                <input
                  id={`${role}-email`}
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            <div className="role-form-field">

              <div className="role-password-row">

                <label htmlFor={`${role}-password`}>
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>

              <div className="role-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id={`${role}-password`}
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary role-login-button"
            >
              Login
              <ArrowRight size={18} />
            </button>

          </form>

          {information.signup && (
            <div className="role-signup-text">

              <span>
                Don't have a StartupSync account?
              </span>

              <Link to={`/signup/${role}`}>
                Create an account
              </Link>

            </div>
          )}

          {!information.signup && (
            <div className="role-admin-notice">
              Administrator accounts are created and managed
              securely by the StartupSync system.
            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default RoleLogin;