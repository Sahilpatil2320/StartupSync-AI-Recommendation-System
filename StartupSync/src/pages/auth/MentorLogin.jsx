import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  Lightbulb
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";

import "./MentorLogin.css";

function MentorLogin() {
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

    console.log("Mentor login:", formData);
  };

  return (
    <main className="mentor-login-page">
      <div className="mentor-login-container">

        <div className="mentor-login-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="mentor-login-card">

          <button
            type="button"
            className="back-to-roles"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={16} />
            Change role
          </button>

          <div className="mentor-login-header">

            <div className="mentor-login-icon">
              <Lightbulb size={27} />
            </div>

            <span className="mentor-login-badge">
              Mentor Login
            </span>

            <h1>Welcome Back, Mentor</h1>

            <p>
              Sign in to share your expertise and
              guide startups and students on StartupSync.
            </p>

          </div>

          <form
            className="mentor-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="mentor-email">
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
                  id="mentor-email"
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

              <label htmlFor="mentor-password">
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
                  id="mentor-password"
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
              className="mentor-login-button"
            >
              Login as Mentor
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="mentor-signup-link">

            <span>
              Don't have a Mentor account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/signup/mentor")
              }
            >
              Create Mentor Account
            </button>

          </div>

        </div>

        <div className="mentor-login-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>AI-Driven Startup Ecosystem</span>
        </div>

      </div>
    </main>
  );
}

export default MentorLogin;