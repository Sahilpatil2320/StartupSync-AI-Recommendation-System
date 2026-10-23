
import {
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../../../services/api";
import { connectSocket } from "../../../services/socket";
import "./InvestorMessages.css";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || value.userId || value.sub || "");
};

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem("startupsync_user") || "{}"
    );

    const userId = getId(user);
    if (userId) return userId;

    const token = localStorage.getItem("startupsync_token");
    if (!token) return "";

    const payload = JSON.parse(atob(token.split(".")[1]));
    return getId(payload.userId || payload.id || payload._id || payload.sub);
  } catch {
    return "";
  }
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
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.conversations)) {
    return data.data.conversations;
  }
  if (Array.isArray(data?.data?.messages)) {
    return data.data.messages;
  }

  return [];
};

const normalizeMessage = (message, currentUserId) => {
  const senderId = getId(message.senderId || message.sender || message.from);

  const sentByMe =
    message.sender === "me" ||
    message.senderRole === "me" ||
    (senderId && currentUserId && senderId === currentUserId);

  return {
    id: getId(message) || `${message.createdAt || ""}-${senderId}`,
    sender: sentByMe ? "me" : "them",
    senderId,
    text: message.text || message.content || message.message || "",
    time: formatTime(message.createdAt || message.timestamp || message.time),
    createdAt: message.createdAt || message.timestamp || null,
  };
};

const normalizeConversation = (item) => {
  const person =
    item.otherUser ||
    item.participant ||
    item.user ||
    item.recipient ||
    item.contact ||
    item;

  const name = getName(person);
  const lastMessage = item.lastMessage || {};
  const lastMessageText =
    typeof lastMessage === "string"
      ? lastMessage
      : lastMessage.text || lastMessage.content || "";

  return {
    id: getId(person) || getId(item),
    name,
    role: person.role || item.role || "StartupSync Member",
    initials: getInitials(name),
    online: Boolean(person.online || person.isOnline),
    unread: Number(item.unreadCount || item.unread || 0),
    lastMessage: lastMessageText,
    time: formatTime(
      item.lastMessageAt ||
        item.updatedAt ||
        lastMessage.createdAt
    ),
    messages: [],
  };
};

function InvestorMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");

  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef("");
  const currentUserId = useMemo(() => getCurrentUserId(), []);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/messages/conversations");

      const normalized = getList(response)
        .map(normalizeConversation)
        .filter((item) => item.id);

      setConversations((previous) => {
        const oldById = new Map(previous.map((item) => [item.id, item]));

        return normalized.map((item) => {
          const old = oldById.get(item.id);

          return {
            ...item,
            messages: old?.messages || [],
          };
        });
      });

      setSelectedId((current) => {
        if (normalized.some((item) => item.id === current)) return current;
        return normalized[0]?.id || "";
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;

      setLoadingMessages(true);
      setMessageError("");

      try {
        const response = await api.get(
          `/messages/${encodeURIComponent(conversationId)}`
        );

        const messages = getList(response).map((message) =>
          normalizeMessage(message, currentUserId)
        );

        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unread: 0,
                  messages,
                  lastMessage:
                    messages[messages.length - 1]?.text ||
                    conversation.lastMessage,
                }
              : conversation
          )
        );
      } catch (err) {
        setMessageError(
          err.response?.data?.message ||
            "Unable to load this conversation."
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    } else {
      setLoadingMessages(false);
    }
  }, [selectedId, loadMessages]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    const handleIncomingMessage = (message) => {
      const senderId = getId(message.sender);
      const receiverId = getId(message.receiver);

      const otherUserId =
        senderId === currentUserId ? receiverId : senderId;

      if (!otherUserId) return;

      const activeId = selectedIdRef.current;
      const isFromCurrentUser = senderId === currentUserId;
      const normalizedMessage = normalizeMessage(message, currentUserId);

      setConversations((previous) => {
        const existing = previous.find(
          (item) => item.id === otherUserId
        );

        const name = isFromCurrentUser
          ? existing?.name || "StartupSync Member"
          : message.sender?.name || existing?.name || "StartupSync Member";

        const role = isFromCurrentUser
          ? existing?.role || "StartupSync Member"
          : message.sender?.role || existing?.role || "StartupSync Member";

        const conversation = {
          ...(existing || {}),
          id: otherUserId,
          name,
          role,
          initials: getInitials(name),
          lastMessage: normalizedMessage.text,
          time: normalizedMessage.time,
          online: existing?.online || false,
          unread:
            otherUserId === activeId || isFromCurrentUser
              ? existing?.unread || 0
              : (existing?.unread || 0) + 1,
          messages: existing?.messages || [],
        };

        const messages = conversation.messages;
        const alreadyExists = messages.some(
          (item) => item.id === normalizedMessage.id
        );

        return [
          {
            ...conversation,
            messages:
              otherUserId === activeId && !alreadyExists
                ? [...messages, normalizedMessage]
                : messages,
          },
          ...previous.filter((item) => item.id !== otherUserId),
        ];
      });

      if (otherUserId === activeId) {
        setMessageError("");
      }
    };

    const handleSentMessage = (message) => {
      const receiverId = getId(message.receiver);
      const senderId = getId(message.sender);
      const otherUserId =
        receiverId || (senderId === currentUserId ? "" : senderId);

      const normalizedMessage = normalizeMessage(message, currentUserId);

      if (otherUserId && otherUserId !== selectedIdRef.current) {
        fetchConversations();
        return;
      }

      setConversations((previous) =>
        previous.map((conversation) => {
          if (conversation.id !== selectedIdRef.current) return conversation;

          const exists = conversation.messages.some(
            (item) => item.id === normalizedMessage.id
          );

          return {
            ...conversation,
            lastMessage: normalizedMessage.text,
            time: normalizedMessage.time,
            messages: exists
              ? conversation.messages
              : [...conversation.messages, normalizedMessage],
          };
        })
      );
    };

    socket.on("message:new", handleIncomingMessage);
    socket.on("message:sent", handleSentMessage);

    return () => {
      socket.off("message:new", handleIncomingMessage);
      socket.off("message:sent", handleSentMessage);
    };
  }, [currentUserId, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversations, selectedId, loadingMessages]);

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
        conversation.lastMessage,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [conversations, searchTerm]);

  const openConversation = (conversationId) => {
    setSelectedId(conversationId);
    selectedIdRef.current = conversationId;
    setMobileChatOpen(true);
    setMessageError("");

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = messageText.trim();

    if (!text || !selectedConversation || sending) return;

    setSending(true);
    setMessageError("");

    try {
      const response = await api.post(
        `/messages/${encodeURIComponent(selectedConversation.id)}`,
        { text }
      );

      const returnedMessage =
        response.data?.data?.message ||
        response.data?.messageRecord ||
        response.data?.data ||
        response.data?.message;

      setMessageText("");

      if (returnedMessage && typeof returnedMessage === "object") {
        const message = normalizeMessage(returnedMessage, currentUserId);

        setConversations((previous) =>
          previous.map((conversation) => {
            if (conversation.id !== selectedConversation.id) {
              return conversation;
            }

            const exists = conversation.messages.some(
              (item) => item.id === message.id
            );

            return {
              ...conversation,
              lastMessage: message.text,
              time: message.time,
              messages: exists
                ? conversation.messages
                : [...conversation.messages, message],
            };
          })
        );
      }

      await fetchConversations();
    } catch (err) {
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
      sendMessage(event);
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

      {error && (
        <div role="alert" className="investor-message-error">
          {error}
          <button type="button" onClick={fetchConversations}>
            Retry
          </button>
        </div>
      )}

      <section
        className={`investor-chat-container ${
          mobileChatOpen ? "investor-mobile-chat-open" : ""
        }`}
      >
        <aside className="investor-conversation-panel">
          <div className="investor-conversation-header">
            <h3>Conversations</h3>
            <span>
              {
                conversations.filter(
                  (conversation) => conversation.unread > 0
                ).length
              }{" "}
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
              aria-label="Search conversations"
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
            ) : filteredConversations.length ? (
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
                <ArrowLeft size={20} />
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

              {loadingMessages ? (
                <div className="investor-no-chat-selected">
                  <p>Loading messages...</p>
                </div>
              ) : (
                <>
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
                          {message.sender === "me" && (
                            <CheckCheck size={14} />
                          )}
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
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messageError && (
              <p role="alert" className="investor-message-error">
                {messageError}
              </p>
            )}

            <form className="investor-message-composer" onSubmit={sendMessage}>
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
                maxLength={5000}
                disabled={sending}
                aria-label="Type your message"
              />

              <button
                type="button"
                onClick={() =>
                  setMessageText((current) => `${current}😊`)
                }
                aria-label="Add emoji"
              >
                <Smile size={19} />
              </button>

              <button
                type="submit"
                className="investor-send-button"
                disabled={!messageText.trim() || sending}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
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