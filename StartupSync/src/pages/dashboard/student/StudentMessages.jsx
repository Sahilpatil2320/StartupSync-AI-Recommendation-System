import {
  CheckCheck,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X,
  RefreshCw,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./StudentMessages.css";

const API_BASE_URL = "http://localhost:5000/api/messages";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "U";
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function formatMessageTime(value) {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
}

function StudentMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const requestIdRef = useRef(0);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("startupsync_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const getAuthConfig = useCallback(() => {
    const currentToken = localStorage.getItem("startupsync_token");

    if (!currentToken) {
      throw new Error("Please log in again to use messages.");
    }

    return {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    };
  }, []);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/conversations`,
        getAuthConfig()
      );

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error("Unexpected conversations API response.");
      }

      const rows = response.data.data.map((item) => {
        const user = item.user || {};
        const lastMessage = item.lastMessage || {};

        return {
          id: String(user._id),
          name: user.name || "StartupSync user",
          role: user.role || "Member",
          avatar: getInitials(user.name),
          lastMessage: lastMessage.text || "Start a conversation",
          time: formatTime(lastMessage.createdAt),
          unread: item.unreadCount || 0,
          online: false,
          lastMessageAt: lastMessage.createdAt || null,
        };
      });

      setConversations(rows);

      setSelectedConversationId((current) => {
        if (current && rows.some((item) => item.id === current)) {
          return current;
        }

        return rows[0]?.id || "";
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, [getAuthConfig]);

  const loadMessages = useCallback(
    async (otherUserId) => {
      if (!otherUserId) {
        setMessages([]);
        return;
      }

      const requestId = ++requestIdRef.current;
      setLoadingMessages(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_BASE_URL}/${encodeURIComponent(otherUserId)}`,
          getAuthConfig()
        );

        if (!response.data?.success || !Array.isArray(response.data.data)) {
          throw new Error("Unexpected messages API response.");
        }

        if (requestId !== requestIdRef.current) return;

        setMessages(
          response.data.data.map((message) => ({
            id: String(message._id),
            sender:
              String(message.sender) === String(currentUser._id)
                ? "me"
                : "them",
            text: message.text,
            time: formatMessageTime(message.createdAt),
            createdAt: message.createdAt,
          }))
        );

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === otherUserId
              ? { ...conversation, unread: 0 }
              : conversation
          )
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load message history."
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingMessages(false);
        }
      }
    },
    [currentUser._id, getAuthConfig]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const filteredConversations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return conversations;

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(search) ||
        conversation.role.toLowerCase().includes(search) ||
        conversation.lastMessage.toLowerCase().includes(search)
    );
  }, [conversations, searchTerm]);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setShowEmojiPanel(false);
    setShowUserSearch(false);
    setNotice("");
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if (!text || !selectedConversationId || sending) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${encodeURIComponent(selectedConversationId)}`,
        { text },
        getAuthConfig()
      );

      if (!response.data?.success || !response.data.data?._id) {
        throw new Error("The server did not confirm saving this message.");
      }

      const saved = response.data.data;

      setMessages((current) => [
        ...current,
        {
          id: String(saved._id),
          sender: "me",
          text: saved.text,
          time: formatMessageTime(saved.createdAt),
          createdAt: saved.createdAt,
        },
      ]);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: saved.text,
                time: formatTime(saved.createdAt),
                lastMessageAt: saved.createdAt,
              }
            : conversation
        )
      );

      setMessageText("");
      setShowEmojiPanel(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const searchPeople = async (value) => {
    setUserSearch(value);
    setError("");

    if (value.trim().length < 2) {
      setUserResults([]);
      return;
    }

    setSearchingUsers(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        ...getAuthConfig(),
        params: { search: value.trim() },
      });

      setUserResults(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to search StartupSync users."
      );
    } finally {
      setSearchingUsers(false);
    }
  };

  const startConversation = async (user) => {
    const id = String(user._id);

    setConversations((current) => {
      if (current.some((conversation) => conversation.id === id)) {
        return current;
      }

      return [
        {
          id,
          name: user.name,
          role: user.role || "Member",
          avatar: getInitials(user.name),
          lastMessage: "Start a conversation",
          time: "",
          unread: 0,
          online: false,
        },
        ...current,
      ];
    });

    setSelectedConversationId(id);
    setMessages([]);
    setShowUserSearch(false);
    setUserSearch("");
    setUserResults([]);
    setNotice("");
  };

  const addEmoji = (emoji) => {
    setMessageText((current) => `${current}${emoji}`);
    setShowEmojiPanel(false);
  };

  const handleAttachment = () => {
    setNotice("File attachments are not available yet.");
  };

  const handleCallAction = (type) => {
    setNotice(`${type} calling is not implemented yet.`);
  };

  const handleRefresh = async () => {
    await loadConversations();

    if (selectedConversationId) {
      await loadMessages(selectedConversationId);
    }
  };

  return (
    <section className="student-messages-page">
      <div className="student-messages-header">
        <div>
          <span className="student-messages-badge">
            Communication Center
          </span>

          <h2>Messages</h2>

          <p>
            Connect with recruiters, founders and opportunity providers
            through StartupSync.
          </p>
        </div>
      </div>

      {(error || notice) && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: error ? "#fef2f2" : "#eff6ff",
            color: error ? "#b91c1c" : "#1d4ed8",
          }}
        >
          {error || notice}
        </div>
      )}

      <div className="student-messages-shell">
        <aside className="student-conversations-panel">
          <div className="student-conversations-header">
            <div>
              <h3>Conversations</h3>
              <span>{conversations.length} conversations</span>
            </div>

            <button
              type="button"
              title="Refresh conversations"
              aria-label="Refresh conversations"
              onClick={handleRefresh}
              disabled={loadingConversations}
              style={{
                float: "right",
                border: 0,
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
            </button>

            <button
              type="button"
              title="Find a StartupSync user"
              aria-label="Find a user"
              onClick={() => setShowUserSearch((value) => !value)}
              style={{
                float: "right",
                border: 0,
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                marginRight: 8,
              }}
            >
              <UserRound size={16} />
            </button>
          </div>

          {showUserSearch && (
            <div style={{ padding: "0 14px 12px" }}>
              <input
                value={userSearch}
                onChange={(event) => searchPeople(event.target.value)}
                placeholder="Search people by name..."
                aria-label="Search StartupSync users"
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                }}
              />

              {searchingUsers && <p>Searching...</p>}

              {userResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => startConversation(user)}
                  style={{
                    display: "flex",
                    width: "100%",
                    gap: 10,
                    alignItems: "center",
                    padding: 10,
                    marginTop: 5,
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span className="student-conversation-avatar">
                    {getInitials(user.name)}
                  </span>

                  <span>
                    <strong>{user.name}</strong>
                    <small style={{ display: "block", color: "#64748b" }}>
                      {user.role}
                    </small>
                  </span>
                </button>
              ))}

              {!searchingUsers &&
                userSearch.trim().length >= 2 &&
                userResults.length === 0 && <p>No users found.</p>}
            </div>
          )}

          <div className="student-conversation-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="student-conversations-list">
            {loadingConversations ? (
              <div className="student-conversations-empty">
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`student-conversation-item ${
                    selectedConversationId === conversation.id
                      ? "student-conversation-active"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="student-conversation-avatar">
                    {conversation.avatar}
                  </div>

                  <div className="student-conversation-info">
                    <div className="student-conversation-top">
                      <strong>{conversation.name}</strong>
                      <span>{conversation.time}</span>
                    </div>

                    <div className="student-conversation-role">
                      {conversation.role}
                    </div>

                    <div className="student-conversation-bottom">
                      <p>{conversation.lastMessage}</p>

                      {conversation.unread > 0 && (
                        <span className="student-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="student-conversations-empty">
                <MessageCircle size={21} />
                <h4>
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet"}
                </h4>
                <p>
                  {searchTerm
                    ? "Try another name or keyword."
                    : "Search for a StartupSync user to start a conversation."}
                </p>
              </div>
            )}
          </div>
        </aside>

        {selectedConversation ? (
          <div className="student-chat-panel">
            <header className="student-chat-header">
              <div className="student-chat-person">
                <div className="student-chat-avatar">
                  {selectedConversation.avatar}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>
                  <p>{selectedConversation.role}</p>
                </div>
              </div>

              <div className="student-chat-header-actions">
                <button
                  type="button"
                  aria-label="Audio call"
                  title="Audio call"
                  onClick={() => handleCallAction("Audio")}
                >
                  <Phone size={17} />
                </button>

                <button
                  type="button"
                  aria-label="Video call"
                  title="Video call"
                  onClick={() => handleCallAction("Video")}
                >
                  <Video size={18} />
                </button>
              </div>
            </header>

            <div className="student-chat-messages">
              <div className="student-chat-date">
                <span>Conversation</span>
              </div>

              {loadingMessages ? (
                <div className="student-chat-empty">
                  <p>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`student-message-row ${
                      message.sender === "me"
                        ? "student-message-row-me"
                        : "student-message-row-them"
                    }`}
                  >
                    <div
                      className={`student-message-bubble ${
                        message.sender === "me"
                          ? "student-message-bubble-me"
                          : "student-message-bubble-them"
                      }`}
                    >
                      <p>{message.text}</p>

                      <div className="student-message-meta">
                        <span>{message.time}</span>
                        {message.sender === "me" && (
                          <CheckCheck size={13} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="student-chat-empty">
                  <div className="student-chat-empty-icon">
                    <MessageCircle size={22} />
                  </div>
                  <h3>Start a conversation</h3>
                  <p>Send a message to begin chatting with this user.</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="student-chat-composer">
              {showEmojiPanel && (
                <div className="student-emoji-panel">
                  {[
                    "😊",
                    "👍",
                    "🎉",
                    "🚀",
                    "💡",
                    "👏",
                    "🔥",
                    "🙂",
                    "❤️",
                    "🙌",
                  ].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="student-composer-icon"
                aria-label="Attach file"
                title="Attach file"
                onClick={handleAttachment}
              >
                <Paperclip size={18} />
              </button>

              <button
                type="button"
                className="student-composer-icon"
                aria-label="Add emoji"
                title="Emoji"
                onClick={() => setShowEmojiPanel((value) => !value)}
              >
                <Smile size={18} />
              </button>

              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                maxLength={5000}
                disabled={sending}
              />

              <button
                type="button"
                className="student-send-button"
                aria-label="Send message"
                title="Send message"
                disabled={!messageText.trim() || sending}
                onClick={handleSendMessage}
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        ) : (
          <div className="student-chat-empty">
            <div className="student-chat-empty-icon">
              <MessageCircle size={22} />
            </div>

            <h3>
              {loadingConversations
                ? "Loading conversations..."
                : "No conversation selected"}
            </h3>

            <p>
              {conversations.length === 0
                ? "Use the person icon to find a StartupSync user and start messaging."
                : "Choose a conversation from the list."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default StudentMessages;