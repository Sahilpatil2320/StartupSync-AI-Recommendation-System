import {
  CheckCheck,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  RefreshCw,
  UserRound,
  MessageCircle,
  X,
  ArrowLeft,
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
import EmojiPicker from "emoji-picker-react";

import "./MentorMessages.css";

const getId = (value) =>
  String(value?._id || value?.id || value || "");

const getInitials = (name = "User") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "U";

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem("startupsync_user") || "{}"
    );

    return getId(user);
  } catch {
    return "";
  }
};

function MentorMessages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [loadingConversations, setLoadingConversations] =
    useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef("");
  const searchRequestRef = useRef(0);
  const messageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // Load conversations from the backend.
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);

    try {
      const response = await api.get("/messages/conversations");
      const data = response.data?.data || [];

      const rows = data.map((item) => {
        const user = item.user || {};
        const lastMessage = item.lastMessage || {};

        return {
          id: getId(user),
          name: user.name || "StartupSync user",
          role: user.role || "Member",
          initials: getInitials(user.name),
          lastMessage:
            lastMessage.text || "Start a conversation",
          time: formatTime(lastMessage.createdAt),
          unread: Number(item.unreadCount || 0),
          online: false,
        };
      });

      setConversations(rows);

      setSelectedConversationId((current) => {
        if (current && rows.some((item) => item.id === current)) {
          return current;
        }

        return rows[0]?.id || "";
      });

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Load messages for the selected user.
  const loadMessages = useCallback(async (userId) => {
    if (!userId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    try {
      const response = await api.get(
        `/messages/${encodeURIComponent(userId)}`
      );

      const data = response.data?.data || [];

      setMessages(
        data.map((message) => ({
          id: getId(message),
          sender: getId(message.sender) === getCurrentUserId(),
          senderId: getId(message.sender),
          text: message.text || "",
          time: formatTime(message.createdAt),
          createdAt: message.createdAt,
          readAt: message.readAt || null,
        }))
      );

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === userId
            ? { ...conversation, unread: 0 }
            : conversation
        )
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load message history."
      );
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, loadMessages]);

  // Search registered StartupSync users.
  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2 || !showUserSearch) {
      searchRequestRef.current += 1;
      setSearchResults([]);
      setSearchingUsers(false);
      return undefined;
    }

    const requestId = ++searchRequestRef.current;

    setSearchingUsers(true);

    const timer = setTimeout(async () => {
      try {
        const response = await api.get("/messages/users", {
          params: { search: query },
        });

        if (requestId !== searchRequestRef.current) return;

        const users = response.data?.data || [];

        setSearchResults(
          users
            .filter((user) => getId(user) !== currentUserId)
            .map((user) => ({
              id: getId(user),
              name: user.name || "User",
              role: user.role || "Member",
              initials: getInitials(user.name),
            }))
        );
      } catch (err) {
        if (requestId === searchRequestRef.current) {
          setSearchResults([]);
          setError(
            err.response?.data?.message ||
              "Could not search users."
          );
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setSearchingUsers(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, showUserSearch, currentUserId]);

  // Existing Socket.IO messaging events.
  useEffect(() => {
    const socket = connectSocket();

    if (!socket) {
      setError("Please sign in again to use messages.");
      return undefined;
    }

    const handleNewMessage = (message) => {
      const senderId = getId(message.sender);
      const receiverId = getId(message.receiver);

      const otherUserId =
        senderId === currentUserId ? receiverId : senderId;

      const activeId = selectedIdRef.current;
      const senderIsCurrentUser = senderId === currentUserId;

      setConversations((previous) => {
        const existing = previous.find(
          (item) => item.id === otherUserId
        );

        const name = senderIsCurrentUser
          ? existing?.name || "User"
          : message.sender?.name || existing?.name || "User";

        const role = senderIsCurrentUser
          ? existing?.role || "Member"
          : message.sender?.role || existing?.role || "Member";

        const updated = {
          id: otherUserId,
          name,
          role,
          initials: getInitials(name),
          lastMessage: message.text || "New message",
          time: formatTime(message.createdAt),
          unread:
            otherUserId === activeId
              ? 0
              : (existing?.unread || 0) + 1,
          online: false,
        };

        return [
          updated,
          ...previous.filter(
            (item) => item.id !== otherUserId
          ),
        ];
      });

      if (otherUserId === activeId) {
        setMessages((previous) => {
          if (
            previous.some(
              (item) => item.id === getId(message)
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            {
              id: getId(message),
              sender: senderIsCurrentUser,
              senderId,
              text: message.text || "",
              time: formatTime(message.createdAt),
              createdAt: message.createdAt,
              readAt: message.readAt || null,
            },
          ];
        });
      }

      loadConversations();
    };

    const handleSentMessage = (message) => {
      if (getId(message.receiver) !== selectedIdRef.current) {
        loadConversations();
        return;
      }

      setMessages((previous) => {
        if (
          previous.some(
            (item) => item.id === getId(message)
          )
        ) {
          return previous;
        }

        return [
          ...previous,
          {
            id: getId(message),
            sender: true,
            senderId: getId(message.sender),
            text: message.text || "",
            time: formatTime(message.createdAt),
            createdAt: message.createdAt,
            readAt: message.readAt || null,
          },
        ];
      });

      loadConversations();
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:sent", handleSentMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:sent", handleSentMessage);
    };
  }, [currentUserId, loadConversations]);

  // Scroll to the newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Close emoji picker when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.id === selectedConversationId
  );

  const filteredConversations = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    if (!value || showUserSearch) return conversations;

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(value) ||
        conversation.role.toLowerCase().includes(value) ||
        conversation.lastMessage.toLowerCase().includes(value)
    );
  }, [conversations, searchTerm, showUserSearch]);

  const handleConversationSelect = (id) => {
    setSelectedConversationId(id);
    selectedIdRef.current = id;
    setMobileChatOpen(true);
    setShowUserSearch(false);
    setShowEmojiPicker(false);
    setNotice("");

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  // Start a conversation with a searched user.
  const handleUserSelect = async (user) => {
    if (!user?.id) return;

    const existing = conversations.find(
      (conversation) => conversation.id === user.id
    );

    if (!existing) {
      setConversations((previous) => [
        {
          id: user.id,
          name: user.name,
          role: user.role,
          initials: user.initials,
          lastMessage: "Start a conversation",
          time: "",
          unread: 0,
          online: false,
        },
        ...previous,
      ]);
    }

    setSelectedConversationId(user.id);
    selectedIdRef.current = user.id;
    setMobileChatOpen(true);
    setShowUserSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    setError("");
    setNotice("");

    await loadMessages(user.id);
  };

  // Send and persist a message.
  const handleSendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !selectedConversationId || sending) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      const response = await api.post(
        `/messages/${encodeURIComponent(selectedConversationId)}`,
        { text }
      );

      const savedMessage = response.data?.data;

      if (savedMessage) {
        setMessages((previous) => {
          if (
            previous.some(
              (item) => item.id === getId(savedMessage)
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            {
              id: getId(savedMessage),
              sender: true,
              senderId: getId(savedMessage.sender),
              text: savedMessage.text || text,
              time: formatTime(savedMessage.createdAt),
              createdAt: savedMessage.createdAt,
              readAt: savedMessage.readAt || null,
            },
          ];
        });
      }

      setMessageText("");
      setShowEmojiPicker(false);

      await loadConversations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageText(
      (previous) => `${previous}${emojiData.emoji}`
    );

    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleRefresh = async () => {
    await loadConversations();

    if (selectedConversationId) {
      await loadMessages(selectedConversationId);
    }
  };

  const handleBackToConversations = () => {
    setMobileChatOpen(false);
  };

  const handleCallAction = (type) => {
    setNotice(`${type} calling is not implemented yet.`);
  };

  const handleAttachment = () => {
    setNotice(
      "File attachments require backend upload support. Text messaging is available."
    );
  };

  return (
    <div className="mentor-messages-page">
      <section className="mentor-messages-header">
        <div>
          <span className="mentor-messages-badge">
            Communication
          </span>

          <h2>Messages</h2>

          <p>
            Communicate with startup founders and manage your
            mentorship conversations.
          </p>
        </div>
      </section>

      {(error || notice) && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: error ? "#fef2f2" : "#eff6ff",
            color: error ? "#b91c1c" : "#1d4ed8",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span>{error || notice}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
            }}
            aria-label="Dismiss message"
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="mentor-messages-workspace">
        {/* Conversation sidebar */}
        <aside
          className={`mentor-conversation-sidebar ${
            mobileChatOpen
              ? "mentor-conversation-sidebar-hidden"
              : ""
          }`}
        >
          <div className="mentor-conversation-header">
            <div>
              <h3>Conversations</h3>
              <span>{conversations.length} conversations</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                title="Find a user"
                aria-label="Find a user"
                onClick={() => {
                  setShowUserSearch((value) => !value);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
              >
                <UserRound size={17} />
              </button>

              <button
                type="button"
                title="Refresh conversations"
                aria-label="Refresh conversations"
                onClick={handleRefresh}
                disabled={loadingConversations}
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          <div className="mentor-conversation-search">
            <Search size={17} />

            <input
              type="text"
              placeholder={
                showUserSearch
                  ? "Search registered users..."
                  : "Search conversations..."
              }
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults([]);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="mentor-conversation-list">
            {showUserSearch && searchTerm.trim().length >= 2 ? (
              searchingUsers ? (
                <div className="mentor-no-conversations">
                  Searching users...
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="mentor-search-section-label">
                    Registered users
                  </div>

                  {searchResults.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="mentor-conversation-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="mentor-conversation-avatar">
                        {user.initials}
                      </div>

                      <div className="mentor-conversation-info">
                        <div className="mentor-conversation-top">
                          <strong>{user.name}</strong>
                        </div>

                        <span>{user.role}</span>

                        <p>Start or open conversation</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="mentor-no-conversations">
                  No matching users found.
                </div>
              )
            ) : loadingConversations ? (
              <div className="mentor-no-conversations">
                Loading conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`mentor-conversation-item ${
                    selectedConversationId === conversation.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleConversationSelect(conversation.id)
                  }
                >
                  <div className="mentor-conversation-avatar">
                    {conversation.initials}

                    {conversation.online && (
                      <span className="mentor-online-dot" />
                    )}
                  </div>

                  <div className="mentor-conversation-info">
                    <div className="mentor-conversation-top">
                      <strong>{conversation.name}</strong>

                      {conversation.unread > 0 && (
                        <span className="mentor-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>

                    <span>{conversation.role}</span>

                    <p>{conversation.lastMessage}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="mentor-no-conversations">
                <MessageCircle size={22} />

                <p>
                  {searchTerm
                    ? "No conversations found."
                    : "No conversations yet."}
                </p>

                <small>
                  Search for a registered StartupSync user to start
                  a conversation.
                </small>
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}
        {selectedConversation ? (
          <div
            className={`mentor-chat-area ${
              mobileChatOpen
                ? "mentor-chat-area-mobile-open"
                : ""
            }`}
          >
            <header className="mentor-chat-header">
              <div className="mentor-chat-user">
                <button
                  type="button"
                  className="mentor-mobile-close"
                  onClick={handleBackToConversations}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="mentor-chat-avatar">
                  {selectedConversation.initials}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>
                  <p>{selectedConversation.role}</p>
                </div>
              </div>

              <div className="mentor-chat-actions">
                <button
                  type="button"
                  onClick={() => handleCallAction("Audio")}
                  aria-label="Start voice call"
                >
                  <Phone size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => handleCallAction("Video")}
                  aria-label="Start video call"
                >
                  <Video size={19} />
                </button>
              </div>
            </header>

            <div className="mentor-chat-messages">
              {messages.length > 0 && (
                <div className="mentor-chat-date">
                  <span>Conversation</span>
                </div>
              )}

              {loadingMessages ? (
                <div className="mentor-no-conversations">
                  Loading messages...
                </div>
              ) : messages.length > 0 ? (
                messages.map((chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`mentor-chat-message ${
                      chatMessage.sender ? "sent" : "received"
                    }`}
                  >
                    <div className="mentor-message-bubble">
                      <p>{chatMessage.text}</p>

                      <div className="mentor-message-meta">
                        <span>{chatMessage.time}</span>

                        {chatMessage.sender && (
                          <CheckCheck
                            size={14}
                            color={
                              chatMessage.readAt
                                ? "#93c5fd"
                                : "currentColor"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mentor-chat-empty-state">
                  <MessageCircle size={25} />
                  <h3>Start a conversation</h3>
                  <p>
                    Send a message to begin chatting with this user.
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              className="mentor-chat-composer"
              onSubmit={handleSendMessage}
            >
              <div className="mentor-composer-actions">
                <button
                  type="button"
                  onClick={handleAttachment}
                  aria-label="Attach file"
                  title="Attach file"
                >
                  <Paperclip size={19} />
                </button>

                <div
                  ref={emojiPickerRef}
                  style={{ position: "relative" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowEmojiPicker((value) => !value)
                    }
                    aria-label="Add emoji"
                    title="Emoji"
                  >
                    <Smile size={19} />
                  </button>

                  {showEmojiPicker && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 48,
                        left: 0,
                        zIndex: 1000,
                      }}
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        height={350}
                        width={300}
                      />
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={messageInputRef}
                type="text"
                placeholder="Write a message..."
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSendMessage(event);
                  }
                }}
                maxLength={5000}
                disabled={sending}
              />

              <button
                type="submit"
                className="mentor-send-message"
                disabled={!messageText.trim() || sending}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="mentor-chat-area mentor-chat-no-selection">
            <div className="mentor-chat-empty-state">
              <MessageCircle size={25} />

              <h3>
                {loadingConversations
                  ? "Loading conversations..."
                  : "No conversation selected"}
              </h3>

              <p>
                {conversations.length === 0
                  ? "Search for a StartupSync user to start messaging."
                  : "Choose a conversation from the list."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default MentorMessages;