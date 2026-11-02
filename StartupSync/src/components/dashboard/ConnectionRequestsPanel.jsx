import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, UsersRound, X } from "lucide-react";
import api from "../../services/api";
import { connectSocket } from "../../services/socket";
import "./ConnectionRequestsPanel.css";

const idOf = (value) => String(value?._id || value?.id || value || "");

function ConnectionRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get("/connections");
      setRequests(response.data?.requests || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load connection requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    const refresh = () => loadRequests();
    socket.on("connection:updated", refresh);
    socket.on("notification:new", refresh);

    return () => {
      socket.off("connection:updated", refresh);
      socket.off("notification:new", refresh);
    };
  }, [loadRequests]);

  const respond = async (request, action) => {
    const requestId = idOf(request);
    if (!requestId || busyId) return;

    setBusyId(requestId);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(`/connections/${requestId}/${action}`);
      setNotice(
        response.data?.message ||
          (action === "accept" ? "Request accepted." : "Request declined.")
      );
      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update this request."
      );
    } finally {
      setBusyId("");
    }
  };

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("startupsync_user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUserId = idOf(storedUser.id || storedUser._id);
  const incoming = requests.filter(
    (request) =>
      idOf(request.receiver) === currentUserId &&
      request.status === "pending"
  );
  const accepted = requests.filter(
    (request) =>
      request.status === "accepted" &&
      (idOf(request.receiver) === currentUserId ||
        idOf(request.sender) === currentUserId)
  );

  return (
    <section className="connection-requests-panel">
      <div className="connection-requests-heading">
        <div className="connection-requests-heading-icon">
          <UsersRound size={19} />
        </div>
        <div>
          <h3>Connection requests</h3>
          <p>Accept a request to unlock private messaging.</p>
        </div>
        <button
          type="button"
          className="connection-requests-refresh"
          onClick={loadRequests}
          disabled={loading}
          title="Refresh requests"
          aria-label="Refresh connection requests"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <p className="connection-requests-feedback is-error">{error}</p>}
      {notice && <p className="connection-requests-feedback is-success">{notice}</p>}

      {loading ? (
        <p className="connection-requests-empty">Loading connection requests...</p>
      ) : incoming.length ? (
        <div className="connection-requests-list">
          {incoming.map((request) => {
            const sender = request.sender || {};
            const requestId = idOf(request);
            const senderName = sender.name || "StartupSync member";
            const senderRole = String(sender.role || "user").toLowerCase();

            return (
              <article className="connection-request-row" key={requestId}>
                <div className="connection-request-avatar">
                  {senderName.charAt(0).toUpperCase()}
                </div>
                <div className="connection-request-copy">
                  <strong>{senderName}</strong>
                  <span>
                    sent you a request as <b>{senderRole}</b>
                  </span>
                  <small>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleString()
                      : "Recently"}
                  </small>
                </div>
                <div className="connection-request-actions">
                  <button
                    type="button"
                    className="connection-request-accept"
                    title="Accept request"
                    aria-label={`Accept request from ${senderName}`}
                    disabled={busyId === requestId}
                    onClick={() => respond(request, "accept")}
                  >
                    <Check size={17} />
                  </button>
                  <button
                    type="button"
                    className="connection-request-reject"
                    title="Decline request"
                    aria-label={`Decline request from ${senderName}`}
                    disabled={busyId === requestId}
                    onClick={() => respond(request, "reject")}
                  >
                    <X size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="connection-requests-empty">
          No pending requests. New requests will appear here.
        </p>
      )}

      {accepted.length > 0 && (
        <p className="connection-requests-connected-note">
          {accepted.length} accepted connection{accepted.length === 1 ? "" : "s"} — available in Messages.
        </p>
      )}
    </section>
  );
}

export default ConnectionRequestsPanel;
