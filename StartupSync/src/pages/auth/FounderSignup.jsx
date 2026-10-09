import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Link as LinkIcon,
  LockKeyhole,
  Mail,
  Phone,
  Rocket,
  UserRound,
  UsersRound,
  Wallet
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import SignupProgress from "../../components/auth/SignupProgress";

import "./FounderSignup.css";

const totalSteps = 7;

function FounderSignup() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    profilePhoto: "",

    education: "",
    institution: "",
    skills: "",
    experience: "",

    startupName: "",
    domain: "",
    startupStage: "",
    startupDescription: "",
    problem: "",
    solution: "",

    industry: "",
    location: "",
    teamSize: "",
    foundedYear: "",

    fundingStage: "",
    fundingAmount: "",
    fundingPurpose: "",

    lookingFor: [],

    website: "",
    linkedin: "",
    github: "",
    demo: ""
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

  const handleCheckboxChange = (value) => {
    setFormData((previous) => {
      const exists = previous.lookingFor.includes(value);

      return {
        ...previous,
        lookingFor: exists
          ? previous.lookingFor.filter(
              (item) => item !== value
            )
          : [...previous.lookingFor, value]
      };
    });

    setErrors((previous) => ({
      ...previous,
      lookingFor: ""
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      }

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
      } else if (formData.password.length < 8) {
        newErrors.password =
          "Password must contain at least 8 characters.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "Please confirm your password.";
      } else if (
        formData.password !==
        formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match.";
      }

      if (!formData.phone.trim()) {
        newErrors.phone =
          "Phone number is required.";
      }
    }

    if (currentStep === 2) {
      if (!formData.education.trim()) {
        newErrors.education =
          "Education is required.";
      }

      if (!formData.institution.trim()) {
        newErrors.institution =
          "Institution is required.";
      }

      if (!formData.skills.trim()) {
        newErrors.skills =
          "Please enter your skills.";
      }
    }

    if (currentStep === 3) {
      if (!formData.startupName.trim()) {
        newErrors.startupName =
          "Startup name is required.";
      }

      if (!formData.domain.trim()) {
        newErrors.domain =
          "Startup domain is required.";
      }

      if (!formData.startupStage) {
        newErrors.startupStage =
          "Please select the startup stage.";
      }

      if (!formData.startupDescription.trim()) {
        newErrors.startupDescription =
          "Startup description is required.";
      }

      if (!formData.problem.trim()) {
        newErrors.problem =
          "Please describe the problem.";
      }

      if (!formData.solution.trim()) {
        newErrors.solution =
          "Please describe your solution.";
      }
    }

    if (currentStep === 4) {
      if (!formData.industry) {
        newErrors.industry =
          "Please select an industry.";
      }

      if (!formData.location.trim()) {
        newErrors.location =
          "Location is required.";
      }

      if (!formData.teamSize) {
        newErrors.teamSize =
          "Please select team size.";
      }

      if (!formData.foundedYear) {
        newErrors.foundedYear =
          "Founded year is required.";
      }
    }

    if (currentStep === 5) {
      if (!formData.fundingStage) {
        newErrors.fundingStage =
          "Please select funding stage.";
      }

      if (!formData.fundingAmount.trim()) {
        newErrors.fundingAmount =
          "Funding amount is required.";
      }

      if (!formData.fundingPurpose.trim()) {
        newErrors.fundingPurpose =
          "Please describe the funding purpose.";
      }
    }

    if (currentStep === 6) {
      if (formData.lookingFor.length === 0) {
        newErrors.lookingFor =
          "Select at least one option.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(
        (previous) => previous + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({});

      setCurrentStep(
        (previous) => previous - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    console.log(
      "Founder signup data:",
      formData
    );

    alert(
      "Founder account form completed successfully."
    );
  };

  return (
    <main className="founder-signup-page">

      <div className="founder-signup-container">

        <div className="founder-signup-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="founder-signup-card">

          <div className="founder-signup-header">

            <div className="founder-signup-icon">
              <Rocket size={27} />
            </div>

            <span className="founder-signup-badge">
              Startup Founder Registration
            </span>

            <h1>Create Your Founder Account</h1>

            <p>
              Tell us about yourself and your startup
              to create your personalized StartupSync
              founder profile.
            </p>

          </div>

          <SignupProgress
            currentStep={currentStep}
          />

          <form
            className="founder-signup-form"
            onSubmit={handleSubmit}
          >

            {currentStep === 1 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <UserRound size={20} />

                  <div>
                    <h2>Account Information</h2>

                    <p>
                      Create your basic StartupSync
                      account.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="fullName">
                      Full Name
                      <span>*</span>
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={
                        errors.fullName
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.fullName && (
                      <small>
                        {errors.fullName}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="email">
                      Email
                      <span>*</span>
                    </label>

                    <div className="signup-input-with-icon">
                      <Mail size={17} />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className={
                          errors.email
                            ? "input-error"
                            : ""
                        }
                      />
                    </div>

                    {errors.email && (
                      <small>
                        {errors.email}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="password">
                      Password
                      <span>*</span>
                    </label>

                    <div className="signup-input-with-icon">
                      <LockKeyhole size={17} />

                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className={
                          errors.password
                            ? "input-error"
                            : ""
                        }
                      />
                    </div>

                    {errors.password && (
                      <small>
                        {errors.password}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="confirmPassword">
                      Confirm Password
                      <span>*</span>
                    </label>

                    <div className="signup-input-with-icon">
                      <LockKeyhole size={17} />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={
                          formData.confirmPassword
                        }
                        onChange={handleChange}
                        className={
                          errors.confirmPassword
                            ? "input-error"
                            : ""
                        }
                      />
                    </div>

                    {errors.confirmPassword && (
                      <small>
                        {errors.confirmPassword}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="phone">
                      Phone Number
                      <span>*</span>
                    </label>

                    <div className="signup-input-with-icon">
                      <Phone size={17} />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={
                          errors.phone
                            ? "input-error"
                            : ""
                        }
                      />
                    </div>

                    {errors.phone && (
                      <small>
                        {errors.phone}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="profilePhoto">
                      Profile Photo
                    </label>

                    <input
                      id="profilePhoto"
                      name="profilePhoto"
                      type="text"
                      placeholder="Profile photo URL"
                      value={formData.profilePhoto}
                      onChange={handleChange}
                    />
                  </div>

                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <GraduationCap size={20} />

                  <div>
                    <h2>Education & Skills</h2>

                    <p>
                      Add your educational background
                      and professional skills.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="education">
                      Highest Education
                      <span>*</span>
                    </label>

                    <select
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className={
                        errors.education
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select education
                      </option>
                      <option value="diploma">
                        Diploma
                      </option>
                      <option value="bachelor">
                        Bachelor's Degree
                      </option>
                      <option value="master">
                        Master's Degree
                      </option>
                      <option value="phd">
                        PhD
                      </option>
                      <option value="other">
                        Other
                      </option>
                    </select>

                    {errors.education && (
                      <small>
                        {errors.education}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="institution">
                      Institution
                      <span>*</span>
                    </label>

                    <input
                      id="institution"
                      name="institution"
                      type="text"
                      placeholder="College or university"
                      value={formData.institution}
                      onChange={handleChange}
                      className={
                        errors.institution
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.institution && (
                      <small>
                        {errors.institution}
                      </small>
                    )}
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="skills">
                      Skills
                      <span>*</span>
                    </label>

                    <input
                      id="skills"
                      name="skills"
                      type="text"
                      placeholder="e.g. React, Node.js, Marketing, Product Management"
                      value={formData.skills}
                      onChange={handleChange}
                      className={
                        errors.skills
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.skills && (
                      <small>
                        {errors.skills}
                      </small>
                    )}
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="experience">
                      Experience
                    </label>

                    <textarea
                      id="experience"
                      name="experience"
                      rows="3"
                      placeholder="Briefly describe your previous experience"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>

                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <Rocket size={20} />

                  <div>
                    <h2>Startup Information</h2>

                    <p>
                      Tell us about the startup you
                      are building.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="startupName">
                      Startup Name
                      <span>*</span>
                    </label>

                    <input
                      id="startupName"
                      name="startupName"
                      type="text"
                      placeholder="Enter startup name"
                      value={formData.startupName}
                      onChange={handleChange}
                      className={
                        errors.startupName
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.startupName && (
                      <small>
                        {errors.startupName}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="domain">
                      Startup Domain
                      <span>*</span>
                    </label>

                    <input
                      id="domain"
                      name="domain"
                      type="text"
                      placeholder="e.g. FinTech, EdTech, HealthTech"
                      value={formData.domain}
                      onChange={handleChange}
                      className={
                        errors.domain
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.domain && (
                      <small>
                        {errors.domain}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="startupStage">
                      Startup Stage
                      <span>*</span>
                    </label>

                    <select
                      id="startupStage"
                      name="startupStage"
                      value={formData.startupStage}
                      onChange={handleChange}
                      className={
                        errors.startupStage
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select stage
                      </option>
                      <option value="idea">
                        Idea
                      </option>
                      <option value="prototype">
                        Prototype
                      </option>
                      <option value="mvp">
                        MVP
                      </option>
                      <option value="early-revenue">
                        Early Revenue
                      </option>
                      <option value="growth">
                        Growth
                      </option>
                    </select>

                    {errors.startupStage && (
                      <small>
                        {errors.startupStage}
                      </small>
                    )}
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="startupDescription">
                      Startup Description
                      <span>*</span>
                    </label>

                    <textarea
                      id="startupDescription"
                      name="startupDescription"
                      rows="3"
                      placeholder="Describe your startup"
                      value={
                        formData.startupDescription
                      }
                      onChange={handleChange}
                      className={
                        errors.startupDescription
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.startupDescription && (
                      <small>
                        {errors.startupDescription}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="problem">
                      Problem
                      <span>*</span>
                    </label>

                    <textarea
                      id="problem"
                      name="problem"
                      rows="3"
                      placeholder="What problem are you solving?"
                      value={formData.problem}
                      onChange={handleChange}
                      className={
                        errors.problem
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.problem && (
                      <small>
                        {errors.problem}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="solution">
                      Solution
                      <span>*</span>
                    </label>

                    <textarea
                      id="solution"
                      name="solution"
                      rows="3"
                      placeholder="How does your startup solve it?"
                      value={formData.solution}
                      onChange={handleChange}
                      className={
                        errors.solution
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.solution && (
                      <small>
                        {errors.solution}
                      </small>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 4 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <Building2 size={20} />

                  <div>
                    <h2>Startup Details</h2>

                    <p>
                      Add additional information about
                      your startup.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="industry">
                      Industry
                      <span>*</span>
                    </label>

                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className={
                        errors.industry
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select industry
                      </option>
                      <option value="technology">
                        Technology
                      </option>
                      <option value="fintech">
                        FinTech
                      </option>
                      <option value="edtech">
                        EdTech
                      </option>
                      <option value="healthtech">
                        HealthTech
                      </option>
                      <option value="ecommerce">
                        E-Commerce
                      </option>
                      <option value="agritech">
                        AgriTech
                      </option>
                      <option value="other">
                        Other
                      </option>
                    </select>

                    {errors.industry && (
                      <small>
                        {errors.industry}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="location">
                      Location
                      <span>*</span>
                    </label>

                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
                      className={
                        errors.location
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.location && (
                      <small>
                        {errors.location}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="teamSize">
                      Team Size
                      <span>*</span>
                    </label>

                    <select
                      id="teamSize"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className={
                        errors.teamSize
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select team size
                      </option>
                      <option value="1">
                        Just me
                      </option>
                      <option value="2-5">
                        2–5 members
                      </option>
                      <option value="6-10">
                        6–10 members
                      </option>
                      <option value="11-25">
                        11–25 members
                      </option>
                      <option value="25+">
                        25+ members
                      </option>
                    </select>

                    {errors.teamSize && (
                      <small>
                        {errors.teamSize}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="foundedYear">
                      Founded Year
                      <span>*</span>
                    </label>

                    <input
                      id="foundedYear"
                      name="foundedYear"
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder="e.g. 2026"
                      value={formData.foundedYear}
                      onChange={handleChange}
                      className={
                        errors.foundedYear
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.foundedYear && (
                      <small>
                        {errors.foundedYear}
                      </small>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 5 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <Wallet size={20} />

                  <div>
                    <h2>Funding Information</h2>

                    <p>
                      Tell us about your current funding
                      requirements.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="fundingStage">
                      Funding Stage
                      <span>*</span>
                    </label>

                    <select
                      id="fundingStage"
                      name="fundingStage"
                      value={formData.fundingStage}
                      onChange={handleChange}
                      className={
                        errors.fundingStage
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select funding stage
                      </option>
                      <option value="bootstrapped">
                        Bootstrapped
                      </option>
                      <option value="pre-seed">
                        Pre-Seed
                      </option>
                      <option value="seed">
                        Seed
                      </option>
                      <option value="series-a">
                        Series A
                      </option>
                      <option value="series-b">
                        Series B+
                      </option>
                    </select>

                    {errors.fundingStage && (
                      <small>
                        {errors.fundingStage}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="fundingAmount">
                      Funding Amount
                      <span>*</span>
                    </label>

                    <input
                      id="fundingAmount"
                      name="fundingAmount"
                      type="text"
                      placeholder="e.g. ₹25 Lakhs"
                      value={formData.fundingAmount}
                      onChange={handleChange}
                      className={
                        errors.fundingAmount
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.fundingAmount && (
                      <small>
                        {errors.fundingAmount}
                      </small>
                    )}
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="fundingPurpose">
                      Funding Purpose
                      <span>*</span>
                    </label>

                    <textarea
                      id="fundingPurpose"
                      name="fundingPurpose"
                      rows="4"
                      placeholder="Explain how you plan to use the funding"
                      value={formData.fundingPurpose}
                      onChange={handleChange}
                      className={
                        errors.fundingPurpose
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.fundingPurpose && (
                      <small>
                        {errors.fundingPurpose}
                      </small>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 6 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <UsersRound size={20} />

                  <div>
                    <h2>What Are You Looking For?</h2>

                    <p>
                      Select the people and resources
                      that can help your startup.
                    </p>
                  </div>
                </div>

                <div className="looking-for-grid">

                  {[
                    "Investors",
                    "Mentors",
                    "Co-founders",
                    "Developers",
                    "Designers",
                    "Marketing Experts",
                    "Business Advisors",
                    "Incubators"
                  ].map((item) => (
                    <label
                      key={item}
                      className={`looking-for-option ${
                        formData.lookingFor.includes(
                          item
                        )
                          ? "looking-for-selected"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.lookingFor.includes(
                          item
                        )}
                        onChange={() =>
                          handleCheckboxChange(item)
                        }
                      />

                      <span>
                        {item}
                      </span>
                    </label>
                  ))}

                </div>

                {errors.lookingFor && (
                  <small className="step-level-error">
                    {errors.lookingFor}
                  </small>
                )}

              </section>
            )}

            {currentStep === 7 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <LinkIcon size={20} />

                  <div>
                    <h2>Startup Links</h2>

                    <p>
                      Add links where people can learn
                      more about you and your startup.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="website">
                      Website
                    </label>

                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourstartup.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="linkedin">
                      LinkedIn
                    </label>

                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      placeholder="LinkedIn profile URL"
                      value={formData.linkedin}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="github">
                      GitHub
                    </label>

                    <input
                      id="github"
                      name="github"
                      type="url"
                      placeholder="GitHub profile URL"
                      value={formData.github}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="demo">
                      Product Demo
                    </label>

                    <input
                      id="demo"
                      name="demo"
                      type="url"
                      placeholder="Demo or product URL"
                      value={formData.demo}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="signup-completion-message">
                  <CheckCircle2 size={20} />

                  <div>
                    <strong>
                      You're almost ready!
                    </strong>

                    <p>
                      Review your information and
                      create your Founder account.
                    </p>
                  </div>
                </div>

              </section>
            )}

            <div className="signup-form-navigation">

              <button
                type="button"
                className="signup-back-button"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className="signup-next-button"
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="signup-create-button"
                >
                  Create Founder Account
                  <CheckCircle2 size={18} />
                </button>
              )}

            </div>

          </form>

          <div className="founder-signup-login">

            <span>
              Already have a Founder account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login/founder")
              }
            >
              Sign in
            </button>

          </div>

        </div>

        <div className="founder-signup-footer">
          <span>StartupSync</span>
          <span>•</span>
          <span>
            AI-Driven Startup Ecosystem
          </span>
        </div>

      </div>

    </main>
  );
}

export default FounderSignup;