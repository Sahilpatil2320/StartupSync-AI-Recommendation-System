import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  MapPin,
  Search,
  Send,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./StudentApplications.css";

const applicationData = [
  {
    id: 1,
    company: "FinFlow Technologies",
    role: "MERN Stack Intern",
    type: "Internship",
    location: "Pune, Maharashtra",
    mode: "Hybrid",
    appliedDate: "September 22, 2026",
    status: "Interview",
    lastUpdated: "2 days ago",
    recruiter: "Priya Sharma",
    recruiterRole: "Talent Acquisition",
    interviewDate: "October 2, 2026",
    interviewTime: "11:00 AM",
    description:
      "MERN Stack internship focused on building production-ready web applications with React, Node.js, Express.js and MongoDB.",
    skills: ["React.js", "Node.js", "MongoDB", "JavaScript"],
    stages: [
      {
        label: "Application Submitted",
        date: "September 22, 2026",
        completed: true
      },
      {
        label: "Application Reviewed",
        date: "September 24, 2026",
        completed: true
      },
      {
        label: "Interview Scheduled",
        date: "October 2, 2026",
        completed: true
      },
      {
        label: "Final Decision",
        date: "Pending",
        completed: false
      }
    ]
  },
  {
    id: 2,
    company: "TechNova Solutions",
    role: "Frontend Developer Intern",
    type: "Internship",
    location: "Bangalore, Karnataka",
    mode: "Remote",
    appliedDate: "September 18, 2026",
    status: "Under Review",
    lastUpdated: "4 days ago",
    recruiter: "Rahul Mehta",
    recruiterRole: "Recruitment Manager",
    interviewDate: null,
    interviewTime: null,
    description:
      "Frontend development opportunity involving responsive interfaces, reusable React components and collaboration with product designers.",
    skills: ["HTML", "CSS", "JavaScript", "React.js"],
    stages: [
      {
        label: "Application Submitted",
        date: "September 18, 2026",
        completed: true
      },
      {
        label: "Application Reviewed",
        date: "September 21, 2026",
        completed: true
      },
      {
        label: "Interview",
        date: "Pending",
        completed: false
      },
      {
        label: "Final Decision",
        date: "Pending",
        completed: false
      }
    ]
  },
  {
    id: 3,
    company: "AgriNova Labs",
    role: "Software Developer Intern",
    type: "Internship",
    location: "Nagpur, Maharashtra",
    mode: "On-site",
    appliedDate: "September 10, 2026",
    status: "Accepted",
    lastUpdated: "1 week ago",
    recruiter: "Amit Patil",
    recruiterRole: "Engineering Manager",
    interviewDate: null,
    interviewTime: null,
    description:
      "Software development internship working on technology products for agricultural and supply-chain use cases.",
    skills: ["Java", "Python", "SQL", "Git"],
    stages: [
      {
        label: "Application Submitted",
        date: "September 10, 2026",
        completed: true
      },
      {
        label: "Application Reviewed",
        date: "September 12, 2026",
        completed: true
      },
      {
        label: "Interview Completed",
        date: "September 16, 2026",
        completed: true
      },
      {
        label: "Offer Accepted",
        date: "September 20, 2026",
        completed: true
      }
    ]
  },
  {
    id: 4,
    company: "HealthNest Innovations",
    role: "Backend Developer Intern",
    type: "Internship",
    location: "Mumbai, Maharashtra",
    mode: "Hybrid",
    appliedDate: "September 5, 2026",
    status: "Rejected",
    lastUpdated: "2 weeks ago",
    recruiter: "Neha Kulkarni",
    recruiterRole: "HR Manager",
    interviewDate: null,
    interviewTime: null,
    description:
      "Backend development role involving REST APIs, database operations and application services.",
    skills: ["Node.js", "Express.js", "MongoDB", "REST API"],
    stages: [
      {
        label: "Application Submitted",
        date: "September 5, 2026",
        completed: true
      },
      {
        label: "Application Reviewed",
        date: "September 8, 2026",
        completed: true
      },
      {
        label: "Interview",
        date: "Not Selected",
        completed: true
      },
      {
        label: "Final Decision",
        date: "September 14, 2026",
        completed: true
      }
    ]
  },
  {
    id: 5,
    company: "EduBridge",
    role: "Full Stack Developer Intern",
    type: "Internship",
    location: "Remote",
    mode: "Remote",
    appliedDate: "August 28, 2026",
    status: "Interview",
    lastUpdated: "3 weeks ago",
    recruiter: "Ananya Rao",
    recruiterRole: "People Operations",
    interviewDate: "October 4, 2026",
    interviewTime: "3:30 PM",
    description:
      "Full-stack development opportunity focused on building features for an education technology platform.",
    skills: ["React.js", "Node.js", "MongoDB", "REST API"],
    stages: [
      {
        label: "Application Submitted",
        date: "August 28, 2026",
        completed: true
      },
      {
        label: "Application Reviewed",
        date: "August 31, 2026",
        completed: true
      },
      {
        label: "Interview Scheduled",
        date: "October 4, 2026",
        completed: true
      },
      {
        label: "Final Decision",
        date: "Pending",
        completed: false
      }
    ]
  },
  {
    id: 6,
    company: "GreenGrid Systems",
    role: "Software Engineering Intern",
    type: "Internship",
    location: "Hyderabad, Telangana",
    mode: "Hybrid",
    appliedDate: "August 20, 2026",
    status: "Under Review",
    lastUpdated: "1 month ago",
    recruiter: "Vikram Joshi",
    recruiterRole: "Engineering Recruiter",
    interviewDate: null,
    interviewTime: null,
    description:
      "Software engineering opportunity focused on technology solutions for sustainable infrastructure.",
    skills: ["Java", "Python", "SQL", "Git"],
    stages: [
      {
        label: "Application Submitted",
        date: "August 20, 2026",
        completed: true
      },
      {
        label: "Application Reviewed",
        date: "August 24, 2026",
        completed: true
      },
      {
        label: "Interview",
        date: "Pending",
        completed: false
      },
      {
        label: "Final Decision",
        date: "Pending",
        completed: false
      }
    ]
  }
];

const statusOptions = [
  "All Statuses",
  "Under Review",
  "Interview",
  "Accepted",
  "Rejected"
];

const typeOptions = [
  "All Types",
  "Internship",
  "Job",
  "Opportunity"
];

function StudentApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Statuses");
  const [typeFilter, setTypeFilter] =
    useState("All Types");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [withdrawnApplications, setWithdrawnApplications] =
    useState([]);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return applicationData.filter((application) => {
      const matchesWithdrawn =
        !withdrawnApplications.includes(application.id);

      const matchesSearch =
        !search ||
        application.company
          .toLowerCase()
          .includes(search) ||
        application.role
          .toLowerCase()
          .includes(search) ||
        application.location
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        application.status === statusFilter;

      const matchesType =
        typeFilter === "All Types" ||
        application.type === typeFilter;

      return (
        matchesWithdrawn &&
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    searchTerm,
    statusFilter,
    typeFilter,
    withdrawnApplications
  ]);

  const stats = {
    total: applicationData.length,
    review: applicationData.filter(
      (application) =>
        application.status === "Under Review"
    ).length,
    interview: applicationData.filter(
      (application) =>
        application.status === "Interview"
    ).length,
    accepted: applicationData.filter(
      (application) =>
        application.status === "Accepted"
    ).length
  };

  const handleWithdraw = (applicationId) => {
    setWithdrawnApplications((current) => [
      ...current,
      applicationId
    ]);

    setSelectedApplication(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setTypeFilter("All Types");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Accepted":
        return "application-status-accepted";

      case "Interview":
        return "application-status-interview";

      case "Rejected":
        return "application-status-rejected";

      default:
        return "application-status-review";
    }
  };

  return (
    <section className="student-applications-page">
      <div className="student-applications-header">
        <div>
          <span className="student-applications-badge">
            <FileText size={15} />
            Application Tracker
          </span>

          <h2>My Applications</h2>

          <p>
            Track your applications and stay updated on
            every stage of your opportunities.
          </p>
        </div>

        <div className="student-application-stats">
          <div>
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{stats.review}</strong>
            <span>Review</span>
          </div>

          <div>
            <strong>{stats.interview}</strong>
            <span>Interview</span>
          </div>

          <div>
            <strong>{stats.accepted}</strong>
            <span>Accepted</span>
          </div>
        </div>
      </div>

      <div className="student-applications-toolbar">
        <div className="student-applications-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search company, role or location..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="student-applications-filter">
          <Filter size={16} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="student-applications-filter">
          <BriefcaseBusiness size={16} />

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            {typeOptions.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="student-applications-clear"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>

      <div className="student-applications-result-heading">
        <div>
          <h3>Application History</h3>

          <p>
            {filteredApplications.length} application
            {filteredApplications.length !== 1
              ? "s"
              : ""}{" "}
            shown
          </p>
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="student-applications-list">
          {filteredApplications.map((application) => (
            <article
              className="student-application-card"
              key={application.id}
            >
              <div className="student-application-main">
                <div className="student-application-company-icon">
                  {application.company.charAt(0)}
                </div>

                <div className="student-application-info">
                  <div className="student-application-title-row">
                    <div>
                      <h4>{application.role}</h4>

                      <p>{application.company}</p>
                    </div>

                    <span
                      className={`student-application-status ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="student-application-meta">
                    <span>
                      <MapPin size={14} />
                      {application.location}
                    </span>

                    <span>
                      <BriefcaseBusiness size={14} />
                      {application.mode}
                    </span>

                    <span>
                      <CalendarDays size={14} />
                      Applied {application.appliedDate}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      Updated {application.lastUpdated}
                    </span>
                  </div>

                  <div className="student-application-skills">
                    {application.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="student-application-progress">
                {application.stages.map(
                  (stage, index) => (
                    <div
                      className="student-application-stage"
                      key={stage.label}
                    >
                      <div
                        className={`student-stage-marker ${
                          stage.completed
                            ? "student-stage-completed"
                            : ""
                        }`}
                      >
                        {stage.completed ? (
                          <Check size={13} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div>
                        <strong>{stage.label}</strong>

                        <span>{stage.date}</span>
                      </div>

                      {index <
                        application.stages.length - 1 && (
                        <div
                          className={`student-stage-line ${
                            stage.completed
                              ? "student-stage-line-active"
                              : ""
                          }`}
                        />
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="student-application-actions">
                {application.interviewDate && (
                  <div className="student-interview-note">
                    <CalendarDays size={15} />

                    <span>
                      Interview:{" "}
                      <strong>
                        {application.interviewDate}
                      </strong>{" "}
                      at{" "}
                      <strong>
                        {application.interviewTime}
                      </strong>
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="student-application-view"
                  onClick={() =>
                    setSelectedApplication(
                      application
                    )
                  }
                >
                  View Application
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="student-applications-empty">
          <div className="student-applications-empty-icon">
            <FileText size={25} />
          </div>

          <h3>No applications found</h3>

          <p>
            No applications match your current search and
            filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {selectedApplication && (
        <div
          className="student-application-modal-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="student-application-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="student-application-modal-header">
              <div className="student-application-modal-title">
                <div className="student-application-modal-icon">
                  {selectedApplication.company.charAt(0)}
                </div>

                <div>
                  <span
                    className={`student-application-status ${getStatusClass(
                      selectedApplication.status
                    )}`}
                  >
                    {selectedApplication.status}
                  </span>

                  <h3>
                    {selectedApplication.role}
                  </h3>

                  <p>
                    {selectedApplication.company}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="student-application-close"
                onClick={() =>
                  setSelectedApplication(null)
                }
                aria-label="Close application details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-application-modal-details">
              <div>
                <MapPin size={17} />

                <span>
                  {selectedApplication.location}
                </span>
              </div>

              <div>
                <BriefcaseBusiness size={17} />

                <span>
                  {selectedApplication.mode}
                </span>
              </div>

              <div>
                <CalendarDays size={17} />

                <span>
                  {selectedApplication.appliedDate}
                </span>
              </div>

              <div>
                <UserRound size={17} />

                <span>
                  {selectedApplication.recruiter}
                </span>
              </div>
            </div>

            <div className="student-application-modal-section">
              <h4>About the Position</h4>

              <p>
                {selectedApplication.description}
              </p>
            </div>

            <div className="student-application-modal-section">
              <h4>Required Skills</h4>

              <div className="student-application-modal-skills">
                {selectedApplication.skills.map(
                  (skill) => (
                    <span key={skill}>{skill}</span>
                  )
                )}
              </div>
            </div>

            <div className="student-application-modal-section">
              <h4>Application Progress</h4>

              <div className="student-modal-timeline">
                {selectedApplication.stages.map(
                  (stage, index) => (
                    <div
                      className="student-modal-timeline-item"
                      key={stage.label}
                    >
                      <div
                        className={`student-modal-timeline-marker ${
                          stage.completed
                            ? "student-modal-timeline-completed"
                            : ""
                        }`}
                      >
                        {stage.completed ? (
                          <Check size={13} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div>
                        <strong>
                          {stage.label}
                        </strong>

                        <span>{stage.date}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {selectedApplication.interviewDate && (
              <div className="student-application-interview-card">
                <CalendarDays size={19} />

                <div>
                  <strong>
                    Upcoming Interview
                  </strong>

                  <span>
                    {selectedApplication.interviewDate}
                    {" • "}
                    {selectedApplication.interviewTime}
                  </span>
                </div>
              </div>
            )}

            <div className="student-application-recruiter">
              <div className="student-recruiter-avatar">
                {selectedApplication.recruiter.charAt(0)}
              </div>

              <div>
                <strong>
                  {selectedApplication.recruiter}
                </strong>

                <span>
                  {selectedApplication.recruiterRole}
                </span>
              </div>
            </div>

            <div className="student-application-modal-actions">
              <button
                type="button"
                className="student-application-close-button"
                onClick={() =>
                  setSelectedApplication(null)
                }
              >
                Close
              </button>

              {selectedApplication.status !==
                "Accepted" &&
                selectedApplication.status !==
                  "Rejected" && (
                  <button
                    type="button"
                    className="student-application-withdraw"
                    onClick={() =>
                      handleWithdraw(
                        selectedApplication.id
                      )
                    }
                  >
                    <Send size={15} />
                    Withdraw Application
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentApplications;