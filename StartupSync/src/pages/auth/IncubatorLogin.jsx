import {
  ArrowLeft,
  ArrowRight,
  Building2,
  LockKeyhole,
  Mail
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";

import "./IncubatorLogin.css";

function IncubatorLogin() {
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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
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

    console.log("Incubator login:", formData);
  };

  return (
    <main className="incubator-login-page">
      <div className="incubator-login-container">

        <div className="incubator-login-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="incubator-login-card">

          <button
            type="button"
            className="back-to-roles"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={16} />
            Change role
          </button>

          <div className="incubator-login-header">

            <div className="incubator-login-icon">
              <Building2 size={27} />
            </div>

            <span className="incubator-login-badge">
              Incubator Login
            </span>

            <h1>Welcome Back, Incubator</h1>

            <p>
              Sign in to support startups, founders and
              innovation programs through StartupSync.
            </p>

          </div>

          <form
            className="incubator-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="incubator-email">
                Email
                <span className="required-mark"> *</span>
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
                  id="incubator-email"
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

              <label htmlFor="incubator-password">
                Password
                <span className="required-mark"> *</span>
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
                  id="incubator-password"
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
              className="incubator-login-button"
            >
              Login as Incubator
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="incubator-signup-link">
            <span>
              Don't have an Incubator account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/signup/incubator")}
            >
              Create Incubator Account
            </button>
          </div>

        </div>

        <div className="incubator-login-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>AI-Driven Startup Ecosystem</span>
        </div>

      </div>
    </main>
  );
}

export default IncubatorLogin;