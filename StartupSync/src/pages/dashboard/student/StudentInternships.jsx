import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  Filter,
  IndianRupee,
  MapPin,
  Search,
  UsersRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./StudentInternships.css";

const internshipData = [
  {
    id: 1,
    company: "FinFlow Technologies",
    role: "MERN Stack Intern",
    domain: "Web Development",
    location: "Pune, Maharashtra",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹15,000 / month",
    applicants: 84,
    match: 96,
    posted: "2 days ago",
    description:
      "Work with the development team to build scalable web applications using React, Node.js, Express.js and MongoDB.",
    skills: ["React.js", "Node.js", "MongoDB", "JavaScript"]
  },
  {
    id: 2,
    company: "TechNova Solutions",
    role: "Frontend Developer Intern",
    domain: "Frontend Development",
    location: "Bangalore, Karnataka",
    mode: "Remote",
    duration: "4 Months",
    stipend: "₹12,000 / month",
    applicants: 126,
    match: 91,
    posted: "3 days ago",
    description:
      "Help create responsive and user-friendly interfaces while working closely with designers and backend developers.",
    skills: ["HTML", "CSS", "JavaScript", "React.js"]
  },
  {
    id: 3,
    company: "AgriNova Labs",
    role: "Software Developer Intern",
    domain: "Software Development",
    location: "Nagpur, Maharashtra",
    mode: "On-site",
    duration: "6 Months",
    stipend: "₹10,000 / month",
    applicants: 68,
    match: 88,
    posted: "5 days ago",
    description:
      "Contribute to software products focused on solving real-world agricultural and supply-chain challenges.",
    skills: ["Java", "Python", "SQL", "Git"]
  },
  {
    id: 4,
    company: "HealthNest Innovations",
    role: "Backend Developer Intern",
    domain: "Backend Development",
    location: "Mumbai, Maharashtra",
    mode: "Hybrid",
    duration: "5 Months",
    stipend: "₹14,000 / month",
    applicants: 93,
    match: 86,
    posted: "1 week ago",
    description:
      "Build backend APIs and services while working with databases and cloud-based application architecture.",
    skills: ["Node.js", "Express.js", "MongoDB", "REST API"]
  },
  {
    id: 5,
    company: "EduBridge",
    role: "Full Stack Developer Intern",
    domain: "Full Stack Development",
    location: "Remote",
    mode: "Remote",
    duration: "6 Months",
    stipend: "₹18,000 / month",
    applicants: 157,
    match: 94,
    posted: "1 week ago",
    description:
      "Join the product engineering team and develop full-stack features for a modern education technology platform.",
    skills: ["React.js", "Node.js", "MongoDB", "REST API"]
  },
  {
    id: 6,
    company: "GreenGrid Systems",
    role: "Software Engineering Intern",
    domain: "Software Development",
    location: "Hyderabad, Telangana",
    mode: "Hybrid",
    duration: "6 Months",
    stipend: "₹16,000 / month",
    applicants: 72,
    match: 83,
    posted: "2 weeks ago",
    description:
      "Assist engineers in developing technology solutions for sustainable energy and smart infrastructure.",
    skills: ["Java", "Python", "SQL", "Git"]
  }
];

const filterOptions = {
  domain: [
    "All Domains",
    "Web Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Software Development"
  ],
  mode: ["All Modes", "Remote", "Hybrid", "On-site"],
  duration: ["All Durations", "4 Months", "5 Months", "6 Months"],
  location: [
    "All Locations",
    "Remote",
    "Pune",
    "Bangalore",
    "Nagpur",
    "Mumbai",
    "Hyderabad"
  ]
};

function StudentInternships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [modeFilter, setModeFilter] = useState("All Modes");
  const [durationFilter, setDurationFilter] = useState("All Durations");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  const [savedInternships, setSavedInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const filteredInternships = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return internshipData.filter((internship) => {
      const matchesSearch =
        !search ||
        internship.company.toLowerCase().includes(search) ||
        internship.role.toLowerCase().includes(search) ||
        internship.domain.toLowerCase().includes(search) ||
        internship.skills.some((skill) =>
          skill.toLowerCase().includes(search)
        );

      const matchesDomain =
        domainFilter === "All Domains" ||
        internship.domain === domainFilter;

      const matchesMode =
        modeFilter === "All Modes" ||
        internship.mode === modeFilter;

      const matchesDuration =
        durationFilter === "All Durations" ||
        internship.duration === durationFilter;

      const matchesLocation =
        locationFilter === "All Locations" ||
        internship.location.toLowerCase().includes(
          locationFilter.toLowerCase()
        ) ||
        (locationFilter === "Remote" && internship.mode === "Remote");

      return (
        matchesSearch &&
        matchesDomain &&
        matchesMode &&
        matchesDuration &&
        matchesLocation
      );
    });
  }, [
    searchTerm,
    domainFilter,
    modeFilter,
    durationFilter,
    locationFilter
  ]);

  const toggleSave = (internshipId) => {
    setSavedInternships((current) =>
      current.includes(internshipId)
        ? current.filter((id) => id !== internshipId)
        : [...current, internshipId]
    );
  };

  const handleApply = (internshipId) => {
    setAppliedInternships((current) =>
      current.includes(internshipId)
        ? current
        : [...current, internshipId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDomainFilter("All Domains");
    setModeFilter("All Modes");
    setDurationFilter("All Durations");
    setLocationFilter("All Locations");
  };

  return (
    <section className="student-internships-page">
      <div className="student-internships-header">
        <div>
          <span className="student-internships-badge">
            <BriefcaseBusiness size={15} />
            Internship Opportunities
          </span>

          <h2>Find Your Next Internship</h2>

          <p>
            Discover internships that match your skills,
            interests and career goals.
          </p>
        </div>

        <div className="student-internships-summary">
          <div>
            <strong>{filteredInternships.length}</strong>
            <span>Opportunities</span>
          </div>

          <div>
            <strong>{savedInternships.length}</strong>
            <span>Saved</span>
          </div>

          <div>
            <strong>{appliedInternships.length}</strong>
            <span>Applied</span>
          </div>
        </div>
      </div>

      <div className="student-internship-search-panel">
        <div className="student-internship-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by role, company, domain or skill..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="student-internship-filter-title">
          <Filter size={17} />
          <span>Filters</span>
        </div>

        <div className="student-internship-filters">
          <select
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value)}
          >
            {filterOptions.domain.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value)}
          >
            {filterOptions.mode.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={durationFilter}
            onChange={(event) => setDurationFilter(event.target.value)}
          >
            {filterOptions.duration.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            {filterOptions.location.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <button
            type="button"
            className="student-clear-filter-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="student-internship-results-header">
        <div>
          <h3>Recommended Internships</h3>
          <p>
            Opportunities are currently shown using demo
            recommendation data.
          </p>
        </div>

        <span>
          {filteredInternships.length} results
        </span>
      </div>

      {filteredInternships.length > 0 ? (
        <div className="student-internship-grid">
          {filteredInternships.map((internship) => {
            const isSaved = savedInternships.includes(internship.id);
            const isApplied = appliedInternships.includes(internship.id);

            return (
              <article
                className="student-internship-card"
                key={internship.id}
              >
                <div className="student-internship-card-top">
                  <div className="student-company-logo">
                    {internship.company.charAt(0)}
                  </div>

                  <button
                    type="button"
                    className={`student-save-button ${
                      isSaved ? "student-save-active" : ""
                    }`}
                    onClick={() => toggleSave(internship.id)}
                    aria-label={
                      isSaved
                        ? "Remove saved internship"
                        : "Save internship"
                    }
                  >
                    <Bookmark
                      size={19}
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="student-internship-match">
                  {internship.match}% Match
                </div>

                <h4>{internship.role}</h4>

                <p className="student-internship-company">
                  {internship.company}
                </p>

                <div className="student-internship-meta">
                  <span>
                    <MapPin size={15} />
                    {internship.location}
                  </span>

                  <span>
                    <BriefcaseBusiness size={15} />
                    {internship.mode}
                  </span>

                  <span>
                    <Clock3 size={15} />
                    {internship.duration}
                  </span>

                  <span>
                    <IndianRupee size={15} />
                    {internship.stipend}
                  </span>
                </div>

                <div className="student-internship-skills">
                  {internship.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>

                <div className="student-internship-card-footer">
                  <span className="student-internship-posted">
                    <CalendarDays size={14} />
                    {internship.posted}
                  </span>

                  <span className="student-internship-applicants">
                    <UsersRound size={14} />
                    {internship.applicants} applicants
                  </span>
                </div>

                <div className="student-internship-actions">
                  <button
                    type="button"
                    className="student-view-button"
                    onClick={() =>
                      setSelectedInternship(internship)
                    }
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className={`student-apply-button ${
                      isApplied
                        ? "student-apply-completed"
                        : ""
                    }`}
                    onClick={() => handleApply(internship.id)}
                    disabled={isApplied}
                  >
                    {isApplied ? (
                      <>
                        <Check size={16} />
                        Applied
                      </>
                    ) : (
                      <>
                        Apply
                        <ExternalLink size={15} />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="student-internship-empty">
          <div className="student-internship-empty-icon">
            <Search size={25} />
          </div>

          <h3>No internships found</h3>

          <p>
            Try changing your search or clearing some filters
            to discover more opportunities.
          </p>

          <button
            type="button"
            className="student-empty-clear-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {selectedInternship && (
        <div
          className="student-internship-modal-overlay"
          onClick={() => setSelectedInternship(null)}
        >
          <div
            className="student-internship-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-internship-modal-header">
              <div>
                <span className="student-internship-modal-badge">
                  {selectedInternship.match}% Match
                </span>

                <h3>{selectedInternship.role}</h3>

                <p>{selectedInternship.company}</p>
              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={() => setSelectedInternship(null)}
                aria-label="Close internship details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-modal-details">
              <div>
                <MapPin size={17} />
                <span>{selectedInternship.location}</span>
              </div>

              <div>
                <BriefcaseBusiness size={17} />
                <span>{selectedInternship.mode}</span>
              </div>

              <div>
                <Clock3 size={17} />
                <span>{selectedInternship.duration}</span>
              </div>

              <div>
                <IndianRupee size={17} />
                <span>{selectedInternship.stipend}</span>
              </div>
            </div>

            <div className="student-modal-section">
              <h4>About the Internship</h4>
              <p>{selectedInternship.description}</p>
            </div>

            <div className="student-modal-section">
              <h4>Required Skills</h4>

              <div className="student-modal-skills">
                {selectedInternship.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="student-modal-section">
              <h4>Opportunity Details</h4>

              <div className="student-modal-opportunity-grid">
                <div>
                  <span>Domain</span>
                  <strong>{selectedInternship.domain}</strong>
                </div>

                <div>
                  <span>Applicants</span>
                  <strong>{selectedInternship.applicants}</strong>
                </div>

                <div>
                  <span>Posted</span>
                  <strong>{selectedInternship.posted}</strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>{selectedInternship.duration}</strong>
                </div>
              </div>
            </div>

            <div className="student-modal-actions">
              <button
                type="button"
                className="student-modal-save"
                onClick={() =>
                  toggleSave(selectedInternship.id)
                }
              >
                <Bookmark
                  size={17}
                  fill={
                    savedInternships.includes(
                      selectedInternship.id
                    )
                      ? "currentColor"
                      : "none"
                  }
                />

                {savedInternships.includes(
                  selectedInternship.id
                )
                  ? "Saved"
                  : "Save Internship"}
              </button>

              <button
                type="button"
                className="student-modal-apply"
                disabled={appliedInternships.includes(
                  selectedInternship.id
                )}
                onClick={() =>
                  handleApply(selectedInternship.id)
                }
              >
                {appliedInternships.includes(
                  selectedInternship.id
                )
                  ? "Application Submitted"
                  : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentInternships;