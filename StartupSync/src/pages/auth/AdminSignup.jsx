import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe,
  Link,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import SignupProgress from "../../components/auth/SignupProgress";

import "./AdminSignup.css";

const initialFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",

  organizationName: "",
  designation: "",
  department: "",
  organizationWebsite: "",

  invitationCode: "",
  authorizationReason: "",
  verificationDocument: "",

  responsibilities: [],
  experience: "",
  responsibilitiesDescription: "",

  phone: "",
  location: "",
  securityPreference: "",

  permissions: [],

  bio: "",
  linkedin: "",
  acknowledgement: false
};

function AdminSignup() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const totalSteps = 7;

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: ""
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((previous) => {
      const currentValues = previous[field];

      if (currentValues.includes(value)) {
        return {
          ...previous,
          [field]: currentValues.filter(
            (item) => item !== value
          )
        };
      }

      return {
        ...previous,
        [field]: [...currentValues, value]
      };
    });

    setErrors((previous) => ({
      ...previous,
      [field]: ""
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email address is required.";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (formData.password.length < 8) {
        newErrors.password =
          "Password must contain at least 8 characters.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "Please confirm your password.";
      } else if (
        formData.password !== formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match.";
      }
    }

    if (currentStep === 2) {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName =
          "Organization name is required.";
      }

      if (!formData.designation.trim()) {
        newErrors.designation =
          "Designation is required.";
      }

      if (!formData.department) {
        newErrors.department =
          "Select your department.";
      }
    }

    if (currentStep === 3) {
      if (!formData.invitationCode.trim()) {
        newErrors.invitationCode =
          "Administrator invitation code is required.";
      }

      if (!formData.authorizationReason.trim()) {
        newErrors.authorizationReason =
          "Please provide the authorization reason.";
      }

      if (!formData.verificationDocument.trim()) {
        newErrors.verificationDocument =
          "Enter a verification reference.";
      }
    }

    if (currentStep === 4) {
      if (formData.responsibilities.length === 0) {
        newErrors.responsibilities =
          "Select at least one responsibility.";
      }

      if (!formData.experience) {
        newErrors.experience =
          "Select your relevant experience.";
      }

      if (
        !formData.responsibilitiesDescription.trim()
      ) {
        newErrors.responsibilitiesDescription =
          "Describe your responsibilities.";
      }
    }

    if (currentStep === 5) {
      if (!formData.phone.trim()) {
        newErrors.phone =
          "Phone number is required.";
      }

      if (!formData.location.trim()) {
        newErrors.location =
          "Location is required.";
      }

      if (!formData.securityPreference) {
        newErrors.securityPreference =
          "Select a security preference.";
      }
    }

    if (currentStep === 6) {
      if (formData.permissions.length === 0) {
        newErrors.permissions =
          "Select at least one permission area.";
      }
    }

    if (currentStep === 7) {
      if (!formData.bio.trim()) {
        newErrors.bio =
          "Administrator profile description is required.";
      }

      if (!formData.acknowledgement) {
        newErrors.acknowledgement =
          "You must acknowledge the administrator access terms.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);
      setErrors({});

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateStep()) return;

    alert(
      "Administrator account request submitted successfully."
    );

    console.log("Administrator Signup Data:", formData);
  };

  const inputClass = (field) =>
    `admin-input-wrapper ${
      errors[field] ? "admin-input-error" : ""
    }`;

  return (
    <main className="admin-signup-page">
      <div className="admin-signup-container">

        <div className="admin-signup-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="admin-signup-card">

          <div className="admin-signup-header">

            <div className="admin-signup-icon">
              <ShieldCheck size={27} />
            </div>

            <span className="admin-signup-badge">
              Administrator Registration
            </span>

            <h1>Create Administrator Account</h1>

            <p>
              Submit your administrator details for secure
              StartupSync platform access and verification.
            </p>

            <div className="admin-security-note">
              <ShieldCheck size={16} />
              <span>
                Administrator access requires verification.
              </span>
            </div>

          </div>

          <SignupProgress currentStep={currentStep} />

          <form
            className="admin-signup-form"
            onSubmit={handleSubmit}
          >

            {currentStep === 1 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Account Information</h2>
                  <p>
                    Create the administrator account credentials.
                  </p>
                </div>

                <div className="admin-form-grid">

                  <div className="admin-field full-width">
                    <label htmlFor="fullName">
                      Full Name
                    </label>

                    <div className={inputClass("fullName")}>
                      <UserRound size={18} />

                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(event) =>
                          handleChange(
                            "fullName",
                            event.target.value
                          )
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    {errors.fullName && (
                      <span className="admin-error">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="email">
                      Official Email Address
                    </label>

                    <div className={inputClass("email")}>
                      <Mail size={18} />

                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(event) =>
                          handleChange(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="admin@organization.com"
                      />
                    </div>

                    {errors.email && (
                      <span className="admin-error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="password">
                      Password
                    </label>

                    <div className={inputClass("password")}>
                      <LockKeyhole size={18} />

                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(event) =>
                          handleChange(
                            "password",
                            event.target.value
                          )
                        }
                        placeholder="Minimum 8 characters"
                      />
                    </div>

                    {errors.password && (
                      <span className="admin-error">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="confirmPassword">
                      Confirm Password
                    </label>

                    <div
                      className={inputClass(
                        "confirmPassword"
                      )}
                    >
                      <LockKeyhole size={18} />

                      <input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(event) =>
                          handleChange(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                        placeholder="Re-enter your password"
                      />
                    </div>

                    {errors.confirmPassword && (
                      <span className="admin-error">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Organization Profile</h2>
                  <p>
                    Provide your official organizational
                    information.
                  </p>
                </div>

                <div className="admin-form-grid">

                  <div className="admin-field">
                    <label htmlFor="organizationName">
                      Organization Name
                    </label>

                    <div
                      className={inputClass(
                        "organizationName"
                      )}
                    >
                      <Building2 size={18} />

                      <input
                        id="organizationName"
                        type="text"
                        value={formData.organizationName}
                        onChange={(event) =>
                          handleChange(
                            "organizationName",
                            event.target.value
                          )
                        }
                        placeholder="Enter organization name"
                      />
                    </div>

                    {errors.organizationName && (
                      <span className="admin-error">
                        {errors.organizationName}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="designation">
                      Designation
                    </label>

                    <div
                      className={inputClass(
                        "designation"
                      )}
                    >
                      <UserRound size={18} />

                      <input
                        id="designation"
                        type="text"
                        value={formData.designation}
                        onChange={(event) =>
                          handleChange(
                            "designation",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Platform Administrator"
                      />
                    </div>

                    {errors.designation && (
                      <span className="admin-error">
                        {errors.designation}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="department">
                      Department
                    </label>

                    <div
                      className={inputClass(
                        "department"
                      )}
                    >
                      <Building2 size={18} />

                      <select
                        id="department"
                        value={formData.department}
                        onChange={(event) =>
                          handleChange(
                            "department",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select department
                        </option>
                        <option value="Administration">
                          Administration
                        </option>
                        <option value="Technology">
                          Technology
                        </option>
                        <option value="Operations">
                          Operations
                        </option>
                        <option value="Innovation">
                          Innovation
                        </option>
                        <option value="Management">
                          Management
                        </option>
                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    {errors.department && (
                      <span className="admin-error">
                        {errors.department}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="organizationWebsite">
                      Organization Website
                      <span className="admin-optional">
                        Optional
                      </span>
                    </label>

                    <div className="admin-input-wrapper">
                      <Globe size={18} />

                      <input
                        id="organizationWebsite"
                        type="url"
                        value={formData.organizationWebsite}
                        onChange={(event) =>
                          handleChange(
                            "organizationWebsite",
                            event.target.value
                          )
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Access Verification</h2>
                  <p>
                    Verify that you are authorized to request
                    administrator access.
                  </p>
                </div>

                <div className="admin-security-panel">
                  <ShieldCheck size={20} />

                  <div>
                    <strong>Restricted Access</strong>
                    <p>
                      Administrator accounts should only be
                      created for authorized StartupSync
                      platform personnel.
                    </p>
                  </div>
                </div>

                <div className="admin-form-grid">

                  <div className="admin-field">
                    <label htmlFor="invitationCode">
                      Administrator Invitation Code
                    </label>

                    <div
                      className={inputClass(
                        "invitationCode"
                      )}
                    >
                      <LockKeyhole size={18} />

                      <input
                        id="invitationCode"
                        type="text"
                        value={formData.invitationCode}
                        onChange={(event) =>
                          handleChange(
                            "invitationCode",
                            event.target.value
                          )
                        }
                        placeholder="Enter invitation code"
                      />
                    </div>

                    {errors.invitationCode && (
                      <span className="admin-error">
                        {errors.invitationCode}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="verificationDocument">
                      Verification Reference
                    </label>

                    <div
                      className={inputClass(
                        "verificationDocument"
                      )}
                    >
                      <Link size={18} />

                      <input
                        id="verificationDocument"
                        type="text"
                        value={formData.verificationDocument}
                        onChange={(event) =>
                          handleChange(
                            "verificationDocument",
                            event.target.value
                          )
                        }
                        placeholder="Reference / authorization ID"
                      />
                    </div>

                    {errors.verificationDocument && (
                      <span className="admin-error">
                        {errors.verificationDocument}
                      </span>
                    )}
                  </div>

                  <div className="admin-field full-width">
                    <label htmlFor="authorizationReason">
                      Authorization Reason
                    </label>

                    <textarea
                      id="authorizationReason"
                      className={
                        errors.authorizationReason
                          ? "admin-textarea admin-textarea-error"
                          : "admin-textarea"
                      }
                      value={formData.authorizationReason}
                      onChange={(event) =>
                        handleChange(
                          "authorizationReason",
                          event.target.value
                        )
                      }
                      placeholder="Explain why administrator access is required..."
                      rows="4"
                    />

                    {errors.authorizationReason && (
                      <span className="admin-error">
                        {errors.authorizationReason}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 4 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Responsibilities</h2>
                  <p>
                    Define the areas you will manage on the
                    StartupSync platform.
                  </p>
                </div>

                <div className="admin-field full-width">
                  <label>
                    Administrative Responsibilities
                  </label>

                  <div className="admin-checkbox-grid">
                    {[
                      "User Management",
                      "Startup Management",
                      "Investor Management",
                      "Mentor Management",
                      "Student & Internship Management",
                      "Content Management",
                      "Platform Monitoring",
                      "Reports & Analytics",
                      "Notifications",
                      "System Configuration"
                    ].map((item) => (
                      <label
                        className="admin-checkbox-card"
                        key={item}
                      >
                        <input
                          type="checkbox"
                          checked={formData.responsibilities.includes(
                            item
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "responsibilities",
                              item
                            )
                          }
                        />

                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  {errors.responsibilities && (
                    <span className="admin-error">
                      {errors.responsibilities}
                    </span>
                  )}
                </div>

                <div className="admin-form-grid admin-form-grid-spaced">

                  <div className="admin-field">
                    <label htmlFor="experience">
                      Relevant Experience
                    </label>

                    <div
                      className={inputClass(
                        "experience"
                      )}
                    >
                      <UserRound size={18} />

                      <select
                        id="experience"
                        value={formData.experience}
                        onChange={(event) =>
                          handleChange(
                            "experience",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select experience
                        </option>
                        <option value="Less than 1 year">
                          Less than 1 year
                        </option>
                        <option value="1-3 years">
                          1–3 years
                        </option>
                        <option value="3-5 years">
                          3–5 years
                        </option>
                        <option value="5-10 years">
                          5–10 years
                        </option>
                        <option value="10+ years">
                          10+ years
                        </option>
                      </select>
                    </div>

                    {errors.experience && (
                      <span className="admin-error">
                        {errors.experience}
                      </span>
                    )}
                  </div>

                  <div className="admin-field full-width">
                    <label htmlFor="responsibilitiesDescription">
                      Responsibilities Description
                    </label>

                    <textarea
                      id="responsibilitiesDescription"
                      className={
                        errors.responsibilitiesDescription
                          ? "admin-textarea admin-textarea-error"
                          : "admin-textarea"
                      }
                      value={
                        formData.responsibilitiesDescription
                      }
                      onChange={(event) =>
                        handleChange(
                          "responsibilitiesDescription",
                          event.target.value
                        )
                      }
                      placeholder="Describe your expected role and responsibilities..."
                      rows="4"
                    />

                    {errors.responsibilitiesDescription && (
                      <span className="admin-error">
                        {errors.responsibilitiesDescription}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 5 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Contact & Security</h2>
                  <p>
                    Configure your contact and preferred
                    account security details.
                  </p>
                </div>

                <div className="admin-form-grid">

                  <div className="admin-field">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <div className={inputClass("phone")}>
                      <UserRound size={18} />

                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) =>
                          handleChange(
                            "phone",
                            event.target.value
                          )
                        }
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    {errors.phone && (
                      <span className="admin-error">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="location">
                      Location
                    </label>

                    <div className={inputClass("location")}>
                      <MapPin size={18} />

                      <input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(event) =>
                          handleChange(
                            "location",
                            event.target.value
                          )
                        }
                        placeholder="City, State, Country"
                      />
                    </div>

                    {errors.location && (
                      <span className="admin-error">
                        {errors.location}
                      </span>
                    )}
                  </div>

                  <div className="admin-field full-width">
                    <label htmlFor="securityPreference">
                      Security Preference
                    </label>

                    <div
                      className={inputClass(
                        "securityPreference"
                      )}
                    >
                      <ShieldCheck size={18} />

                      <select
                        id="securityPreference"
                        value={formData.securityPreference}
                        onChange={(event) =>
                          handleChange(
                            "securityPreference",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select security preference
                        </option>
                        <option value="Email Verification">
                          Email Verification
                        </option>
                        <option value="Two-Factor Authentication">
                          Two-Factor Authentication
                        </option>
                        <option value="Authenticator App">
                          Authenticator App
                        </option>
                      </select>
                    </div>

                    {errors.securityPreference && (
                      <span className="admin-error">
                        {errors.securityPreference}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 6 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Platform Permissions</h2>
                  <p>
                    Select the areas that require administrative
                    access.
                  </p>
                </div>

                <div className="admin-field full-width">
                  <label>
                    Permission Areas
                  </label>

                  <div className="admin-checkbox-grid">
                    {[
                      "Dashboard & Analytics",
                      "User Accounts",
                      "Startup Profiles",
                      "Investor Profiles",
                      "Mentor Profiles",
                      "Student Profiles",
                      "Incubator Profiles",
                      "Internships & Opportunities",
                      "Reports",
                      "Notifications",
                      "Content & Resources",
                      "System Settings"
                    ].map((item) => (
                      <label
                        className="admin-checkbox-card"
                        key={item}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(
                            item
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "permissions",
                              item
                            )
                          }
                        />

                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  {errors.permissions && (
                    <span className="admin-error">
                      {errors.permissions}
                    </span>
                  )}
                </div>

                <div className="admin-permission-note">
                  <ShieldCheck size={17} />

                  <span>
                    Final permissions should be assigned by
                    the platform owner or authorized system
                    administrator.
                  </span>
                </div>

              </section>
            )}

            {currentStep === 7 && (
              <section className="admin-form-step">

                <div className="admin-step-heading">
                  <h2>Final Verification</h2>
                  <p>
                    Complete your profile and acknowledge the
                    administrator access requirements.
                  </p>
                </div>

                <div className="admin-form-grid">

                  <div className="admin-field full-width">
                    <label htmlFor="bio">
                      Administrator Profile
                    </label>

                    <textarea
                      id="bio"
                      className={
                        errors.bio
                          ? "admin-textarea admin-textarea-error"
                          : "admin-textarea"
                      }
                      value={formData.bio}
                      onChange={(event) =>
                        handleChange(
                          "bio",
                          event.target.value
                        )
                      }
                      placeholder="Briefly describe your role and experience..."
                      rows="5"
                    />

                    {errors.bio && (
                      <span className="admin-error">
                        {errors.bio}
                      </span>
                    )}
                  </div>

                  <div className="admin-field">
                    <label htmlFor="linkedin">
                      LinkedIn Profile
                      <span className="admin-optional">
                        Optional
                      </span>
                    </label>

                    <div className="admin-input-wrapper">
                      <Link size={18} />

                      <input
                        id="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={(event) =>
                          handleChange(
                            "linkedin",
                            event.target.value
                          )
                        }
                        placeholder="LinkedIn URL"
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label>
                      Account Status
                    </label>

                    <div className="admin-status-box">
                      <CheckCircle2 size={18} />

                      <span>
                        Ready for verification
                      </span>
                    </div>
                  </div>

                  <div className="admin-field full-width">
                    <label className="admin-acknowledgement">
                      <input
                        type="checkbox"
                        checked={formData.acknowledgement}
                        onChange={(event) =>
                          handleChange(
                            "acknowledgement",
                            event.target.checked
                          )
                        }
                      />

                      <span>
                        I confirm that the information
                        provided is accurate and that I am
                        authorized to request administrator
                        access to StartupSync.
                      </span>
                    </label>

                    {errors.acknowledgement && (
                      <span className="admin-error">
                        {errors.acknowledgement}
                      </span>
                    )}
                  </div>

                </div>

              </section>
            )}

            <div className="admin-form-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Administrator Request
                  <CheckCircle2 size={18} />
                </button>
              )}

            </div>

          </form>

          <div className="admin-signup-footer">
            <span>
              Already have an administrator account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login/admin")
              }
            >
              Sign in
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default AdminSignup;