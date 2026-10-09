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
  UserRound
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import SignupProgress from "../../components/auth/SignupProgress";

import "./IncubatorSignup.css";

const initialFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",

  organizationName: "",
  organizationType: "",
  registrationNumber: "",
  organizationWebsite: "",

  programTypes: [],
  supportedStages: [],
  industries: "",
  programDescription: "",

  startupsSupported: "",
  cohortSize: "",
  fundingSupport: "",
  fundingRange: "",

  location: "",
  coverage: "",
  availability: "",
  programFormat: "",

  lookingFor: [],

  bio: "",
  linkedin: "",
  website: "",
  applicationUrl: ""
};

function IncubatorSignup() {
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

      if (!formData.organizationType) {
        newErrors.organizationType =
          "Select the organization type.";
      }
    }

    if (currentStep === 3) {
      if (formData.programTypes.length === 0) {
        newErrors.programTypes =
          "Select at least one program type.";
      }

      if (formData.supportedStages.length === 0) {
        newErrors.supportedStages =
          "Select at least one startup stage.";
      }

      if (!formData.industries.trim()) {
        newErrors.industries =
          "Enter the industries you support.";
      }

      if (!formData.programDescription.trim()) {
        newErrors.programDescription =
          "Describe your incubation programs.";
      }
    }

    if (currentStep === 4) {
      if (!formData.startupsSupported) {
        newErrors.startupsSupported =
          "Select the number of startups supported.";
      }

      if (!formData.cohortSize) {
        newErrors.cohortSize =
          "Select the typical cohort size.";
      }

      if (!formData.fundingSupport) {
        newErrors.fundingSupport =
          "Select your funding support.";
      }

      if (
        formData.fundingSupport !== "No Direct Funding" &&
        !formData.fundingRange
      ) {
        newErrors.fundingRange =
          "Select the funding range.";
      }
    }

    if (currentStep === 5) {
      if (!formData.location.trim()) {
        newErrors.location =
          "Location is required.";
      }

      if (!formData.coverage) {
        newErrors.coverage =
          "Select your geographic coverage.";
      }

      if (!formData.availability) {
        newErrors.availability =
          "Select your availability.";
      }

      if (!formData.programFormat) {
        newErrors.programFormat =
          "Select the program format.";
      }
    }

    if (currentStep === 6) {
      if (formData.lookingFor.length === 0) {
        newErrors.lookingFor =
          "Select at least one option.";
      }
    }

    if (currentStep === 7) {
      if (!formData.bio.trim()) {
        newErrors.bio =
          "Organization description is required.";
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

    alert("Incubator account form completed successfully.");

    console.log("Incubator Signup Data:", formData);
  };

  const inputClass = (field) =>
    `signup-input-wrapper ${
      errors[field] ? "signup-input-error" : ""
    }`;

  return (
    <main className="incubator-signup-page">
      <div className="incubator-signup-container">

        <div className="incubator-signup-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="incubator-signup-card">

          <div className="incubator-signup-header">
            <div className="incubator-signup-icon">
              <Building2 size={27} />
            </div>

            <span className="incubator-signup-badge">
              Incubator Registration
            </span>

            <h1>Create Your Incubator Account</h1>

            <p>
              Build your incubator profile and connect with
              startups, founders and innovation programs
              through StartupSync.
            </p>
          </div>

          <SignupProgress currentStep={currentStep} />

          <form
            className="incubator-signup-form"
            onSubmit={handleSubmit}
          >

            {currentStep === 1 && (
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>Account Information</h2>
                  <p>
                    Create the primary account for your
                    incubator organization.
                  </p>
                </div>

                <div className="incubator-form-grid">

                  <div className="signup-field full-width">
                    <label htmlFor="fullName">
                      Contact Person Name
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
                        placeholder="Enter contact person's name"
                      />
                    </div>

                    {errors.fullName && (
                      <span className="signup-error">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="email">
                      Email Address
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
                        placeholder="incubator@example.com"
                      />
                    </div>

                    {errors.email && (
                      <span className="signup-error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
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
                      <span className="signup-error">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
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
                      <span className="signup-error">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>Organization Profile</h2>
                  <p>
                    Tell us about the incubator or organization
                    you represent.
                  </p>
                </div>

                <div className="incubator-form-grid">

                  <div className="signup-field">
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
                      <span className="signup-error">
                        {errors.organizationName}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="organizationType">
                      Organization Type
                    </label>

                    <div
                      className={inputClass(
                        "organizationType"
                      )}
                    >
                      <Building2 size={18} />

                      <select
                        id="organizationType"
                        value={formData.organizationType}
                        onChange={(event) =>
                          handleChange(
                            "organizationType",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select organization type
                        </option>
                        <option value="Startup Incubator">
                          Startup Incubator
                        </option>
                        <option value="University Incubator">
                          University Incubator
                        </option>
                        <option value="Government Incubator">
                          Government Incubator
                        </option>
                        <option value="Corporate Incubator">
                          Corporate Incubator
                        </option>
                        <option value="Technology Incubator">
                          Technology Incubator
                        </option>
                        <option value="Innovation Center">
                          Innovation Center
                        </option>
                      </select>
                    </div>

                    {errors.organizationType && (
                      <span className="signup-error">
                        {errors.organizationType}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="registrationNumber">
                      Registration Number
                      <span className="optional-label">
                        Optional
                      </span>
                    </label>

                    <div className="signup-input-wrapper">
                      <Building2 size={18} />

                      <input
                        id="registrationNumber"
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(event) =>
                          handleChange(
                            "registrationNumber",
                            event.target.value
                          )
                        }
                        placeholder="Registration / recognition number"
                      />
                    </div>
                  </div>

                  <div className="signup-field">
                    <label htmlFor="organizationWebsite">
                      Organization Website
                      <span className="optional-label">
                        Optional
                      </span>
                    </label>

                    <div className="signup-input-wrapper">
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
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>Programs & Focus Areas</h2>
                  <p>
                    Define the programs and startup segments
                    supported by your incubator.
                  </p>
                </div>

                <div className="incubator-form-grid">

                  <div className="signup-field full-width">
                    <label>
                      Program Types
                    </label>

                    <div className="incubator-checkbox-grid">
                      {[
                        "Incubation",
                        "Acceleration",
                        "Pre-Incubation",
                        "Innovation Program",
                        "Startup Bootcamp",
                        "Entrepreneurship Program"
                      ].map((item) => (
                        <label
                          className="incubator-checkbox-card"
                          key={item}
                        >
                          <input
                            type="checkbox"
                            checked={formData.programTypes.includes(
                              item
                            )}
                            onChange={() =>
                              handleCheckboxChange(
                                "programTypes",
                                item
                              )
                            }
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>

                    {errors.programTypes && (
                      <span className="signup-error">
                        {errors.programTypes}
                      </span>
                    )}
                  </div>

                  <div className="signup-field full-width">
                    <label>
                      Supported Startup Stages
                    </label>

                    <div className="incubator-checkbox-grid">
                      {[
                        "Idea Stage",
                        "Pre-Seed",
                        "Seed",
                        "Early Growth",
                        "Growth Stage"
                      ].map((item) => (
                        <label
                          className="incubator-checkbox-card"
                          key={item}
                        >
                          <input
                            type="checkbox"
                            checked={formData.supportedStages.includes(
                              item
                            )}
                            onChange={() =>
                              handleCheckboxChange(
                                "supportedStages",
                                item
                              )
                            }
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>

                    {errors.supportedStages && (
                      <span className="signup-error">
                        {errors.supportedStages}
                      </span>
                    )}
                  </div>

                  <div className="signup-field full-width">
                    <label htmlFor="industries">
                      Industries Supported
                    </label>

                    <div
                      className={inputClass("industries")}
                    >
                      <Building2 size={18} />

                      <input
                        id="industries"
                        type="text"
                        value={formData.industries}
                        onChange={(event) =>
                          handleChange(
                            "industries",
                            event.target.value
                          )
                        }
                        placeholder="e.g. SaaS, FinTech, HealthTech, EdTech"
                      />
                    </div>

                    {errors.industries && (
                      <span className="signup-error">
                        {errors.industries}
                      </span>
                    )}
                  </div>

                  <div className="signup-field full-width">
                    <label htmlFor="programDescription">
                      Program Description
                    </label>

                    <textarea
                      id="programDescription"
                      className={
                        errors.programDescription
                          ? "signup-textarea signup-textarea-error"
                          : "signup-textarea"
                      }
                      value={formData.programDescription}
                      onChange={(event) =>
                        handleChange(
                          "programDescription",
                          event.target.value
                        )
                      }
                      placeholder="Describe your incubation or acceleration programs..."
                      rows="4"
                    />

                    {errors.programDescription && (
                      <span className="signup-error">
                        {errors.programDescription}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 4 && (
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>Capacity & Funding</h2>
                  <p>
                    Provide information about your startup
                    support capacity and funding assistance.
                  </p>
                </div>

                <div className="incubator-form-grid">

                  <div className="signup-field">
                    <label htmlFor="startupsSupported">
                      Startups Supported
                    </label>

                    <div
                      className={inputClass(
                        "startupsSupported"
                      )}
                    >
                      <Building2 size={18} />

                      <select
                        id="startupsSupported"
                        value={formData.startupsSupported}
                        onChange={(event) =>
                          handleChange(
                            "startupsSupported",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select capacity
                        </option>
                        <option value="1-10">
                          1–10 startups
                        </option>
                        <option value="11-25">
                          11–25 startups
                        </option>
                        <option value="26-50">
                          26–50 startups
                        </option>
                        <option value="51-100">
                          51–100 startups
                        </option>
                        <option value="100+">
                          100+ startups
                        </option>
                      </select>
                    </div>

                    {errors.startupsSupported && (
                      <span className="signup-error">
                        {errors.startupsSupported}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="cohortSize">
                      Typical Cohort Size
                    </label>

                    <div
                      className={inputClass("cohortSize")}
                    >
                      <Building2 size={18} />

                      <select
                        id="cohortSize"
                        value={formData.cohortSize}
                        onChange={(event) =>
                          handleChange(
                            "cohortSize",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select cohort size
                        </option>
                        <option value="1-10">
                          1–10 startups
                        </option>
                        <option value="11-25">
                          11–25 startups
                        </option>
                        <option value="26-50">
                          26–50 startups
                        </option>
                        <option value="50+">
                          50+ startups
                        </option>
                      </select>
                    </div>

                    {errors.cohortSize && (
                      <span className="signup-error">
                        {errors.cohortSize}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="fundingSupport">
                      Funding Support
                    </label>

                    <div
                      className={inputClass(
                        "fundingSupport"
                      )}
                    >
                      <Building2 size={18} />

                      <select
                        id="fundingSupport"
                        value={formData.fundingSupport}
                        onChange={(event) =>
                          handleChange(
                            "fundingSupport",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select funding support
                        </option>
                        <option value="Direct Funding">
                          Direct Funding
                        </option>
                        <option value="Grant Support">
                          Grant Support
                        </option>
                        <option value="Investor Connections">
                          Investor Connections
                        </option>
                        <option value="Multiple Sources">
                          Multiple Sources
                        </option>
                        <option value="No Direct Funding">
                          No Direct Funding
                        </option>
                      </select>
                    </div>

                    {errors.fundingSupport && (
                      <span className="signup-error">
                        {errors.fundingSupport}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="fundingRange">
                      Funding Range
                    </label>

                    <div
                      className={inputClass("fundingRange")}
                    >
                      <Building2 size={18} />

                      <select
                        id="fundingRange"
                        value={formData.fundingRange}
                        onChange={(event) =>
                          handleChange(
                            "fundingRange",
                            event.target.value
                          )
                        }
                        disabled={
                          formData.fundingSupport ===
                          "No Direct Funding"
                        }
                      >
                        <option value="">
                          Select funding range
                        </option>
                        <option value="Under ₹5 Lakhs">
                          Under ₹5 Lakhs
                        </option>
                        <option value="₹5–25 Lakhs">
                          ₹5–25 Lakhs
                        </option>
                        <option value="₹25–50 Lakhs">
                          ₹25–50 Lakhs
                        </option>
                        <option value="₹50 Lakhs–₹1 Crore">
                          ₹50 Lakhs–₹1 Crore
                        </option>
                        <option value="₹1 Crore+">
                          ₹1 Crore+
                        </option>
                      </select>
                    </div>

                    {errors.fundingRange && (
                      <span className="signup-error">
                        {errors.fundingRange}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 5 && (
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>Location & Availability</h2>
                  <p>
                    Tell startups where and how they can
                    access your programs.
                  </p>
                </div>

                <div className="incubator-form-grid">

                  <div className="signup-field">
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
                      <span className="signup-error">
                        {errors.location}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="coverage">
                      Geographic Coverage
                    </label>

                    <div className={inputClass("coverage")}>
                      <MapPin size={18} />

                      <select
                        id="coverage"
                        value={formData.coverage}
                        onChange={(event) =>
                          handleChange(
                            "coverage",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select coverage
                        </option>
                        <option value="Local">
                          Local / City
                        </option>
                        <option value="State">
                          State
                        </option>
                        <option value="National">
                          Across India
                        </option>
                        <option value="International">
                          International
                        </option>
                      </select>
                    </div>

                    {errors.coverage && (
                      <span className="signup-error">
                        {errors.coverage}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="availability">
                      Application Availability
                    </label>

                    <div
                      className={inputClass("availability")}
                    >
                      <Building2 size={18} />

                      <select
                        id="availability"
                        value={formData.availability}
                        onChange={(event) =>
                          handleChange(
                            "availability",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select availability
                        </option>
                        <option value="Always Open">
                          Always Open
                        </option>
                        <option value="Quarterly">
                          Quarterly
                        </option>
                        <option value="Twice a Year">
                          Twice a Year
                        </option>
                        <option value="Once a Year">
                          Once a Year
                        </option>
                        <option value="Event Based">
                          Event Based
                        </option>
                      </select>
                    </div>

                    {errors.availability && (
                      <span className="signup-error">
                        {errors.availability}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="programFormat">
                      Program Format
                    </label>

                    <div
                      className={inputClass(
                        "programFormat"
                      )}
                    >
                      <Building2 size={18} />

                      <select
                        id="programFormat"
                        value={formData.programFormat}
                        onChange={(event) =>
                          handleChange(
                            "programFormat",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select program format
                        </option>
                        <option value="In-Person">
                          In-Person
                        </option>
                        <option value="Online">
                          Online
                        </option>
                        <option value="Hybrid">
                          Hybrid
                        </option>
                      </select>
                    </div>

                    {errors.programFormat && (
                      <span className="signup-error">
                        {errors.programFormat}
                      </span>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 6 && (
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>What Are You Looking For?</h2>
                  <p>
                    Select the ecosystem connections you want
                    to build through StartupSync.
                  </p>
                </div>

                <div className="signup-field full-width">
                  <label>
                    Looking For
                  </label>

                  <div className="incubator-checkbox-grid">
                    {[
                      "Promising Startups",
                      "Startup Founders",
                      "Mentors",
                      "Investors",
                      "Co-Investors",
                      "Corporate Partners",
                      "Technology Partners",
                      "Service Providers",
                      "Government Programs",
                      "Startup Events"
                    ].map((item) => (
                      <label
                        className="incubator-checkbox-card"
                        key={item}
                      >
                        <input
                          type="checkbox"
                          checked={formData.lookingFor.includes(
                            item
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "lookingFor",
                              item
                            )
                          }
                        />

                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  {errors.lookingFor && (
                    <span className="signup-error">
                      {errors.lookingFor}
                    </span>
                  )}
                </div>
              </section>
            )}

            {currentStep === 7 && (
              <section className="incubator-form-step">
                <div className="incubator-step-heading">
                  <h2>Profile & Links</h2>
                  <p>
                    Complete your public incubator profile
                    before joining StartupSync.
                  </p>
                </div>

                <div className="incubator-form-grid">

                  <div className="signup-field full-width">
                    <label htmlFor="bio">
                      About Your Organization
                    </label>

                    <textarea
                      id="bio"
                      className={
                        errors.bio
                          ? "signup-textarea signup-textarea-error"
                          : "signup-textarea"
                      }
                      value={formData.bio}
                      onChange={(event) =>
                        handleChange(
                          "bio",
                          event.target.value
                        )
                      }
                      placeholder="Tell startups about your organization, programs, support and ecosystem..."
                      rows="5"
                    />

                    {errors.bio && (
                      <span className="signup-error">
                        {errors.bio}
                      </span>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="linkedin">
                      LinkedIn Profile
                    </label>

                    <div className="signup-input-wrapper">
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

                  <div className="signup-field">
                    <label htmlFor="website">
                      Website
                    </label>

                    <div className="signup-input-wrapper">
                      <Globe size={18} />

                      <input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(event) =>
                          handleChange(
                            "website",
                            event.target.value
                          )
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="signup-field full-width">
                    <label htmlFor="applicationUrl">
                      Startup Application URL
                    </label>

                    <div className="signup-input-wrapper">
                      <Globe size={18} />

                      <input
                        id="applicationUrl"
                        type="url"
                        value={formData.applicationUrl}
                        onChange={(event) =>
                          handleChange(
                            "applicationUrl",
                            event.target.value
                          )
                        }
                        placeholder="https://example.com/apply"
                      />
                    </div>
                  </div>

                </div>
              </section>
            )}

            <div className="incubator-form-actions">

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
                  Create Incubator Account
                  <CheckCircle2 size={18} />
                </button>
              )}

            </div>

          </form>

          <div className="incubator-signup-footer">
            <span>
              Already have an incubator account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login/incubator")
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

export default IncubatorSignup;