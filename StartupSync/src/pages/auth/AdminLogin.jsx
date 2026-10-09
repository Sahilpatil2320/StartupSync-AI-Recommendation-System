import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";

import "./AdminLogin.css";

function AdminLogin() {
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

    console.log("Admin login:", formData);
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">

        <div className="admin-login-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="admin-login-card">

          <button
            type="button"
            className="back-to-roles"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={16} />
            Change role
          </button>

          <div className="admin-login-header">

            <div className="admin-login-icon">
              <ShieldCheck size={27} />
            </div>

            <span className="admin-login-badge">
              Administrator Login
            </span>

            <h1>Welcome Back, Administrator</h1>

            <p>
              Sign in to manage users, startups,
              platform activities and StartupSync services.
            </p>

          </div>

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="admin-email">
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
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="Enter administrator email"
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

              <label htmlFor="admin-password">
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
                  id="admin-password"
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
              className="admin-login-button"
            >
              Login as Administrator
              <ArrowRight size={18} />
            </button>

          </form>

          <div className="admin-security-note">
            <ShieldCheck size={15} />

            <span>
              Authorized administrators only
            </span>
          </div>

        </div>

        <div className="admin-login-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>AI-Driven Startup Ecosystem</span>
        </div>

      </div>
    </main>
  );
}

export default AdminLogin;