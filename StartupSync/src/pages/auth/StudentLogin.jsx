import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  LockKeyhole,
  Mail
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";

import "./StudentLogin.css";

function StudentLogin() {
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

    console.log("Student login:", formData);
  };

  return (
    <main className="student-login-page">
      <div className="student-login-container">

        <div className="student-login-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="student-login-card">

          <button
            type="button"
            className="back-to-roles"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={16} />
            Change role
          </button>

          <div className="student-login-header">

            <div className="student-login-icon">
              <GraduationCap size={27} />
            </div>

            <span className="student-login-badge">
              Student Login
            </span>

            <h1>Welcome Back, Student</h1>

            <p>
              Sign in to discover internships,
              opportunities and startup experiences
              on StartupSync.
            </p>

          </div>

          <form
            className="student-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="student-email">
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
                  id="student-email"
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

              <label htmlFor="student-password">
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
                  id="student-password"
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
              className="student-login-button"
            >
              Login as Student
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="student-signup-link">

            <span>
              Don't have a Student account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/signup/student")
              }
            >
              Create Student Account
            </button>

          </div>

        </div>

        <div className="student-login-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>AI-Driven Startup Ecosystem</span>
        </div>

      </div>
    </main>
  );
}

export default StudentLogin;