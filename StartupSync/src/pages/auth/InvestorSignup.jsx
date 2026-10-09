import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Link as LinkIcon,
  LockKeyhole,
  Mail,
  MapPin,
  TrendingUp,
  UserRound,
  UsersRound,
  Wallet
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import SignupProgress from "../../components/auth/SignupProgress";

import "./InvestorSignup.css";

const steps = [
  "Account",
  "Profile",
  "Preferences",
  "Experience",
  "Location",
  "Looking For",
  "Links"
];

function InvestorSignup() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",

    investorType: "",
    organization: "",
    industries: "",
    investmentStages: [],

    investmentRange: "",
    investmentFrequency: "",
    preferredStartupStage: "",

    yearsExperience: "",
    previousInvestments: "",
    portfolioCompanies: "",
    investmentDescription: "",

    location: "",
    investorLocationType: "",
    availability: "",

    lookingFor: [],

    bio: "",
    linkedin: "",
    website: "",
    portfolio: ""
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

  const handleMultiSelect = (field, value) => {
    setFormData((previous) => {
      const exists = previous[field].includes(value);

      return {
        ...previous,
        [field]: exists
          ? previous[field].filter(
              (item) => item !== value
            )
          : [...previous[field], value]
      };
    });

    setErrors((previous) => ({
      ...previous,
      [field]: ""
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName =
          "Full name is required.";
      }

      if (!formData.email.trim()) {
        newErrors.email =
          "Email is required.";
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
    }

    if (currentStep === 2) {
      if (!formData.investorType) {
        newErrors.investorType =
          "Please select investor type.";
      }

      if (!formData.industries.trim()) {
        newErrors.industries =
          "Please enter preferred industries.";
      }
    }

    if (currentStep === 3) {
      if (!formData.investmentRange) {
        newErrors.investmentRange =
          "Please select investment range.";
      }

      if (!formData.preferredStartupStage) {
        newErrors.preferredStartupStage =
          "Please select preferred startup stage.";
      }

      if (formData.investmentStages.length === 0) {
        newErrors.investmentStages =
          "Select at least one investment stage.";
      }
    }

    if (currentStep === 4) {
      if (!formData.yearsExperience) {
        newErrors.yearsExperience =
          "Please select your experience.";
      }

      if (!formData.previousInvestments.trim()) {
        newErrors.previousInvestments =
          "Please provide your investment experience.";
      }
    }

    if (currentStep === 5) {
      if (!formData.location.trim()) {
        newErrors.location =
          "Location is required.";
      }

      if (!formData.investorLocationType) {
        newErrors.investorLocationType =
          "Please select location preference.";
      }

      if (!formData.availability) {
        newErrors.availability =
          "Please select availability.";
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
          "Please provide a short bio.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep < steps.length) {
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
      "Investor signup data:",
      formData
    );

    alert(
      "Investor account form completed successfully."
    );
  };

  return (
    <main className="investor-signup-page">
      <div className="investor-signup-container">

        <div className="investor-signup-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="investor-signup-card">

          <div className="investor-signup-header">

            <div className="investor-signup-icon">
              <TrendingUp size={27} />
            </div>

            <span className="investor-signup-badge">
              Investor Registration
            </span>

            <h1>Create Your Investor Account</h1>

            <p>
              Build your investor profile and discover
              startups that match your investment interests.
            </p>

          </div>

          <SignupProgress
            currentStep={currentStep}
          />

          <form
            className="investor-signup-form"
            onSubmit={handleSubmit}
          >

            {currentStep === 1 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <UserRound size={20} />

                  <div>
                    <h2>Account Information</h2>
                    <p>
                      Create your StartupSync investor
                      account.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="fullName">
                      Full Name <span>*</span>
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
                      Email <span>*</span>
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
                      Password <span>*</span>
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
                      Confirm Password <span>*</span>
                    </label>

                    <div className="signup-input-with-icon">
                      <LockKeyhole size={17} />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
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

                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <Building2 size={20} />

                  <div>
                    <h2>Investor Profile</h2>
                    <p>
                      Tell startups who you are and what
                      areas interest you.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="investorType">
                      Investor Type <span>*</span>
                    </label>

                    <select
                      id="investorType"
                      name="investorType"
                      value={formData.investorType}
                      onChange={handleChange}
                      className={
                        errors.investorType
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select investor type
                      </option>

                      <option value="angel">
                        Angel Investor
                      </option>

                      <option value="venture-capital">
                        Venture Capital
                      </option>

                      <option value="corporate">
                        Corporate Investor
                      </option>

                      <option value="family-office">
                        Family Office
                      </option>

                      <option value="individual">
                        Individual Investor
                      </option>

                    </select>

                    {errors.investorType && (
                      <small>
                        {errors.investorType}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="organization">
                      Organization
                    </label>

                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      placeholder="Company / fund name"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="industries">
                      Preferred Industries <span>*</span>
                    </label>

                    <input
                      id="industries"
                      name="industries"
                      type="text"
                      placeholder="e.g. FinTech, SaaS, HealthTech"
                      value={formData.industries}
                      onChange={handleChange}
                      className={
                        errors.industries
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.industries && (
                      <small>
                        {errors.industries}
                      </small>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <Wallet size={20} />

                  <div>
                    <h2>Investment Preferences</h2>
                    <p>
                      Define the startups and investment
                      sizes you are interested in.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="investmentRange">
                      Investment Range <span>*</span>
                    </label>

                    <select
                      id="investmentRange"
                      name="investmentRange"
                      value={formData.investmentRange}
                      onChange={handleChange}
                      className={
                        errors.investmentRange
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select range
                      </option>

                      <option value="under-5-lakh">
                        Under ₹5 Lakhs
                      </option>

                      <option value="5-25-lakh">
                        ₹5–25 Lakhs
                      </option>

                      <option value="25-50-lakh">
                        ₹25–50 Lakhs
                      </option>

                      <option value="50-lakh-1-crore">
                        ₹50 Lakhs–₹1 Crore
                      </option>

                      <option value="1-crore-plus">
                        ₹1 Crore+
                      </option>
                    </select>

                    {errors.investmentRange && (
                      <small>
                        {errors.investmentRange}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="preferredStartupStage">
                      Preferred Startup Stage <span>*</span>
                    </label>

                    <select
                      id="preferredStartupStage"
                      name="preferredStartupStage"
                      value={
                        formData.preferredStartupStage
                      }
                      onChange={handleChange}
                      className={
                        errors.preferredStartupStage
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

                      <option value="pre-seed">
                        Pre-Seed
                      </option>

                      <option value="seed">
                        Seed
                      </option>

                      <option value="growth">
                        Growth
                      </option>
                    </select>

                    {errors.preferredStartupStage && (
                      <small>
                        {errors.preferredStartupStage}
                      </small>
                    )}
                  </div>

                  <div className="signup-field signup-field-full">
                    <label>
                      Investment Stages <span>*</span>
                    </label>

                    <div className="choice-grid">

                      {[
                        "Pre-Seed",
                        "Seed",
                        "Series A",
                        "Series B+"
                      ].map((item) => (
                        <label
                          key={item}
                          className={`choice-option ${
                            formData.investmentStages.includes(
                              item
                            )
                              ? "choice-selected"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.investmentStages.includes(
                              item
                            )}
                            onChange={() =>
                              handleMultiSelect(
                                "investmentStages",
                                item
                              )
                            }
                          />

                          <span>{item}</span>
                        </label>
                      ))}

                    </div>

                    {errors.investmentStages && (
                      <small>
                        {errors.investmentStages}
                      </small>
                    )}
                  </div>

                </div>
              </section>
            )}

            {currentStep === 4 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <TrendingUp size={20} />

                  <div>
                    <h2>Investment Experience</h2>
                    <p>
                      Share your investment background.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="yearsExperience">
                      Investment Experience <span>*</span>
                    </label>

                    <select
                      id="yearsExperience"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      className={
                        errors.yearsExperience
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select experience
                      </option>

                      <option value="less-than-1">
                        Less than 1 year
                      </option>

                      <option value="1-3">
                        1–3 years
                      </option>

                      <option value="3-5">
                        3–5 years
                      </option>

                      <option value="5-10">
                        5–10 years
                      </option>

                      <option value="10-plus">
                        10+ years
                      </option>
                    </select>

                    {errors.yearsExperience && (
                      <small>
                        {errors.yearsExperience}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="portfolioCompanies">
                      Portfolio Companies
                    </label>

                    <input
                      id="portfolioCompanies"
                      name="portfolioCompanies"
                      type="text"
                      placeholder="Number of companies"
                      value={formData.portfolioCompanies}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="previousInvestments">
                      Previous Investment Experience <span>*</span>
                    </label>

                    <textarea
                      id="previousInvestments"
                      name="previousInvestments"
                      rows="3"
                      placeholder="Describe your previous investments or relevant experience"
                      value={
                        formData.previousInvestments
                      }
                      onChange={handleChange}
                      className={
                        errors.previousInvestments
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.previousInvestments && (
                      <small>
                        {errors.previousInvestments}
                      </small>
                    )}
                  </div>

                  <div className="signup-field signup-field-full">
                    <label htmlFor="investmentDescription">
                      Investment Approach
                    </label>

                    <textarea
                      id="investmentDescription"
                      name="investmentDescription"
                      rows="3"
                      placeholder="Describe your investment philosophy or approach"
                      value={
                        formData.investmentDescription
                      }
                      onChange={handleChange}
                    />
                  </div>

                </div>
              </section>
            )}

            {currentStep === 5 && (
              <section className="signup-step">

                <div className="signup-step-heading">
                  <MapPin size={20} />

                  <div>
                    <h2>Location & Availability</h2>
                    <p>
                      Help startups understand where and
                      how you work.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field">
                    <label htmlFor="location">
                      Location <span>*</span>
                    </label>

                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, State, Country"
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
                    <label htmlFor="investorLocationType">
                      Working Preference <span>*</span>
                    </label>

                    <select
                      id="investorLocationType"
                      name="investorLocationType"
                      value={
                        formData.investorLocationType
                      }
                      onChange={handleChange}
                      className={
                        errors.investorLocationType
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select preference
                      </option>

                      <option value="local">
                        Local Startups
                      </option>

                      <option value="national">
                        Across India
                      </option>

                      <option value="international">
                        International
                      </option>

                      <option value="all">
                        No Preference
                      </option>
                    </select>

                    {errors.investorLocationType && (
                      <small>
                        {errors.investorLocationType}
                      </small>
                    )}
                  </div>

                  <div className="signup-field">
                    <label htmlFor="availability">
                      Availability <span>*</span>
                    </label>

                    <select
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className={
                        errors.availability
                          ? "input-error"
                          : ""
                      }
                    >
                      <option value="">
                        Select availability
                      </option>

                      <option value="weekly">
                        Weekly
                      </option>

                      <option value="biweekly">
                        Every 2 Weeks
                      </option>

                      <option value="monthly">
                        Monthly
                      </option>

                      <option value="occasional">
                        Occasionally
                      </option>
                    </select>

                    {errors.availability && (
                      <small>
                        {errors.availability}
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
                      Select what you would like to find
                      on StartupSync.
                    </p>
                  </div>
                </div>

                <div className="looking-for-grid">

                  {[
                    "Promising Startups",
                    "Co-Investors",
                    "Deal Flow",
                    "Startup Events",
                    "Mentors",
                    "Incubators",
                    "Innovation Programs",
                    "Networking"
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
                          handleMultiSelect(
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
                    <h2>Bio & Links</h2>
                    <p>
                      Give startups more information about
                      you.
                    </p>
                  </div>
                </div>

                <div className="signup-form-grid">

                  <div className="signup-field signup-field-full">
                    <label htmlFor="bio">
                      Investor Bio <span>*</span>
                    </label>

                    <textarea
                      id="bio"
                      name="bio"
                      rows="4"
                      placeholder="Introduce yourself, your investment interests and experience"
                      value={formData.bio}
                      onChange={handleChange}
                      className={
                        errors.bio
                          ? "input-error"
                          : ""
                      }
                    />

                    {errors.bio && (
                      <small>
                        {errors.bio}
                      </small>
                    )}
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
                    <label htmlFor="website">
                      Website
                    </label>

                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="Website URL"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="portfolio">
                      Portfolio
                    </label>

                    <input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      placeholder="Portfolio URL"
                      value={formData.portfolio}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="signup-completion-message">
                  <CheckCircle2 size={20} />

                  <div>
                    <strong>
                      Investor profile is ready!
                    </strong>

                    <p>
                      Review your information and create
                      your StartupSync investor account.
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

              {currentStep < steps.length ? (
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
                  Create Investor Account
                  <CheckCircle2 size={18} />
                </button>
              )}

            </div>

          </form>

          <div className="investor-signup-login">
            <span>
              Already have an Investor account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login/investor")
              }
            >
              Sign in
            </button>
          </div>

        </div>

        <div className="investor-signup-footer">
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

export default InvestorSignup;