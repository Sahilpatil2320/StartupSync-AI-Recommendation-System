import {
  CalendarDays,
  Check,
  Clock3,
  MessageSquare,
  MoreVertical,
  Search,
  UserRound,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../../services/api";
import "./MentorMentorships.css";

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

const getId = (value) =>
  String(value?._id || value?.id || value || "");

const formatDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return `${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "requested":
    case "pending":
      return "pending";

    case "confirmed":
    case "active":
      return "active";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
    case "declined":
      return "cancelled";

    default:
      return value || "pending";
  }
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
};

/*
 * Converts the backend MentorshipSession document
 * into the structure used by the existing UI.
 */
const mapSession = (session) => {
  const mentee =
    session.menteeUserId &&
    typeof session.menteeUserId === "object"
      ? session.menteeUserId
      : {};

  const goals = Array.isArray(session.goals)
    ? session.goals
    : [];

  const status = normalizeStatus(session.status);

  return {
    id: getId(session._id || session.id),

    founder:
      mentee.name ||
      mentee.fullName ||
      "StartupSync User",

    menteeEmail: mentee.email || "",
    menteeRole: mentee.role || session.menteeRole || "founder",

    // These fields are not present in the supplied session schema.
    startup: mentee.startupName || mentee.startup?.name || "",

    title: session.title || "Mentorship Session",

    status,

    requestedDate: formatDate(
      session.createdAt || session.scheduledDate
    ),

    scheduledDate: session.scheduledDate || null,

    scheduledDateLabel: formatDateTime(
      session.scheduledDate
    ),

    durationMinutes: Number(session.durationMinutes || 45),

    meetingLink: session.meetingLink || "",

    goals,

    message:
      goals.map((goal) => goal.text).filter(Boolean).join(", ") ||
      session.title ||
      "No mentorship objectives provided.",

    mentorNotes: session.mentorNotes || "",

    actionItems: Array.isArray(session.actionItems)
      ? session.actionItems
      : [],

    feedbackRating: session.feedbackRating ?? null,

    createdAt: session.createdAt || null,
    updatedAt: session.updatedAt || null,

    raw: session,
  };
};

function MentorMentorships() {
  const [mentorships, setMentorships] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMentorship, setSelectedMentorship] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ------------------------------------------
  // LOAD MENTORSHIP SESSIONS
  // ------------------------------------------

  const loadMentorships = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/mentorship/sessions");

      const rows = response.data?.sessions;

      if (!response.data?.success || !Array.isArray(rows)) {
        throw new Error(
          "Unexpected mentorship API response. Expected a sessions array."
        );
      }

      const mappedSessions = rows.map(mapSession);

      setMentorships(mappedSessions);

      setSelectedMentorship((current) => {
        if (!current) return null;

        return (
          mappedSessions.find(
            (item) => item.id === current.id
          ) || null
        );
      });
    } catch (err) {
      console.error("Load mentorships error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load mentorship sessions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMentorships();
  }, [loadMentorships]);

  // ------------------------------------------
  // COUNTS
  // ------------------------------------------

  const counts = useMemo(() => {
    return {
      all: mentorships.length,

      pending: mentorships.filter(
        (item) => item.status === "pending"
      ).length,

      active: mentorships.filter(
        (item) => item.status === "active"
      ).length,

      completed: mentorships.filter(
        (item) => item.status === "completed"
      ).length,
    };
  }, [mentorships]);

  // ------------------------------------------
  // SEARCH AND FILTER
  // ------------------------------------------

  const filteredMentorships = useMemo(() => {
    const normalizedSearch = searchTerm
      .toLowerCase()
      .trim();

    return mentorships.filter((item) => {
      const matchesTab =
        activeTab === "all" ||
        item.status === activeTab;

      const searchableText = [
        item.startup,
        item.founder,
        item.menteeEmail,
        item.menteeRole,
        item.title,
        item.message,
        item.status,
        ...item.goals.map((goal) => goal.text || ""),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [mentorships, activeTab, searchTerm]);

  // ------------------------------------------
  // UPDATE SESSION STATUS
  // ------------------------------------------

  const updateStatus = async (id, backendStatus) => {
    if (!id || updatingId) return;

    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(
        `/mentorship/sessions/${encodeURIComponent(id)}/status`,
        {
          status: backendStatus,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to update mentorship status."
        );
      }

      const updatedSession = response.data.session;

      if (updatedSession) {
        const mappedSession = mapSession(updatedSession);

        setMentorships((current) =>
          current.map((item) =>
            item.id === id ? mappedSession : item
          )
        );

        setSelectedMentorship((current) =>
          current?.id === id ? mappedSession : current
        );
      } else {
        await loadMentorships(true);
      }

      const messages = {
        Confirmed: "Mentorship request accepted successfully.",
        Cancelled: "Mentorship request declined successfully.",
        Completed: "Mentorship marked as completed.",
      };

      setNotice(
        messages[backendStatus] ||
          "Mentorship updated successfully."
      );

      if (backendStatus === "Cancelled") {
        setSelectedMentorship(null);
      }
    } catch (err) {
      console.error("Update mentorship status error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update mentorship."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // ------------------------------------------
  // DETAILS MODAL
  // ------------------------------------------

  const openDetails = (item) => {
    setSelectedMentorship(item);
    setError("");
    setNotice("");
  };

  const closeDetails = () => {
    setSelectedMentorship(null);
  };

  // ------------------------------------------
  // RENDER
  // ------------------------------------------

  return (
    <div className="mentor-mentorships-page">

      {/* HEADER */}

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

      {/* SEARCH */}

      <section className="mentor-mentorships-toolbar">
        <div className="mentor-mentorships-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search founders, email or mentorship goals..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>
      </section>

      {/* TABS */}

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

      {/* FEEDBACK */}

      {error && (
        <div
          className="mentor-mentorship-feedback error"
          role="alert"
        >
          <AlertCircle size={17} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadMentorships(true)}
          >
            Try again
          </button>
        </div>
      )}

      {notice && (
        <div
          className="mentor-mentorship-feedback success"
          role="status"
        >
          <Check size={17} />
          <span>{notice}</span>
        </div>
      )}

      {/* LIST HEADER */}

      <div className="mentor-mentorships-list-heading">
        <div>
          <h3>
            {activeTab === "all"
              ? "All Mentorships"
              : `${tabs.find((tab) => tab.id === activeTab)?.label || ""} Mentorships`}
          </h3>

          <p>
            {filteredMentorships.length}{" "}
            {filteredMentorships.length === 1
              ? "mentorship"
              : "mentorships"}
          </p>
        </div>

        <button
          type="button"
          className="mentor-mentorship-refresh"
          onClick={() => loadMentorships(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* LOADING */}

      {loading ? (
        <section className="mentor-mentorships-empty">
          <RefreshCw
            size={25}
            className="spinning"
          />

          <h3>Loading mentorships...</h3>

          <p>
            Fetching your latest mentorship requests.
          </p>
        </section>
      ) : filteredMentorships.length > 0 ? (

        /* MENTORSHIP CARDS */

        <section className="mentor-mentorships-list">
          {filteredMentorships.map((item) => (
            <article
              className="mentor-mentorship-card"
              key={item.id}
            >
              <div className="mentor-mentorship-card-main">

                <div className="mentor-mentorship-avatar">
                  {item.founder.charAt(0).toUpperCase()}
                </div>

                <div className="mentor-mentorship-content">

                  <div className="mentor-mentorship-title-row">
                    <div>
                      <h3>
                        {item.startup || item.title}
                      </h3>

                      <p>
                        {item.menteeRole === "student"
                          ? "Student"
                          : "Founder"}
                        : {item.founder}
                      </p>

                      {item.menteeEmail && (
                        <p className="mentor-mentorship-email">
                          {item.menteeEmail}
                        </p>
                      )}
                    </div>

                    <span
                      className={`mentor-mentorship-status status-${item.status}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mentor-mentorship-meta">
                    <span>{item.title}</span>

                    <span>
                      {item.durationMinutes} minutes
                    </span>

                    <span>
                      {item.menteeRole === "student"
                        ? "Student"
                        : "Founder"}
                    </span>
                  </div>

                  <p className="mentor-mentorship-message">
                    {item.message}
                  </p>

                  <div className="mentor-mentorship-details">
                    <span>
                      <CalendarDays size={15} />
                      Requested {item.requestedDate}
                    </span>

                    <span>
                      <Clock3 size={15} />
                      Scheduled: {item.scheduledDateLabel}
                    </span>
                  </div>

                  {item.goals.length > 0 && (
                    <div className="mentor-mentorship-goals">
                      <strong>Mentorship goals:</strong>

                      <ul>
                        {item.goals.slice(0, 3).map((goal, index) => (
                          <li key={goal._id || index}>
                            {goal.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mentor-mentorship-actions">

                {item.status === "pending" && (
                  <>
                    <button
                      type="button"
                      className="mentor-mentorship-decline"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        updateStatus(item.id, "Cancelled")
                      }
                    >
                      <X size={16} />
                      {updatingId === item.id
                        ? "Updating..."
                        : "Decline"}
                    </button>

                    <button
                      type="button"
                      className="mentor-mentorship-accept"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        updateStatus(item.id, "Confirmed")
                      }
                    >
                      <Check size={16} />
                      {updatingId === item.id
                        ? "Updating..."
                        : "Accept"}
                    </button>
                  </>
                )}

                {item.status === "active" && (
                  <button
                    type="button"
                    className="mentor-mentorship-view"
                    disabled={updatingId === item.id}
                    onClick={() =>
                      updateStatus(item.id, "Completed")
                    }
                  >
                    <Check size={16} />
                    Mark Completed
                  </button>
                )}

                {item.status === "completed" && (
                  <button
                    type="button"
                    className="mentor-mentorship-view"
                    onClick={() => openDetails(item)}
                  >
                    View Summary
                  </button>
                )}

                <button
                  type="button"
                  className="mentor-mentorship-more"
                  onClick={() => openDetails(item)}
                  aria-label="View mentorship details"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (

        /* EMPTY STATE */

        <section className="mentor-mentorships-empty">
          <div className="mentor-mentorships-empty-icon">
            <UserRound size={27} />
          </div>

          <h3>
            {searchTerm
              ? "No matching mentorships"
              : "No mentorships found"}
          </h3>

          <p>
            {searchTerm
              ? "Try another search term."
              : "New mentorship requests will appear here when someone requests your guidance."}
          </p>

          {!searchTerm && (
            <button
              type="button"
              className="mentor-mentorship-view"
              onClick={() => loadMentorships(true)}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          )}
        </section>
      )}

      {/* DETAILS MODAL */}

      {selectedMentorship && (
        <div
          className="mentor-mentorship-modal-overlay"
          onClick={closeDetails}
        >
          <div
            className="mentor-mentorship-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="mentor-mentorship-modal-header">
              <div>
                <span>Mentorship Details</span>

                <h3>
                  {selectedMentorship.startup ||
                    selectedMentorship.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mentor-mentorship-modal-body">

              <div className="mentor-modal-profile">
                <div className="mentor-modal-avatar">
                  {selectedMentorship.founder
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {selectedMentorship.founder}
                  </strong>

                  <span>
                    {selectedMentorship.menteeRole === "student"
                      ? "Student"
                      : "Startup Founder"}
                  </span>

                  {selectedMentorship.menteeEmail && (
                    <span>
                      {selectedMentorship.menteeEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="mentor-modal-info-grid">

                <div>
                  <span>Session Title</span>
                  <strong>
                    {selectedMentorship.title}
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
                  <span>Duration</span>
                  <strong>
                    {selectedMentorship.durationMinutes} minutes
                  </strong>
                </div>

                <div>
                  <span>Scheduled Date</span>
                  <strong>
                    {selectedMentorship.scheduledDateLabel}
                  </strong>
                </div>

                <div>
                  <span>Feedback Rating</span>
                  <strong>
                    {selectedMentorship.feedbackRating
                      ? `${selectedMentorship.feedbackRating}/5`
                      : "Not rated"}
                  </strong>
                </div>
              </div>

              <div className="mentor-modal-message">
                <span>Mentorship Goals</span>

                {selectedMentorship.goals.length > 0 ? (
                  <ul>
                    {selectedMentorship.goals.map(
                      (goal, index) => (
                        <li key={goal._id || index}>
                          {goal.text}
                          {goal.completed ? " ✓" : ""}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No goals have been added yet.</p>
                )}
              </div>

              {selectedMentorship.mentorNotes && (
                <div className="mentor-modal-message">
                  <span>Mentor Notes</span>
                  <p>{selectedMentorship.mentorNotes}</p>
                </div>
              )}

              {selectedMentorship.meetingLink && (
                <div className="mentor-modal-message">
                  <span>Meeting Link</span>

                  <a
                    href={selectedMentorship.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join Mentorship Meeting
                  </a>
                </div>
              )}
            </div>

            <div className="mentor-mentorship-modal-footer">

              {selectedMentorship.status === "pending" && (
                <>
                  <button
                    type="button"
                    className="mentor-mentorship-decline"
                    disabled={updatingId === selectedMentorship.id}
                    onClick={() =>
                      updateStatus(
                        selectedMentorship.id,
                        "Cancelled"
                      )
                    }
                  >
                    <X size={16} />
                    Decline Request
                  </button>

                  <button
                    type="button"
                    className="mentor-mentorship-accept"
                    disabled={updatingId === selectedMentorship.id}
                    onClick={() =>
                      updateStatus(
                        selectedMentorship.id,
                        "Confirmed"
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
                  className="mentor-mentorship-accept"
                  disabled={updatingId === selectedMentorship.id}
                  onClick={() =>
                    updateStatus(
                      selectedMentorship.id,
                      "Completed"
                    )
                  }
                >
                  <Check size={16} />
                  Mark as Completed
                </button>
              )}

              <button
                type="button"
                className="mentor-mentorship-view"
                onClick={closeDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorMentorships;