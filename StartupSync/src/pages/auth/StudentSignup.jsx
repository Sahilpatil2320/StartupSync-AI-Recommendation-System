import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BrandLogo from "../../components/BrandLogo";
import SignupProgress from "../../components/auth/SignupProgress";

import "./StudentSignup.css";

const initialFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",

  educationLevel: "",
  institution: "",
  course: "",
  fieldOfStudy: "",
  graduationYear: "",

  skills: "",
  experienceLevel: "",
  projects: "",
  experienceDescription: "",

  interests: [],
  preferredDomains: "",
  jobType: "",
  preferredOpportunity: "",

  internshipType: "",
  duration: "",
  locationPreference: "",
  availability: "",

  lookingFor: [],

  bio: "",
  linkedin: "",
  github: "",
  portfolio: "",
  resumeUrl: ""
};

function StudentSignup() {
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
        formData.password !== formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          "Passwords do not match.";
      }
    }

    if (currentStep === 2) {
      if (!formData.educationLevel) {
        newErrors.educationLevel =
          "Please select your education level.";
      }

      if (!formData.institution.trim()) {
        newErrors.institution =
          "Institution name is required.";
      }

      if (!formData.course.trim()) {
        newErrors.course =
          "Course name is required.";
      }

      if (!formData.fieldOfStudy.trim()) {
        newErrors.fieldOfStudy =
          "Field of study is required.";
      }

      if (!formData.graduationYear) {
        newErrors.graduationYear =
          "Please select your graduation year.";
      }
    }

    if (currentStep === 3) {
      if (!formData.skills.trim()) {
        newErrors.skills =
          "Please enter your skills.";
      }

      if (!formData.experienceLevel) {
        newErrors.experienceLevel =
          "Please select your experience level.";
      }

      if (!formData.projects.trim()) {
        newErrors.projects =
          "Please describe at least one project.";
      }
    }

    if (currentStep === 4) {
      if (formData.interests.length === 0) {
        newErrors.interests =
          "Select at least one career interest.";
      }

      if (!formData.preferredDomains.trim()) {
        newErrors.preferredDomains =
          "Please enter your preferred domains.";
      }

      if (!formData.jobType) {
        newErrors.jobType =
          "Please select your preferred job type.";
      }

      if (!formData.preferredOpportunity) {
        newErrors.preferredOpportunity =
          "Please select an opportunity type.";
      }
    }

    if (currentStep === 5) {
      if (!formData.internshipType) {
        newErrors.internshipType =
          "Please select internship type.";
      }

      if (!formData.duration) {
        newErrors.duration =
          "Please select preferred duration.";
      }

      if (!formData.locationPreference) {
        newErrors.locationPreference =
          "Please select location preference.";
      }

      if (!formData.availability) {
        newErrors.availability =
          "Please select your availability.";
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
          "Profile bio is required.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

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
      setCurrentStep(
        (previous) => previous - 1
      );

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

    console.log(
      "Student Signup Data:",
      formData
    );

    alert(
      "Student account form completed successfully."
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
    <main className="student-signup-page">
      <div className="student-signup-container">

        <div className="student-signup-brand">
          <BrandLogo variant="light" />
        </div>

        <div className="student-signup-header">

          <div className="student-signup-icon">
            <GraduationCap size={26} />
          </div>

          <span className="student-signup-badge">
            Student Registration
          </span>

          <h1>Create Your Student Account</h1>

          <p>
            Build your profile and discover internships,
            projects, mentorship and career opportunities
            through StartupSync.
          </p>

        </div>

        <SignupProgress
          currentStep={currentStep}
        />

        <form
          className="student-signup-card"
          onSubmit={handleSubmit}
          noValidate
        >

          {currentStep === 1 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Account Information</h2>

                <p>
                  Create your secure StartupSync
                  student account.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label htmlFor="fullName">
                    Full Name <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.fullName
                        ? "input-error"
                        : ""
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

                  {renderInputError(
                    "fullName"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="email">
                    Email Address <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.email
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <Mail size={18} />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="student@example.com"
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
                      errors.password
                        ? "input-error"
                        : ""
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

                  {renderInputError(
                    "password"
                  )}
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
                      value={
                        formData.confirmPassword
                      }
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError(
                    "confirmPassword"
                  )}
                </div>

              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Education</h2>

                <p>
                  Add your current academic
                  background.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field">
                  <label htmlFor="educationLevel">
                    Education Level <span>*</span>
                  </label>

                  <select
                    id="educationLevel"
                    name="educationLevel"
                    className={
                      errors.educationLevel
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.educationLevel
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select education level
                    </option>
                    <option value="diploma">
                      Diploma
                    </option>
                    <option value="undergraduate">
                      Undergraduate
                    </option>
                    <option value="postgraduate">
                      Postgraduate
                    </option>
                    <option value="phd">
                      PhD
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>

                  {renderInputError(
                    "educationLevel"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="institution">
                    Institution <span>*</span>
                  </label>

                  <div
                    className={`signup-input-with-icon ${
                      errors.institution
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <GraduationCap size={18} />

                    <input
                      id="institution"
                      name="institution"
                      type="text"
                      placeholder="College / University"
                      value={formData.institution}
                      onChange={handleChange}
                    />
                  </div>

                  {renderInputError(
                    "institution"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="course">
                    Course <span>*</span>
                  </label>

                  <input
                    id="course"
                    name="course"
                    type="text"
                    placeholder="e.g. B.Tech Computer Science"
                    className={
                      errors.course
                        ? "input-error"
                        : ""
                    }
                    value={formData.course}
                    onChange={handleChange}
                  />

                  {renderInputError(
                    "course"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="fieldOfStudy">
                    Field of Study <span>*</span>
                  </label>

                  <input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    type="text"
                    placeholder="e.g. Computer Science"
                    className={
                      errors.fieldOfStudy
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.fieldOfStudy
                    }
                    onChange={handleChange}
                  />

                  {renderInputError(
                    "fieldOfStudy"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="graduationYear">
                    Graduation Year <span>*</span>
                  </label>

                  <select
                    id="graduationYear"
                    name="graduationYear"
                    className={
                      errors.graduationYear
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.graduationYear
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select year
                    </option>

                    {[
                      "2026",
                      "2027",
                      "2028",
                      "2029",
                      "2030",
                      "2031"
                    ].map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>

                  {renderInputError(
                    "graduationYear"
                  )}
                </div>

              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Skills & Experience</h2>

                <p>
                  Tell us about your technical skills
                  and practical experience.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label htmlFor="skills">
                    Skills <span>*</span>
                  </label>

                  <textarea
                    id="skills"
                    name="skills"
                    rows="3"
                    placeholder="e.g. JavaScript, React, Node.js, Python, MongoDB"
                    className={
                      errors.skills
                        ? "input-error"
                        : ""
                    }
                    value={formData.skills}
                    onChange={handleChange}
                  />

                  {renderInputError(
                    "skills"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="experienceLevel">
                    Experience Level <span>*</span>
                  </label>

                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    className={
                      errors.experienceLevel
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.experienceLevel
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select experience
                    </option>
                    <option value="beginner">
                      Beginner
                    </option>
                    <option value="intermediate">
                      Intermediate
                    </option>
                    <option value="advanced">
                      Advanced
                    </option>
                  </select>

                  {renderInputError(
                    "experienceLevel"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="projects">
                    Projects <span>*</span>
                  </label>

                  <input
                    id="projects"
                    name="projects"
                    type="text"
                    placeholder="e.g. Hotel Booking System"
                    className={
                      errors.projects
                        ? "input-error"
                        : ""
                    }
                    value={formData.projects}
                    onChange={handleChange}
                  />

                  {renderInputError(
                    "projects"
                  )}
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="experienceDescription">
                    Experience Description
                  </label>

                  <textarea
                    id="experienceDescription"
                    name="experienceDescription"
                    rows="4"
                    placeholder="Describe internships, freelance work, college projects or other experience."
                    value={
                      formData.experienceDescription
                    }
                    onChange={handleChange}
                  />
                </div>

              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Career Interests</h2>

                <p>
                  Select the career areas and domains
                  you are interested in.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label>
                    Career Interests <span>*</span>
                  </label>

                  <div className="choice-grid">

                    {[
                      "Software Development",
                      "Data Science",
                      "AI & Machine Learning",
                      "UI/UX Design",
                      "Cybersecurity",
                      "Cloud & DevOps",
                      "Product Management",
                      "Entrepreneurship"
                    ].map((item) => (
                      <label
                        className="choice-option"
                        key={item}
                      >
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(
                            item
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "interests",
                              item
                            )
                          }
                        />

                        <span>{item}</span>
                      </label>
                    ))}

                  </div>

                  {renderInputError(
                    "interests"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="preferredDomains">
                    Preferred Domains <span>*</span>
                  </label>

                  <input
                    id="preferredDomains"
                    name="preferredDomains"
                    type="text"
                    placeholder="e.g. MERN, Java, FinTech"
                    className={
                      errors.preferredDomains
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.preferredDomains
                    }
                    onChange={handleChange}
                  />

                  {renderInputError(
                    "preferredDomains"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="jobType">
                    Preferred Job Type <span>*</span>
                  </label>

                  <select
                    id="jobType"
                    name="jobType"
                    className={
                      errors.jobType
                        ? "input-error"
                        : ""
                    }
                    value={formData.jobType}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select job type
                    </option>
                    <option value="full-time">
                      Full-Time
                    </option>
                    <option value="part-time">
                      Part-Time
                    </option>
                    <option value="internship">
                      Internship
                    </option>
                    <option value="contract">
                      Contract
                    </option>
                  </select>

                  {renderInputError(
                    "jobType"
                  )}
                </div>

                <div className="signup-field signup-field-full">
                  <label htmlFor="preferredOpportunity">
                    Preferred Opportunity <span>*</span>
                  </label>

                  <select
                    id="preferredOpportunity"
                    name="preferredOpportunity"
                    className={
                      errors.preferredOpportunity
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.preferredOpportunity
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select opportunity
                    </option>
                    <option value="internship">
                      Internship
                    </option>
                    <option value="job">
                      Job Opportunity
                    </option>
                    <option value="startup-project">
                      Startup Project
                    </option>
                    <option value="freelance">
                      Freelance Opportunity
                    </option>
                    <option value="mentorship">
                      Mentorship
                    </option>
                  </select>

                  {renderInputError(
                    "preferredOpportunity"
                  )}
                </div>

              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Internship Preferences</h2>

                <p>
                  Set your preferred internship
                  requirements and availability.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field">
                  <label htmlFor="internshipType">
                    Internship Type <span>*</span>
                  </label>

                  <select
                    id="internshipType"
                    name="internshipType"
                    className={
                      errors.internshipType
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.internshipType
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select type
                    </option>
                    <option value="technical">
                      Technical
                    </option>
                    <option value="non-technical">
                      Non-Technical
                    </option>
                    <option value="both">
                      Technical & Non-Technical
                    </option>
                  </select>

                  {renderInputError(
                    "internshipType"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="duration">
                    Preferred Duration <span>*</span>
                  </label>

                  <select
                    id="duration"
                    name="duration"
                    className={
                      errors.duration
                        ? "input-error"
                        : ""
                    }
                    value={formData.duration}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select duration
                    </option>
                    <option value="1-3">
                      1–3 Months
                    </option>
                    <option value="3-6">
                      3–6 Months
                    </option>
                    <option value="6-12">
                      6–12 Months
                    </option>
                    <option value="flexible">
                      Flexible
                    </option>
                  </select>

                  {renderInputError(
                    "duration"
                  )}
                </div>

                <div className="signup-field">
                  <label htmlFor="locationPreference">
                    Location Preference <span>*</span>
                  </label>

                  <select
                    id="locationPreference"
                    name="locationPreference"
                    className={
                      errors.locationPreference
                        ? "input-error"
                        : ""
                    }
                    value={
                      formData.locationPreference
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select preference
                    </option>
                    <option value="onsite">
                      On-Site
                    </option>
                    <option value="remote">
                      Remote
                    </option>
                    <option value="hybrid">
                      Hybrid
                    </option>
                    <option value="any">
                      Any
                    </option>
                  </select>

                  {renderInputError(
                    "locationPreference"
                  )}
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
                    <option value="immediate">
                      Immediately
                    </option>
                    <option value="15-days">
                      Within 15 Days
                    </option>
                    <option value="1-month">
                      Within 1 Month
                    </option>
                    <option value="later">
                      Later
                    </option>
                  </select>

                  {renderInputError(
                    "availability"
                  )}
                </div>

              </div>
            </section>
          )}

          {currentStep === 6 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>What Are You Looking For?</h2>

                <p>
                  Select the opportunities you want
                  to discover on StartupSync.
                </p>
              </div>

              <div className="signup-field signup-field-full">

                <label>
                  Select Opportunities <span>*</span>
                </label>

                <div className="looking-for-grid">

                  {[
                    "Internships",
                    "Full-Time Jobs",
                    "Mentorship",
                    "Startup Projects",
                    "Networking",
                    "Coding Competitions",
                    "Hackathons",
                    "Career Events"
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

                {renderInputError(
                  "lookingFor"
                )}

              </div>
            </section>
          )}

          {currentStep === 7 && (
            <section className="signup-step">

              <div className="signup-step-heading">
                <h2>Profile & Links</h2>

                <p>
                  Complete your StartupSync student
                  profile.
                </p>
              </div>

              <div className="signup-form-grid">

                <div className="signup-field signup-field-full">
                  <label htmlFor="bio">
                    Profile Bio <span>*</span>
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows="5"
                    placeholder="Introduce yourself, your interests, skills and career goals."
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
                    <Globe size={18} />

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
                  <label htmlFor="github">
                    GitHub
                  </label>

                  <div className="signup-input-with-icon">
                    <Globe size={18} />

                    <input
                      id="github"
                      name="github"
                      type="url"
                      placeholder="GitHub profile URL"
                      value={formData.github}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="portfolio">
                    Portfolio
                  </label>

                  <div className="signup-input-with-icon">
                    <Globe size={18} />

                    <input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      placeholder="Portfolio website"
                      value={formData.portfolio}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="signup-field">
                  <label htmlFor="resumeUrl">
                    Resume URL
                  </label>

                  <input
                    id="resumeUrl"
                    name="resumeUrl"
                    type="url"
                    placeholder="Resume link"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="signup-completion-message">
                <CheckCircle2 size={20} />

                <div>
                  <strong>
                    Your student profile is almost ready.
                  </strong>

                  <p>
                    Review your information and create
                    your StartupSync student account.
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
                Create Student Account
                <CheckCircle2 size={18} />
              </button>
            )}

          </div>

        </form>

        <div className="student-signup-footer">

          <span>
            Already have a StartupSync account?
          </span>

          <button
            type="button"
            onClick={() => navigate("/login/student")}
          >
            Sign in as Student
          </button>

        </div>

      </div>
    </main>
  );
}

export default StudentSignup;