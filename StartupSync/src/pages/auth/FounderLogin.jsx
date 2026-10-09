import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  Rocket
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";

import "./FounderLogin.css";

function FounderLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Founder login:", formData);
  };

  return (
    <main className="founder-login-page">
      <div className="founder-login-container">

        <div className="founder-login-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="founder-login-card">

          <button
            type="button"
            className="back-to-roles"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={16} />
            Change role
          </button>

          <div className="founder-login-header">

            <div className="founder-login-icon">
              <Rocket size={27} />
            </div>

            <span className="founder-login-badge">
              Startup Founder Login
            </span>

            <h1>Welcome Back, Founder</h1>

            <p>
              Sign in to manage your startup, connect
              with investors and grow your venture on
              StartupSync.
            </p>

          </div>

          <form
            className="founder-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="founder-email">
                Email
                <span className="required-mark">
                  {" "}*
                </span>
              </label>

              <div
                className={`login-input-wrapper ${
                  errors.email
                    ? "login-input-error"
                    : ""
                }`}
              >
                <Mail size={18} />

                <input
                  id="founder-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {errors.email && (
                <span className="login-field-error">
                  {errors.email}
                </span>
              )}

            </div>

            <div className="login-form-field">

              <label htmlFor="founder-password">
                Password
                <span className="required-mark">
                  {" "}*
                </span>
              </label>

              <div
                className={`login-input-wrapper ${
                  errors.password
                    ? "login-input-error"
                    : ""
                }`}
              >
                <LockKeyhole size={18} />

                <input
                  id="founder-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {errors.password && (
                <span className="login-field-error">
                  {errors.password}
                </span>
              )}

            </div>

            <div className="forgot-password-row">
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="founder-login-button"
            >
              Login as Founder
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="founder-signup-link">

            <span>
              Don't have a Founder account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/signup/founder")
              }
            >
              Create Founder Account
            </button>

          </div>

        </div>

        <div className="founder-login-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>AI-Driven Startup Ecosystem</span>
        </div>

      </div>
    </main>
  );
}

export default FounderLogin;