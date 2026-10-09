import {
  CalendarDays,
  Check,
  Clock3,
  MessageSquare,
  MoreVertical,
  Search,
  UserRound,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./MentorMentorships.css";

const initialMentorships = [
  {
    id: 1,
    startup: "FinFlow",
    founder: "Rahul Mehta",
    industry: "FinTech",
    stage: "Seed",
    focus: "Business Strategy",
    status: "pending",
    requestedDate: "Sep 26, 2026",
    message:
      "We are looking for guidance on our business strategy and early-stage growth plans."
  },
  {
    id: 2,
    startup: "HealthNest",
    founder: "Ananya Sharma",
    industry: "HealthTech",
    stage: "Pre-Seed",
    focus: "Product Strategy",
    status: "active",
    requestedDate: "Sep 18, 2026",
    nextMeeting: "Oct 2, 2026",
    sessions: 4,
    message:
      "Helping the founding team validate product direction and prioritize upcoming features."
  },
  {
    id: 3,
    startup: "AgriNova",
    founder: "Vikram Patil",
    industry: "AgriTech",
    stage: "Seed",
    focus: "Fundraising",
    status: "active",
    requestedDate: "Sep 12, 2026",
    nextMeeting: "Oct 5, 2026",
    sessions: 6,
    message:
      "Supporting the founders with fundraising preparation and investor communication."
  },
  {
    id: 4,
    startup: "EduBridge",
    founder: "Priya Deshmukh",
    industry: "EdTech",
    stage: "Growth",
    focus: "Marketing Strategy",
    status: "completed",
    requestedDate: "Jul 10, 2026",
    completedDate: "Sep 15, 2026",
    sessions: 8,
    message:
      "Mentorship focused on customer acquisition, marketing planning and growth."
  },
  {
    id: 5,
    startup: "GreenGrid",
    founder: "Amit Joshi",
    industry: "CleanTech",
    stage: "Pre-Seed",
    focus: "Business Development",
    status: "declined",
    requestedDate: "Aug 28, 2026",
    message:
      "Startup requested guidance around partnerships and early business development."
  }
];

const tabs = [
  {
    id: "all",
    label: "All"
  },
  {
    id: "pending",
    label: "Pending"
  },
  {
    id: "active",
    label: "Active"
  },
  {
    id: "completed",
    label: "Completed"
  }
];

function MentorMentorships() {
  const [mentorships, setMentorships] =
    useState(initialMentorships);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentorship, setSelectedMentorship] =
    useState(null);

  const filteredMentorships = useMemo(() => {
    const normalizedSearch = searchTerm
      .toLowerCase()
      .trim();

    return mentorships.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        item.status === activeTab;

      const matchesSearch =
        !normalizedSearch ||
        item.startup
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.founder
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.industry
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.focus
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [mentorships, activeTab, searchTerm]);

  const counts = {
    all: mentorships.length,
    pending: mentorships.filter(
      (item) => item.status === "pending"
    ).length,
    active: mentorships.filter(
      (item) => item.status === "active"
    ).length,
    completed: mentorships.filter(
      (item) => item.status === "completed"
    ).length
  };

  const updateStatus = (id, status) => {
    setMentorships((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status
            }
          : item
      )
    );

    setSelectedMentorship(null);
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      active: "Active",
      completed: "Completed",
      declined: "Declined"
    };

    return labels[status] || status;
  };

  return (
    <div className="mentor-mentorships-page">
      {/* Header */}

      <section className="mentor-mentorships-header">
        <div>
          <span className="mentor-mentorships-badge">
            Mentorship Management
          </span>

          <h2>My Mentorships</h2>

          <p>
            Manage mentorship requests, active relationships
            and completed mentoring engagements.
          </p>
        </div>

        <div className="mentor-mentorships-summary">
          <div>
            <strong>{counts.active}</strong>
            <span>Active</span>
          </div>

          <div>
            <strong>{counts.pending}</strong>
            <span>Pending</span>
          </div>
        </div>
      </section>

      {/* Search */}

      <section className="mentor-mentorships-toolbar">
        <div className="mentor-mentorships-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search startups, founders or expertise..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>
      </section>

      {/* Tabs */}

      <section className="mentor-mentorships-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id
                ? "mentor-mentorship-tab active"
                : "mentor-mentorship-tab"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}

            <span>{counts[tab.id]}</span>
          </button>
        ))}
      </section>

      {/* Mentorship list */}

      {filteredMentorships.length > 0 ? (
        <section className="mentor-mentorships-list">
          {filteredMentorships.map((item) => (
            <article
              className="mentor-mentorship-card"
              key={item.id}
            >
              <div className="mentor-mentorship-card-main">
                <div className="mentor-mentorship-avatar">
                  {item.startup.charAt(0)}
                </div>

                <div className="mentor-mentorship-content">
                  <div className="mentor-mentorship-title-row">
                    <div>
                      <h3>{item.startup}</h3>

                      <p>
                        Founder: {item.founder}
                      </p>
                    </div>

                    <span
                      className={`mentor-mentorship-status status-${item.status}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mentor-mentorship-meta">
                    <span>{item.industry}</span>
                    <span>{item.stage}</span>
                    <span>{item.focus}</span>
                  </div>

                  <p className="mentor-mentorship-message">
                    {item.message}
                  </p>

                  <div className="mentor-mentorship-details">
                    <span>
                      <CalendarDays size={15} />

                      {item.status === "completed"
                        ? `Completed ${item.completedDate}`
                        : `Requested ${item.requestedDate}`}
                    </span>

                    {item.nextMeeting && (
                      <span>
                        <Clock3 size={15} />
                        Next meeting: {item.nextMeeting}
                      </span>
                    )}

                    {item.sessions && (
                      <span>
                        {item.sessions} sessions
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mentor-mentorship-actions">
                {item.status === "pending" && (
                  <>
                    <button
                      type="button"
                      className="mentor-mentorship-decline"
                      onClick={() =>
                        updateStatus(
                          item.id,
                          "declined"
                        )
                      }
                    >
                      <X size={16} />
                      Decline
                    </button>

                    <button
                      type="button"
                      className="mentor-mentorship-accept"
                      onClick={() =>
                        updateStatus(
                          item.id,
                          "active"
                        )
                      }
                    >
                      <Check size={16} />
                      Accept
                    </button>
                  </>
                )}

                {item.status === "active" && (
                  <button
                    type="button"
                    className="mentor-mentorship-message-button"
                    onClick={() =>
                      alert(
                        `Messaging with ${item.startup} will connect to the Messages module.`
                      )
                    }
                  >
                    <MessageSquare size={16} />
                    Message
                  </button>
                )}

                {item.status === "completed" && (
                  <button
                    type="button"
                    className="mentor-mentorship-view"
                    onClick={() =>
                      setSelectedMentorship(item)
                    }
                  >
                    View Summary
                  </button>
                )}

                <button
                  type="button"
                  className="mentor-mentorship-more"
                  onClick={() =>
                    setSelectedMentorship(item)
                  }
                  aria-label="View mentorship details"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mentor-mentorships-empty">
          <div className="mentor-mentorships-empty-icon">
            <UserRound size={27} />
          </div>

          <h3>No mentorships found</h3>

          <p>
            Try changing your search or selecting another
            mentorship status.
          </p>
        </section>
      )}

      {/* Details Modal */}

      {selectedMentorship && (
        <div
          className="mentor-mentorship-modal-overlay"
          onClick={() => setSelectedMentorship(null)}
        >
          <div
            className="mentor-mentorship-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mentor-mentorship-modal-header">
              <div>
                <span>Mentorship Details</span>
                <h3>{selectedMentorship.startup}</h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMentorship(null)
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mentor-mentorship-modal-body">
              <div className="mentor-modal-profile">
                <div className="mentor-modal-avatar">
                  {selectedMentorship.startup.charAt(0)}
                </div>

                <div>
                  <strong>
                    {selectedMentorship.founder}
                  </strong>

                  <span>
                    {selectedMentorship.industry} ·{" "}
                    {selectedMentorship.stage}
                  </span>
                </div>
              </div>

              <div className="mentor-modal-info-grid">
                <div>
                  <span>Mentoring Focus</span>
                  <strong>
                    {selectedMentorship.focus}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {getStatusLabel(
                      selectedMentorship.status
                    )}
                  </strong>
                </div>

                <div>
                  <span>Requested</span>
                  <strong>
                    {selectedMentorship.requestedDate}
                  </strong>
                </div>

                <div>
                  <span>Sessions</span>
                  <strong>
                    {selectedMentorship.sessions || 0}
                  </strong>
                </div>
              </div>

              <div className="mentor-modal-message">
                <span>Mentorship Objective</span>
                <p>
                  {selectedMentorship.message}
                </p>
              </div>
            </div>

            <div className="mentor-mentorship-modal-footer">
              {selectedMentorship.status ===
                "pending" && (
                <>
                  <button
                    type="button"
                    className="mentor-mentorship-decline"
                    onClick={() =>
                      updateStatus(
                        selectedMentorship.id,
                        "declined"
                      )
                    }
                  >
                    Decline Request
                  </button>

                  <button
                    type="button"
                    className="mentor-mentorship-accept"
                    onClick={() =>
                      updateStatus(
                        selectedMentorship.id,
                        "active"
                      )
                    }
                  >
                    <Check size={16} />
                    Accept Request
                  </button>
                </>
              )}

              {selectedMentorship.status === "active" && (
                <button
                  type="button"
                  className="mentor-mentorship-message-button"
                  onClick={() =>
                    alert(
                      "Messaging will connect to the Messages module."
                    )
                  }
                >
                  <MessageSquare size={16} />
                  Open Conversation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorMentorships;