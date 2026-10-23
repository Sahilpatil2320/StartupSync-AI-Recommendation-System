
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
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
import "./FounderMessages.css";

const getId = (value) =>
  String(value?._id || value?.id || value || "");

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name = "User") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

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

function FounderMessages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loadingConversations, setLoadingConversations] =
    useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef("");
  const searchRequestRef = useRef(0);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get("/messages/conversations");
      const data = response.data?.data || [];

      setConversations(
        data.map((item) => {
          const user = item.user || {};
          const lastMessage = item.lastMessage || {};

          return {
            id: getId(user),
            name: user.name || "User",
            role: user.role || "Member",
            initials: getInitials(user.name),
            lastMessage:
              lastMessage.text || "Start a conversation",
            time: formatTime(lastMessage.createdAt),
            unread: Number(item.unreadCount || 0),
            online: false,
          };
        })
      );

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

  const loadMessages = useCallback(async (userId) => {
    if (!userId) return;

    setLoadingMessages(true);

    try {
      const response = await api.get(`/messages/${userId}`);
      const data = response.data?.data || [];

      setMessages(
        data.map((message) => ({
          id: getId(message),
          sender:
            getId(message.sender) === getCurrentUserId(),
          senderId: getId(message.sender),
          text: message.text,
          time: formatTime(message.createdAt),
          createdAt: message.createdAt,
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
          "Could not load messages."
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

  // Search registered users through the existing backend endpoint.
  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2) {
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
  }, [searchTerm, currentUserId]);

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

      setConversations((previous) => {
        const existing = previous.find(
          (item) => item.id === otherUserId
        );

        const senderIsCurrentUser =
          senderId === currentUserId;

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
          lastMessage: message.text,
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
              sender: senderId === currentUserId,
              senderId,
              text: message.text,
              time: formatTime(message.createdAt),
              createdAt: message.createdAt,
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
            text: message.text,
            time: formatTime(message.createdAt),
            createdAt: message.createdAt,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.id === selectedConversationId
  );

  const filteredConversations = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    if (!value) return conversations;

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(value) ||
        conversation.role.toLowerCase().includes(value) ||
        conversation.lastMessage.toLowerCase().includes(value)
    );
  }, [conversations, searchTerm]);

  const existingConversationIds = useMemo(
    () => new Set(conversations.map((item) => item.id)),
    [conversations]
  );

  const handleConversationSelect = (id) => {
    setSelectedConversationId(id);
    selectedIdRef.current = id;
    setMobileChatOpen(true);
    setShowUserSearch(false);

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

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
        ...previous.filter((item) => item.id !== user.id),
      ]);
    }

    setSelectedConversationId(user.id);
    selectedIdRef.current = user.id;
    setMobileChatOpen(true);
    setShowUserSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    setError("");

    await loadMessages(user.id);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !selectedConversationId || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post(
        `/messages/${selectedConversationId}`,
        { text }
      );

      const message = response.data?.data;

      if (message) {
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
              text: message.text,
              time: formatTime(message.createdAt),
              createdAt: message.createdAt,
            },
          ];
        });
      }

      setMessageText("");
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

  const handleBackToConversations = () =>
    setMobileChatOpen(false);

  const showSearchResults =
    searchTerm.trim().length >= 2 &&
    (searchingUsers ||
      searchResults.length > 0 ||
      !filteredConversations.length);

  return (
    <div className="founder-messages-page">
      <div className="founder-messages-page-header">
        <div>
          <span className="founder-messages-badge">
            Communication
          </span>
          <h2>Messages</h2>
          <p>
            Connect and communicate with investors, mentors and
            your startup team.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="founder-message-error">
          {error}
        </div>
      )}

      <section className="founder-messages-workspace">
        <aside
          className={`founder-conversation-sidebar ${
            mobileChatOpen
              ? "founder-conversation-sidebar-hidden"
              : ""
          }`}
        >
          <div className="founder-conversation-header">
            <div>
              <h3>Conversations</h3>
              <span>{conversations.length} chats</span>
            </div>

            <button
              type="button"
              aria-label="Conversation options"
              title="Conversation options"
            >
              <MoreVertical size={18} />
            </button>
          </div>

          <div className="founder-conversation-search">
            <Search size={17} />
            <input
              type="text"
              placeholder={
                showUserSearch
                  ? "Search registered users..."
                  : "Search conversations or users..."
              }
              value={searchTerm}
              onFocus={() => setShowUserSearch(true)}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="founder-conversation-list">
            {showSearchResults ? (
              searchingUsers ? (
                <div className="founder-message-empty">
                  Searching users...
                </div>
              ) : searchResults.length ? (
                <>
                  <div className="founder-message-empty">
                    <small>Registered users</small>
                  </div>

                  {searchResults.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="founder-conversation-item"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="founder-conversation-avatar">
                        {user.initials}
                      </div>

                      <div className="founder-conversation-details">
                        <div className="founder-conversation-name-row">
                          <strong>{user.name}</strong>
                        </div>
                        <div className="founder-conversation-message-row">
                          <p>
                            {existingConversationIds.has(user.id)
                              ? "Open conversation"
                              : "Start a new conversation"}
                          </p>
                        </div>
                        <small>{user.role}</small>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="founder-message-empty">
                  <Search size={25} />
                  <p>No matching users found.</p>
                  <small>
                    Try another name with at least two characters.
                  </small>
                </div>
              )
            ) : loadingConversations ? (
              <div className="founder-message-empty">
                Loading conversations...
              </div>
            ) : filteredConversations.length ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`founder-conversation-item ${
                    selectedConversationId === conversation.id
                      ? "founder-conversation-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleConversationSelect(conversation.id)
                  }
                >
                  <div className="founder-conversation-avatar">
                    {conversation.initials}
                    {conversation.online && (
                      <span className="founder-online-dot" />
                    )}
                  </div>

                  <div className="founder-conversation-details">
                    <div className="founder-conversation-name-row">
                      <strong>{conversation.name}</strong>
                      <span>{conversation.time}</span>
                    </div>

                    <div className="founder-conversation-message-row">
                      <p>{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <span className="founder-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>

                    <small>{conversation.role}</small>
                  </div>
                </button>
              ))
            ) : (
              <div className="founder-message-empty">
                <Search size={25} />
                <p>No conversations yet.</p>
                <small>
                  Search for a registered user above to start a chat.
                </small>
              </div>
            )}
          </div>
        </aside>

        {selectedConversation ? (
          <section
            className={`founder-chat-panel ${
              mobileChatOpen
                ? "founder-chat-panel-mobile-open"
                : ""
            }`}
          >
            <header className="founder-chat-header">
              <div className="founder-chat-person">
                <button
                  type="button"
                  className="founder-chat-back-button"
                  onClick={handleBackToConversations}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="founder-chat-avatar">
                  {selectedConversation.initials}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>
                  <span>{selectedConversation.role}</span>
                </div>
              </div>

              <div className="founder-chat-actions">
                <button
                  type="button"
                  aria-label="Voice call"
                  onClick={() =>
                    window.alert(
                      "Voice calling is not implemented yet."
                    )
                  }
                >
                  <Phone size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Video call"
                  onClick={() =>
                    window.alert(
                      "Video calling is not implemented yet."
                    )
                  }
                >
                  <Video size={19} />
                </button>

                <button
                  type="button"
                  aria-label="More options"
                >
                  <MoreVertical size={19} />
                </button>
              </div>
            </header>

            <div className="founder-chat-messages">
              <div className="founder-chat-date">
                <span>Conversation</span>
              </div>

              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : messages.length ? (
                messages.map((message) => (
                  <div
                    className={`founder-message-row ${
                      message.sender
                        ? "founder-message-row-own"
                        : ""
                    }`}
                    key={message.id}
                  >
                    <div className="founder-message-bubble">
                      <p>{message.text}</p>
                      <span>{message.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="founder-message-empty">
                  <p>No messages yet. Say hello!</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              className="founder-message-composer"
              onSubmit={handleSendMessage}
            >
              <button
                type="button"
                aria-label="File attachment"
                onClick={() =>
                  window.alert(
                    "File attachments are not implemented yet."
                  )
                }
              >
                <Paperclip size={19} />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                placeholder="Write a message..."
                maxLength={5000}
                disabled={sending}
              />

              <button
                type="button"
                aria-label="Add smile"
                onClick={() =>
                  setMessageText((previous) => `${previous} 😊`)
                }
              >
                <Smile size={19} />
              </button>

              <button
                type="submit"
                className="founder-send-button"
                aria-label="Send message"
                disabled={!messageText.trim() || sending}
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        ) : (
          <section className="founder-chat-no-selection">
            <div>
              <Search size={30} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation to view messages.</p>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

export default FounderMessages;