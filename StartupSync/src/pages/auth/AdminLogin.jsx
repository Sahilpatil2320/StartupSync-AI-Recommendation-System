import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import api from "../../services/api";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    setErrorMessage("");
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      const { token, user } = response.data;

      if (user.role !== "admin") {
        setErrorMessage("Access denied. This account does not possess administrator privileges.");
        setLoading(false);
        return;
      }

      localStorage.setItem("startupsync_token", token);
      localStorage.setItem("startupsync_user", JSON.stringify(user));

      navigate("/dashboard/admin");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Invalid administrator credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
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
            Back to role selection
          </button>

          <div className="admin-login-header">

            <div className="admin-login-icon">
              <ShieldCheck size={27} />
            </div>

            <span className="admin-login-badge">
              <ShieldCheck size={14} />
              Database Verified Access
            </span>

            <h1>Administrator Login</h1>

            <p>
              Sign in with your database-provisioned administrator credentials to manage platform users, startups, and analytics.
            </p>

          </div>

          {errorMessage && (
            <div className="admin-error-alert" role="alert">
              <ShieldAlert size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            <div className="login-form-field">

              <label htmlFor="admin-email">
                Administrator Email
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
                  placeholder="e.g. pushkarmeshram17@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter administrator password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="admin-security-note">
            <ShieldCheck size={16} />
            <span>
              Administrator accounts are provisioned via database. Public registration is disabled.
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