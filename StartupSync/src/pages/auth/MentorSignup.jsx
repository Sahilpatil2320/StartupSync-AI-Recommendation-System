import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe,
  Lightbulb,
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

import "./MentorSignup.css";

const initialFormData = {

  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",

 
  primaryExpertise: "",
  industries: "",
  yearsExperience: "",
  skills: "",


  currentRole: "",
  organization: "",
  previousExperience: "",
  achievements: "",

  mentoringAreas: [],
  startupStages: [],
  mentoringFormat: "",
  availability: "",

  location: "",
  preferredEngagement: "",
  languages: "",

  lookingFor: [],

  bio: "",
  linkedin: "",
  website: "",
  portfolio: ""
};

function MentorSignup() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const totalSteps = 7;

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

  const handleCheckboxChange = (name, value) => {
    setFormData((previous) => {
      const currentValues = previous[name];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...previous,
        [name]: updatedValues
      };
    });

    setErrors((previous) => ({
      ...previous,
      [name]: ""
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
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
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
      if (!formData.primaryExpertise.trim()) {
        newErrors.primaryExpertise =
          "Primary expertise is required.";
      }

      if (!formData.industries.trim()) {
        newErrors.industries =
          "Please enter your preferred industries.";
      }

      if (!formData.yearsExperience) {
        newErrors.yearsExperience =
          "Please select your experience.";
      }

      if (!formData.skills.trim()) {
        newErrors.skills =
          "Please enter your key skills.";
      }
    }

    if (currentStep === 3) {
      if (!formData.currentRole.trim()) {
        newErrors.currentRole =
          "Current role is required.";
      }

      if (!formData.organization.trim()) {
        newErrors.organization =
          "Organization or company is required.";
      }

      if (!formData.previousExperience.trim()) {
        newErrors.previousExperience =
          "Please describe your professional experience.";
      }
    }

    if (currentStep === 4) {
      if (formData.mentoringAreas.length === 0) {
        newErrors.mentoringAreas =
          "Select at least one mentoring area.";
      }

      if (formData.startupStages.length === 0) {
        newErrors.startupStages =
          "Select at least one startup stage.";
      }

      if (!formData.mentoringFormat) {
        newErrors.mentoringFormat =
          "Please select a mentoring format.";
      }

      if (!formData.availability) {
        newErrors.availability =
          "Please select your availability.";
      }
    }

    if (currentStep === 5) {
      if (!formData.location.trim()) {
        newErrors.location =
          "Location is required.";
      }

      if (!formData.preferredEngagement) {
        newErrors.preferredEngagement =
          "Please select your preferred engagement.";
      }

      if (!formData.languages.trim()) {
        newErrors.languages =
          "Please enter your languages.";
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
          "Mentor bio is required.";
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

    console.log("Mentor Signup Data:", formData);

    alert(
      "Mentor account form completed successfully."
    );
  };

  const renderInputError = (fieldName) => {
    if (!errors[fieldName]) return null;

    return (
      <small className="signup-field-error">
        {errors[fieldName]}
      </small>
    );
  };

  return (
    <main className="mentor-signup-page">
      <div className="mentor-signup-container">

        <div className="mentor-signup-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="mentor-signup-header">

          <div className="mentor-signup-icon">
            <Lightbulb size={26} />
          </div>

          <span className="mentor-signup-badge">
            Mentor Registration
          </span>

          <h1>Create Your Mentor Account</h1>

          <p>
            Build your mentor profile and help startups
            and students grow through StartupSync.
          </p>

        </div>

        <SignupProgress currentStep={currentStep} />

        <form
          className="mentor-signup-card"
          onSubmit={handleSubmit}
          noValidate
        >

          {currentStep === 1 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Account Information</h2>
                <p>
                  Create your secure StartupSync mentor account.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label htmlFor="fullName">
                    Full Name <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.fullName ? "input-error" : ""
                    }`}
                  >
                    <UserRound size={18} />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError("fullName")}
                </div>

                <div className="signup-field">
                  <label htmlFor="email">
                    Email Address <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.email ? "input-error" : ""
                    }`}
                  >
                    <Mail size={18} />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="mentor@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError("email")}
                </div>

                <div className="signup-field">
                  <label htmlFor="password">
                    Password <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.password ? "input-error" : ""
                    }`}
                  >
                    <LockKeyhole size={18} />

                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError("password")}
                </div>

                <div className="signup-field">
                  <label htmlFor="confirmPassword">
                    Confirm Password <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.confirmPassword
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <LockKeyhole size={18} />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError("confirmPassword")}
                </div>

              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Expertise & Skills</h2>
                <p>
                  Tell startups what areas you can guide them in.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field">
                  <label htmlFor="primaryExpertise">
                    Primary Expertise <span>*</span>
                  </label>

                  <input
                    id="primaryExpertise"
                    name="primaryExpertise"
                    type="text"
                    placeholder="e.g. Product Management"
                    className={
                      errors.primaryExpertise
                        ? "input-error"
                        : ""
                    }
                    value={formData.primaryExpertise}
                    onChange={handleChange}
                  />

                  {renderInputError("primaryExpertise")}
                </div>

                <div className="signup-field">
                  <label htmlFor="industries">
                    Preferred Industries <span>*</span>
                  </label>

                  <input
                    id="industries"
                    name="industries"
                    type="text"
                    placeholder="e.g. FinTech, SaaS, EdTech"
                    className={
                      errors.industries
                        ? "input-error"
                        : ""
                    }
                    value={formData.industries}
                    onChange={handleChange}
                  />

                  {renderInputError("industries")}
                </div>

                <div className="signup-field">
                  <label htmlFor="yearsExperience">
                    Years of Experience <span>*</span>
                  </label>

                  <select
                    id="yearsExperience"
                    name="yearsExperience"
                    className={
                      errors.yearsExperience
                        ? "input-error"
                        : ""
                    }
                    value={formData.yearsExperience}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select experience
                    </option>
                    <option value="1-3">1–3 Years</option>
                    <option value="3-5">3–5 Years</option>
                    <option value="5-10">5–10 Years</option>
                    <option value="10-15">10–15 Years</option>
                    <option value="15+">15+ Years</option>
                  </select>

                  {renderInputError("yearsExperience")}
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="skills">
                    Key Skills <span>*</span>
                  </label>

                  <textarea
                    id="skills"
                    name="skills"
                    rows="3"
                    placeholder="Enter your key skills separated by commas"
                    className={
                      errors.skills
                        ? "input-error"
                        : ""
                    }
                    value={formData.skills}
                    onChange={handleChange}
                  />

                  {renderInputError("skills")}
                </div>

              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Professional Background</h2>
                <p>
                  Share your professional experience and achievements.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field">
                  <label htmlFor="currentRole">
                    Current Role <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.currentRole
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <BriefcaseBusiness size={18} />

                    <input
                      id="currentRole"
                      name="currentRole"
                      type="text"
                      placeholder="e.g. Senior Product Manager"
                      value={formData.currentRole}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError("currentRole")}
                </div>

                <div className="signup-field">
                  <label htmlFor="organization">
                    Organization / Company <span>*</span>
                  </label>

                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    placeholder="Enter organization name"
                    className={
                      errors.organization
                        ? "input-error"
                        : ""
                    }
                    value={formData.organization}
                    onChange={handleChange}
                  />

                  {renderInputError("organization")}
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="previousExperience">
                    Professional Experience <span>*</span>
                  </label>

                  <textarea
                    id="previousExperience"
                    name="previousExperience"
                    rows="4"
                    placeholder="Describe your professional journey and relevant experience"
                    className={
                      errors.previousExperience
                        ? "input-error"
                        : ""
                    }
                    value={formData.previousExperience}
                    onChange={handleChange}
                  />

                  {renderInputError("previousExperience")}
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="achievements">
                    Key Achievements
                  </label>

                  <textarea
                    id="achievements"
                    name="achievements"
                    rows="3"
                    placeholder="Mention notable achievements, awards, products built or companies supported"
                    value={formData.achievements}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Mentoring Focus</h2>
                <p>
                  Choose the areas and startup stages you want to mentor.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label>
                    Mentoring Areas <span>*</span>
                  </label>

                  <div className="choice-grid">

                    {[
                      "Business Strategy",
                      "Product Development",
                      "Technology",
                      "Marketing",
                      "Sales",
                      "Fundraising",
                      "Leadership",
                      "Career Guidance"
                    ].map((area) => (
                      <label
                        className="choice-option"
                        key={area}
                      >
                        <input
                          type="checkbox"
                          checked={formData.mentoringAreas.includes(
                            area
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "mentoringAreas",
                              area
                            )
                          }
                        />

                        <span>{area}</span>
                      </label>
                    ))}

                  </div>

                  {renderInputError("mentoringAreas")}
                </div>

                <div className="signup-field signup-field-full">
                  <label>
                    Startup Stages <span>*</span>
                  </label>

                  <div className="choice-grid">

                    {[
                      "Idea Stage",
                      "Pre-Seed",
                      "Seed",
                      "Early Growth",
                      "Growth Stage"
                    ].map((stage) => (
                      <label
                        className="choice-option"
                        key={stage}
                      >
                        <input
                          type="checkbox"
                          checked={formData.startupStages.includes(
                            stage
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "startupStages",
                              stage
                            )
                          }
                        />

                        <span>{stage}</span>
                      </label>
                    ))}

                  </div>

                  {renderInputError("startupStages")}
                </div>

                <div className="signup-field">
                  <label htmlFor="mentoringFormat">
                    Mentoring Format <span>*</span>
                  </label>

                  <select
                    id="mentoringFormat"
                    name="mentoringFormat"
                    className={
                      errors.mentoringFormat
                        ? "input-error"
                        : ""
                    }
                    value={formData.mentoringFormat}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select format
                    </option>
                    <option value="one-on-one">
                      One-on-One
                    </option>
                    <option value="group">
                      Group Sessions
                    </option>
                    <option value="both">
                      One-on-One & Group
                    </option>
                  </select>

                  {renderInputError("mentoringFormat")}
                </div>

                <div className="signup-field">
                  <label htmlFor="availability">
                    Availability <span>*</span>
                  </label>

                  <select
                    id="availability"
                    name="availability"
                    className={
                      errors.availability
                        ? "input-error"
                        : ""
                    }
                    value={formData.availability}
                    onChange={handleChange}
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
                    <option value="occasionally">
                      Occasionally
                    </option>
                  </select>

                  {renderInputError("availability")}
                </div>

              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Location & Preferences</h2>
                <p>
                  Tell us where and how you prefer to mentor.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field">
                  <label htmlFor="location">
                    Location <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.location
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <MapPin size={18} />

                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, State, Country"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError("location")}
                </div>

                <div className="signup-field">
                  <label htmlFor="preferredEngagement">
                    Preferred Engagement <span>*</span>
                  </label>

                  <select
                    id="preferredEngagement"
                    name="preferredEngagement"
                    className={
                      errors.preferredEngagement
                        ? "input-error"
                        : ""
                    }
                    value={formData.preferredEngagement}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select preference
                    </option>
                    <option value="local">
                      Local Startups
                    </option>
                    <option value="india">
                      Across India
                    </option>
                    <option value="international">
                      International
                    </option>
                    <option value="no-preference">
                      No Preference
                    </option>
                  </select>

                  {renderInputError(
                    "preferredEngagement"
                  )}
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="languages">
                    Languages <span>*</span>
                  </label>

                  <input
                    id="languages"
                    name="languages"
                    type="text"
                    placeholder="e.g. English, Hindi, Marathi"
                    className={
                      errors.languages
                        ? "input-error"
                        : ""
                    }
                    value={formData.languages}
                    onChange={handleChange}
                  />

                  {renderInputError("languages")}
                </div>

              </div>
            </section>
          )}

          {currentStep === 6 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>What Are You Looking For?</h2>
                <p>
                  Select the opportunities and connections
                  you want through StartupSync.
                </p>
              </div>

              <div className="signup-field signup-field-full">

                <label>
                  Select Your Interests <span>*</span>
                </label>

                <div className="looking-for-grid">

                  {[
                    "Mentor Startups",
                    "Guide Students",
                    "Advisory Opportunities",
                    "Startup Networking",
                    "Co-Mentors",
                    "Startup Events",
                    "Innovation Programs",
                    "Speaking Opportunities"
                  ].map((item) => (
                    <label
                      className="looking-for-option"
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

                {renderInputError("lookingFor")}

              </div>
            </section>
          )}

          {currentStep === 7 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Bio & Professional Links</h2>
                <p>
                  Complete your public mentor profile.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label htmlFor="bio">
                    Mentor Bio <span>*</span>
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows="5"
                    placeholder="Introduce yourself, your expertise and how you can help startups or students."
                    className={
                      errors.bio
                        ? "input-error"
                        : ""
                    }
                    value={formData.bio}
                    onChange={handleChange}
                  />

                  {renderInputError("bio")}
                </div>

                <div className="signup-field">
                  <label htmlFor="linkedin">
                    LinkedIn
                  </label>

                  <div className="signup-input-with-icon">
                    <Link size={18} />

                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      placeholder="LinkedIn profile URL"
                      value={formData.linkedin}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="website">
                    Website
                  </label>

                  <div className="signup-input-with-icon">
                    <Globe size={18} />

                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="portfolio">
                    Portfolio / Profile Link
                  </label>

                  <input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    placeholder="Portfolio, personal profile or professional page"
                    value={formData.portfolio}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="signup-completion-message">
                <CheckCircle2 size={20} />

                <div>
                  <strong>
                    Your mentor profile is almost ready.
                  </strong>

                  <p>
                    Review your information and create
                    your StartupSync mentor account.
                  </p>
                </div>
              </div>

            </section>
          )}

          <div className="signup-form-navigation">

            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-secondary signup-back-button"
                onClick={handleBack}
              >
                <ArrowLeft size={18} />
                Back
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary signup-back-button"
                onClick={() => navigate("/signup")}
              >
                <ArrowLeft size={18} />
                Change Role
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary signup-next-button"
                onClick={handleNext}
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary signup-create-button"
              >
                Create Mentor Account
                <CheckCircle2 size={18} />
              </button>
            )}

          </div>

        </form>

        <div className="mentor-signup-footer">

          <span>
            Already have a StartupSync account?
          </span>

          <button
            type="button"
            onClick={() => navigate("/login/mentor")}
          >
            Sign in as Mentor
          </button>

        </div>

      </div>
    </main>
  );
}

export default MentorSignup;