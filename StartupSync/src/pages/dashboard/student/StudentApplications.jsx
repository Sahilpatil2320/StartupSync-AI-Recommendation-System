import {
  Search,
  Filter,
  CalendarDays,
  Clock3,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./StudentApplications.css";

const API_BASE_URL = "http://localhost:5000/api";

const statusOptions = [
  "All Statuses",
  "Submitted",
  "Withdrawn",
];

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("startupsync_token");

    if (!token) {
      throw new Error("Please log in again to view your applications.");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/applications/my`,
        getAuthConfig()
      );

      if (
        !response.data?.success ||
        !Array.isArray(response.data.data)
      ) {
        throw new Error("Unexpected response from the applications API.");
      }

      setApplications(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !search ||
        (application.title || "").toLowerCase().includes(search) ||
        (application.company || "").toLowerCase().includes(search) ||
        (application.organizer || "").toLowerCase().includes(search) ||
        (application.category || "").toLowerCase().includes(search) ||
        (application.type || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const submittedCount = applications.filter(
    (item) => item.status === "Submitted"
  ).length;

  const withdrawnCount = applications.filter(
    (item) => item.status === "Withdrawn"
  ).length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
  };

  const withdrawApplication = async (application) => {
    if (!application.canWithdraw || withdrawingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to withdraw your application for "${application.title}"?`
    );

    if (!confirmed) return;

    setWithdrawingId(application._id);
    setError("");
    setNotice("");

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/applications/${encodeURIComponent(
          application._id
        )}/withdraw`,
        {},
        getAuthConfig()
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to withdraw application."
        );
      }

      const updatedApplication = {
        ...application,
        status: "Withdrawn",
        canWithdraw: false,
      };

      setApplications((current) =>
        current.map((item) =>
          item._id === application._id ? updatedApplication : item
        )
      );

      setSelectedApplication((current) =>
        current?._id === application._id ? updatedApplication : current
      );

      setNotice("Application withdrawn successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to withdraw application."
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <section className="student-applications-page">
      <div className="student-applications-header">
        <div>
          <span className="student-applications-badge">
            <CheckCircle2 size={15} />
            My Applications
          </span>

          <h2>Track Your Applications</h2>

          <p>
            View your opportunity registrations and keep track of their
            current status.
          </p>
        </div>

        <div className="student-applications-summary">
          <div>
            <strong>{applications.length}</strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{submittedCount}</strong>
            <span>Submitted</span>
          </div>

          <div>
            <strong>{withdrawnCount}</strong>
            <span>Withdrawn</span>
          </div>
        </div>
      </div>

      <div className="student-applications-search-panel">
        <div className="student-applications-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search applications or organizers..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="student-applications-filter-title">
          <Filter size={17} />
          <span>Filter Applications</span>
        </div>

        <div className="student-applications-filters">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="student-applications-clear"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            title="Refresh applications"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {(error || notice) && (
        <div
          role="status"
          className={
            error
              ? "student-applications-error"
              : "student-applications-notice"
          }
        >
          {error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          <span>{error || notice}</span>
        </div>
      )}

      <div className="student-applications-results-header">
        <div>
          <h3>Your Applications</h3>
          <p>Records are loaded from your StartupSync account.</p>
        </div>

        <span>{filteredApplications.length} results</span>
      </div>

      {loading ? (
        <div className="student-applications-empty">
          <p>Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="student-applications-empty">
          <div className="student-applications-empty-icon">
            <Search size={25} />
          </div>

          <h3>
            {applications.length === 0
              ? "No applications yet"
              : "No applications found"}
          </h3>

          <p>
            {applications.length === 0
              ? "When you register for an opportunity, its record will appear here."
              : "Try changing your search or status filter."}
          </p>

          {applications.length > 0 && (
            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="student-applications-grid">
          {filteredApplications.map((application) => (
            <article
              className="student-application-card"
              key={application._id}
            >
              <div className="student-application-card-top">
                <div className="student-application-icon">
                  {(application.title || "A").charAt(0).toUpperCase()}
                </div>

                <span
                  className={`student-application-status student-application-status-${(
                    application.status || "submitted"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {application.status}
                </span>
              </div>

              <h4>{application.title}</h4>

              <p className="student-application-company">
                {application.company || application.organizer}
              </p>

              <div className="student-application-meta">
                <span>
                  <MapPin size={15} />
                  {application.location || "Not specified"}
                </span>

                <span>
                  <CalendarDays size={15} />
                  Applied {formatDate(application.applicationDate)}
                </span>

                <span>
                  <Clock3 size={15} />
                  {application.type || "Opportunity"}
                </span>
              </div>

              <div className="student-application-card-footer">
                <button
                  type="button"
                  className="student-application-view"
                  onClick={() => setSelectedApplication(application)}
                >
                  View Details
                </button>

                {application.canWithdraw && (
                  <button
                    type="button"
                    className="student-application-withdraw"
                    disabled={withdrawingId === application._id}
                    onClick={() => withdrawApplication(application)}
                  >
                    {withdrawingId === application._id
                      ? "Withdrawing..."
                      : "Withdraw"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedApplication && (
        <div
          className="student-application-modal-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="student-application-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-application-modal-header">
              <div>
                <span className="student-application-modal-label">
                  Application Details
                </span>

                <h3>{selectedApplication.title}</h3>

                <p>
                  {selectedApplication.company ||
                    selectedApplication.organizer}
                </p>
              </div>

              <button
                type="button"
                className="student-application-close"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close application details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="student-application-modal-section">
              <h4>Application Information</h4>

              <div className="student-application-info-grid">
                <div>
                  <span>Status</span>
                  <strong>{selectedApplication.status}</strong>
                </div>

                <div>
                  <span>Application Date</span>
                  <strong>
                    {formatDate(selectedApplication.applicationDate)}
                  </strong>
                </div>

                <div>
                  <span>Opportunity Type</span>
                  <strong>{selectedApplication.type || "Not specified"}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>
                    {selectedApplication.category || "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedApplication.location || "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>Mode</span>
                  <strong>
                    {selectedApplication.mode || "Not specified"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="student-application-modal-section">
              <h4>About the Opportunity</h4>
              <p>
                {selectedApplication.description ||
                  "No description is available."}
              </p>
            </div>

            {selectedApplication.canWithdraw && (
              <div className="student-application-modal-actions">
                <button
                  type="button"
                  className="student-application-withdraw"
                  disabled={withdrawingId === selectedApplication._id}
                  onClick={() => withdrawApplication(selectedApplication)}
                >
                  {withdrawingId === selectedApplication._id
                    ? "Withdrawing..."
                    : "Withdraw Application"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentApplications;