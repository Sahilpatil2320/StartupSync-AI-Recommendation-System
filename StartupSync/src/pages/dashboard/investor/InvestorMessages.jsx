
import {
  CheckCheck,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./InvestorMessages.css";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || value.userId || "");
};

const getName = (user) =>
  user?.name ||
  user?.firmName ||
  user?.startupName ||
  user?.fullName ||
  "StartupSync Member";

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const formatTime = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getList = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;

  return (
    data?.conversations ||
    data?.users ||
    data?.messages ||
    data?.data?.conversations ||
    data?.data?.users ||
    data?.data?.messages ||
    data?.data ||
    []
  );
};

const normalizeMessage = (message, currentUserId) => {
  const senderId = getId(message.senderId || message.sender || message.from);
  const sentByMe =
    message.sender === "me" ||
    message.senderRole === "me" ||
    (senderId && senderId === currentUserId);

  return {
    id: getId(message) || `${Date.now()}-${Math.random()}`,
    sender: sentByMe ? "me" : "them",
    text: message.text || message.content || message.message || "",
    time: formatTime(message.createdAt || message.timestamp || message.time)
  };
};

const normalizeConversation = (item, currentUserId) => {
  const person =
    item.otherUser ||
    item.participant ||
    item.user ||
    item.recipient ||
    item.contact ||
    item;

  const name = getName(person);
  const messages = Array.isArray(item.messages)
    ? item.messages.map((message) =>
        normalizeMessage(message, currentUserId)
      )
    : [];

  const lastMessage =
    item.lastMessage?.text ||
    item.lastMessage?.content ||
    item.lastMessage ||
    messages[messages.length - 1]?.text ||
    "";

  return {
    id: getId(person) || getId(item),
    name,
    role: person.role || item.role || "StartupSync Member",
    initials: getInitials(name),
    online: Boolean(person.online || person.isOnline),
    unread: Number(item.unreadCount || item.unread || 0),
    lastMessage:
      typeof lastMessage === "string"
        ? lastMessage
        : lastMessage?.text || "",
    time: formatTime(
      item.lastMessageAt ||
        item.updatedAt ||
        item.lastMessage?.createdAt ||
        messages[messages.length - 1]?.time
    ),
    messages
  };
};

function InvestorMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");

  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("startupsync_token");
      if (!token) return "";
      return getId(JSON.parse(atob(token.split(".")[1])));
    } catch {
      return "";
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("startupsync_token");
      if (!token) throw new Error("Please log in to view your messages.");

      const response = await api.get("/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const records = getList(response);
      if (!Array.isArray(records)) {
        throw new Error("Unexpected conversations response from the server.");
      }

      const normalized = records
        .map((item) => normalizeConversation(item, currentUserId))
        .filter((item) => item.id);

      setConversations(normalized);
      setSelectedId((current) =>
        normalized.some((item) => item.id === current)
          ? current
          : normalized[0]?.id || ""
      );
    } catch (err) {
      console.error("Unable to load conversations:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load conversations."
      );
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const filteredConversations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return conversations;

    return conversations.filter((conversation) =>
      [
        conversation.name,
        conversation.role,
        conversation.lastMessage
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [conversations, searchTerm]);

  const openConversation = async (conversationId) => {
    setSelectedId(conversationId);
    setMobileChatOpen(true);
    setMessageError("");

    try {
      const token = localStorage.getItem("startupsync_token");

      const response = await api.get(
        `/messages/${encodeURIComponent(conversationId)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const messages = getList(response).map((message) =>
        normalizeMessage(message, currentUserId)
      );

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unread: 0,
                messages,
                lastMessage:
                  messages[messages.length - 1]?.text ||
                  conversation.lastMessage
              }
            : conversation
        )
      );
    } catch (err) {
      console.error("Unable to load messages:", err);
      setMessageError(
        err.response?.data?.message || "Unable to load this conversation."
      );
    }
  };

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text || !selectedConversation || sending) return;

    try {
      setSending(true);
      setMessageError("");

      const token = localStorage.getItem("startupsync_token");

      const response = await api.post(
        `/messages/${encodeURIComponent(selectedConversation.id)}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const returnedMessage =
        response.data?.messageRecord ||
        response.data?.data?.message ||
        response.data?.message;

      setMessageText("");

      if (returnedMessage && typeof returnedMessage === "object") {
        const message = normalizeMessage(returnedMessage, currentUserId);

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedConversation.id
              ? {
                  ...conversation,
                  lastMessage: message.text,
                  time: message.time,
                  messages: [...conversation.messages, message]
                }
              : conversation
          )
        );
      } else {
        await openConversation(selectedConversation.id);
      }

      await fetchConversations();
    } catch (err) {
      console.error("Unable to send message:", err);
      setMessageError(
        err.response?.data?.message ||
          "Message could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const showPlaceholder = (feature) => {
    window.alert(`${feature} is not connected yet.`);
  };

  return (
    <div className="investor-messages-page">
      <section className="investor-messages-header">
        <div>
          <span className="investor-messages-badge">Communication</span>
          <h2>Messages</h2>
          <p>
            Connect with startup founders, mentors and other members of the
            StartupSync ecosystem.
          </p>
        </div>
      </section>

      <section
        className={`investor-chat-container ${
          mobileChatOpen ? "investor-mobile-chat-open" : ""
        }`}
      >
        <aside className="investor-conversation-panel">
          <div className="investor-conversation-header">
            <h3>Conversations</h3>
            <span>
              {conversations.filter((conversation) => conversation.unread > 0)
                .length}{" "}
              unread
            </span>
          </div>

          <div className="investor-conversation-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="investor-conversation-list">
            {loading ? (
              <div className="investor-no-conversations">
                <p>Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="investor-no-conversations">
                <p>{error}</p>
                <button type="button" onClick={fetchConversations}>
                  Retry
                </button>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`investor-conversation-item ${
                    selectedId === conversation.id
                      ? "investor-conversation-selected"
                      : ""
                  }`}
                  onClick={() => openConversation(conversation.id)}
                >
                  <div className="investor-avatar-wrapper">
                    <div className="investor-conversation-avatar">
                      {conversation.initials}
                    </div>
                    {conversation.online && (
                      <span className="investor-online-dot" />
                    )}
                  </div>

                  <div className="investor-conversation-content">
                    <div className="investor-conversation-name-row">
                      <strong>{conversation.name}</strong>
                      <span>{conversation.time}</span>
                    </div>

                    <div className="investor-conversation-role">
                      {conversation.role}
                    </div>

                    <div className="investor-conversation-message-row">
                      <p>{conversation.lastMessage || "No messages yet"}</p>
                      {conversation.unread > 0 && (
                        <span className="investor-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="investor-no-conversations">
                <Search size={24} />
                <p>No conversations available.</p>
              </div>
            )}
          </div>
        </aside>

        {selectedConversation ? (
          <div className="investor-chat-panel">
            <div className="investor-chat-header">
              <button
                type="button"
                className="investor-mobile-back"
                onClick={() => setMobileChatOpen(false)}
                aria-label="Back to conversations"
              >
                <X size={20} />
              </button>

              <div className="investor-chat-avatar">
                {selectedConversation.initials}
                {selectedConversation.online && (
                  <span className="investor-chat-online" />
                )}
              </div>

              <div className="investor-chat-person">
                <strong>{selectedConversation.name}</strong>
                <span>
                  {selectedConversation.online
                    ? "Online"
                    : selectedConversation.role}
                </span>
              </div>

              <div className="investor-chat-actions">
                <button
                  type="button"
                  onClick={() => showPlaceholder("Phone calling")}
                  aria-label="Call"
                >
                  <Phone size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => showPlaceholder("Video calling")}
                  aria-label="Video call"
                >
                  <Video size={18} />
                </button>
              </div>
            </div>

            <div className="investor-chat-messages">
              <div className="investor-chat-date">
                <span>Messages</span>
              </div>

              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`investor-message-row ${
                    message.sender === "me"
                      ? "investor-message-sent"
                      : "investor-message-received"
                  }`}
                >
                  <div className="investor-message-bubble">
                    <p>{message.text}</p>
                    <div className="investor-message-meta">
                      <span>{message.time}</span>
                      {message.sender === "me" && <CheckCheck size={14} />}
                    </div>
                  </div>
                </div>
              ))}

              {selectedConversation.messages.length === 0 && (
                <div className="investor-no-chat-selected">
                  <h3>No messages yet</h3>
                  <p>Send a message to start the conversation.</p>
                </div>
              )}
            </div>

            {messageError && (
              <p role="alert">{messageError}</p>
            )}

            <div className="investor-message-composer">
              <button
                type="button"
                onClick={() => showPlaceholder("File attachment")}
                aria-label="Attach file"
              >
                <Paperclip size={19} />
              </button>

              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                onClick={() =>
                  setMessageText((current) => `${current} 😊`)
                }
                aria-label="Add emoji"
              >
                <Smile size={19} />
              </button>

              <button
                type="button"
                className="investor-send-button"
                onClick={sendMessage}
                disabled={!messageText.trim() || sending}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="investor-no-chat-selected">
            <div>
              <Search size={30} />
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation to start messaging.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default InvestorMessages;