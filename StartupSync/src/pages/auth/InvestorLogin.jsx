import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  TrendingUp
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";

import "./InvestorLogin.css";

function InvestorLogin() {
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
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Investor login:", formData);
  };

  return (
    <main className="investor-login-page">

      <div className="investor-login-container">

        <div className="investor-login-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="investor-login-card">

          <button
            type="button"
            className="back-to-roles"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={16} />
            Change role
          </button>

          <div className="investor-login-header">

            <div className="investor-login-icon">
              <TrendingUp size={27} />
            </div>

            <span className="investor-login-badge">
              Investor Login
            </span>

            <h1>Welcome Back, Investor</h1>

            <p>
              Sign in to discover startups and
              investment opportunities on StartupSync.
            </p>

          </div>

          <form
            className="investor-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="investor-email">
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
                  id="investor-email"
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

              <label htmlFor="investor-password">
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
                  id="investor-password"
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
              className="investor-login-button"
            >
              Login as Investor
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="investor-signup-link">

            <span>
              Don't have an Investor account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/signup/investor")
              }
            >
              Create Investor Account
            </button>

          </div>

        </div>

        <div className="investor-login-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>AI-Driven Startup Ecosystem</span>
        </div>

      </div>

    </main>
  );
}

export default InvestorLogin;