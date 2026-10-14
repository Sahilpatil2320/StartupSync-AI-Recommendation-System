import { useState } from "react";
import {
  Rocket,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Globe,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../../services/api";
import "./FounderStartup.css";

const initialForm = {
  title: "",
  organizer: "",
  type: "Internship",
  category: "",
  mode: "Online",
  location: "Online",
  duration: "",
  date: "",
  description: "",
  registrationUrl: "",
  tags: "",
};

function FounderStartup() {
  const [opportunity, setOpportunity] = useState(initialForm);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setOpportunity((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      setMessage("Please log in again to publish an opportunity.");
      setMessageType("error");
      return;
    }

    try {
      setPublishing(true);
      setMessage("");

      const payload = {
        ...opportunity,
        tags: opportunity.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        date: opportunity.date || undefined,
      };

      delete payload.duration;

      await api.post("/opportunities", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Opportunity published successfully!");
      setMessageType("success");
      setOpportunity({ ...initialForm });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to publish the opportunity. Please check the backend."
      );
      setMessageType("error");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="founder-startup-page">
      <section className="founder-startup-header">
        <div className="founder-startup-header-icon">
          <Rocket size={25} />
        </div>

        <div>
          <span className="founder-startup-badge">
            Founder Workspace
          </span>
          <h2>My Startup</h2>
          <p>
            Manage your startup and share opportunities with the
            StartupSync community.
          </p>
        </div>
      </section>

      <section className="founder-startup-info-grid">
        <article className="founder-startup-info-card">
          <div className="founder-startup-info-icon">
            <Building2 size={22} />
          </div>
          <div>
            <h3>Startup Profile</h3>
            <p>
              Keep your startup information updated so investors,
              mentors, and students can understand your work.
            </p>
          </div>
        </article>

        <article className="founder-startup-info-card">
          <div className="founder-startup-info-icon">
            <Lightbulb size={22} />
          </div>
          <div>
            <h3>Share Your Vision</h3>
            <p>
              Describe your product, the problem you solve, and
              the opportunities your startup offers.
            </p>
          </div>
        </article>
      </section>

      <section className="founder-startup-content-card">
        <div className="founder-startup-section-heading">
          <Rocket size={20} />
          <div>
            <h3>Startup Overview</h3>
            <p>
              Use your startup profile to introduce your organization
              to the ecosystem.
            </p>
          </div>
        </div>

        <div className="founder-startup-overview">
          <div>
            <span>Purpose</span>
            <p>
              Connect with investors, mentors, and potential team
              members through StartupSync.
            </p>
          </div>

          <div>
            <span>What you can do</span>
            <p>
              Publish internships, jobs, workshops, hackathons,
              and other opportunities for students.
            </p>
          </div>
        </div>
      </section>

      <section className="publish-opportunity-section">
        <div className="publish-opportunity-heading">
          <div className="publish-opportunity-icon">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <h3>Publish an Opportunity</h3>
            <p>
              Publish a genuine opportunity for students to discover
              and apply.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="publish-opportunity-grid">
            <div className="publish-opportunity-field">
              <label htmlFor="op-title">Opportunity Title *</label>
              <input
                id="op-title"
                name="title"
                value={opportunity.title}
                onChange={handleChange}
                placeholder="e.g. Java Developer Intern"
                required
              />
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-organizer">Organization Name *</label>
              <input
                id="op-organizer"
                name="organizer"
                value={opportunity.organizer}
                onChange={handleChange}
                placeholder="Enter your organization name"
                required
              />
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-type">Opportunity Type *</label>
              <select
                id="op-type"
                name="type"
                value={opportunity.type}
                onChange={handleChange}
                required
              >
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Competition">Competition</option>
                <option value="Event">Event</option>
                <option value="Program">Program</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-category">Category *</label>
              <input
                id="op-category"
                name="category"
                value={opportunity.category}
                onChange={handleChange}
                placeholder="e.g. Software Development"
                required
              />
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-mode">Work Mode</label>
              <select
                id="op-mode"
                name="mode"
                value={opportunity.mode}
                onChange={handleChange}
              >
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-location">
                <MapPin size={14} /> Location
              </label>
              <input
                id="op-location"
                name="location"
                value={opportunity.location}
                onChange={handleChange}
                placeholder="e.g. Pune or Online"
              />
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-duration">Duration</label>
              <input
                id="op-duration"
                name="duration"
                value={opportunity.duration}
                onChange={handleChange}
                placeholder="e.g. 3 months"
              />
            </div>

            <div className="publish-opportunity-field">
              <label htmlFor="op-date">Last Date / Event Date</label>
              <input
                id="op-date"
                name="date"
                type="date"
                value={opportunity.date}
                onChange={handleChange}
              />
            </div>

            <div className="publish-opportunity-field publish-opportunity-full">
              <label htmlFor="op-url">
                <Globe size={14} /> Application or Registration URL
              </label>
              <input
                id="op-url"
                name="registrationUrl"
                type="url"
                value={opportunity.registrationUrl}
                onChange={handleChange}
                placeholder="https://example.com/apply"
              />
            </div>

            <div className="publish-opportunity-field publish-opportunity-full">
              <label htmlFor="op-tags">Tags</label>
              <input
                id="op-tags"
                name="tags"
                value={opportunity.tags}
                onChange={handleChange}
                placeholder="Java, React, Backend, Remote"
              />
              <small>Separate each tag with a comma.</small>
            </div>

            <div className="publish-opportunity-field publish-opportunity-full">
              <label htmlFor="op-description">Description *</label>
              <textarea
                id="op-description"
                name="description"
                value={opportunity.description}
                onChange={handleChange}
                placeholder="Explain the role, eligibility, responsibilities, and how to apply."
                rows={5}
                required
              />
            </div>
          </div>

          {message && (
            <div
              className={`publish-opportunity-message ${
                messageType === "success" ? "message-success" : "message-error"
              }`}
              role="status"
            >
              {messageType === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{message}</span>
            </div>
          )}

          <button
            className="publish-opportunity-submit"
            type="submit"
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Opportunity"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default FounderStartup;
