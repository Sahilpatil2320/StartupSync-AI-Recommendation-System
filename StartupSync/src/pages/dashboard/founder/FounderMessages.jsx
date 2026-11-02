import {
  ArrowLeft,
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
import "./FounderMessages.css";

const getId = (value) =>
  String(value?._id || value?.id || value || "");

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
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
  const [notice, setNotice] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef("");
  const searchRequestRef = useRef(0);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);

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

  // Search registered users using the existing API.
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

  // Existing Socket.IO events are preserved.
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
              sender: senderIsCurrentUser,
              senderId,
              text: message.text,
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
            text: message.text,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Close emoji and attachment popovers when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        !event.target.closest(".founder-attachment-wrapper")
      ) {
        setShowAttachmentMenu(false);
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

  const existingConversationIds = useMemo(
    () => new Set(conversations.map((item) => item.id)),
    [conversations]
  );

  const showSearchResults =
    showUserSearch && searchTerm.trim().length >= 2;

  const handleConversationSelect = (id) => {
    setSelectedConversationId(id);
    selectedIdRef.current = id;
    setMobileChatOpen(true);
    setShowUserSearch(false);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    setNotice("");

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
    setNotice("");

    await loadMessages(user.id);
  };

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
              readAt: message.readAt || null,
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

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;

    setMessageText((previous) => `${previous}${emoji}`);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setShowAttachmentMenu(false);

    setNotice(
      `"${file.name}" selected. Your current message API only accepts text, so file sending needs backend upload support.`
    );

    event.target.value = "";
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

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setNotice("");
  };

  return (
    <section className="founder-messages-page">
      <div className="founder-messages-page-header">
        <div>
          <span className="founder-messages-badge">
            Communication Center
          </span>

          <h2>Messages</h2>

          <p>
            Connect and communicate with investors, mentors and
            your startup team.
          </p>
        </div>
      </div>

      {(error || notice) && (
        <div
          role="status"
          className={`founder-message-notice ${
            error ? "founder-message-notice-error" : ""
          }`}
        >
          <span>{error || notice}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
            }}
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>
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
              <span>{conversations.length} conversations</span>
            </div>

            <div className="founder-conversation-header-actions">
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
                <UserRound size={19} />
              </button>

              <button
                type="button"
                title="Refresh conversations"
                aria-label="Refresh conversations"
                onClick={handleRefresh}
                disabled={loadingConversations}
              >
                <RefreshCw
                  size={18}
                  className={
                    loadingConversations
                      ? "founder-refresh-spinning"
                      : ""
                  }
                />
              </button>
            </div>
          </div>

          <div className="founder-conversation-search">
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

          <div className="founder-conversation-list">
            {showSearchResults ? (
              searchingUsers ? (
                <div className="founder-message-empty">
                  Searching users...
                </div>
              ) : searchResults.length ? (
                <>
                  <div className="founder-search-section-label">
                    Registered users
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

                    <small>{conversation.role}</small>

                    <div className="founder-conversation-message-row">
                      <p>{conversation.lastMessage}</p>

                      {conversation.unread > 0 && (
                        <span className="founder-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="founder-message-empty">
                <MessageCircle size={25} />

                <h4>
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet"}
                </h4>

                <p>
                  {searchTerm
                    ? "Try another name or keyword."
                    : "Search for a registered user to start a chat."}
                </p>
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
                  aria-label="Audio call"
                  title="Audio call"
                  onClick={() => handleCallAction("Audio")}
                >
                  <Phone size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Video call"
                  title="Video call"
                  onClick={() => handleCallAction("Video")}
                >
                  <Video size={19} />
                </button>
              </div>
            </header>

            <div className="founder-chat-messages">
              {messages.length > 0 && (
                <div className="founder-chat-date">
                  <span>Conversation</span>
                </div>
              )}

              {loadingMessages ? (
                <div className="founder-message-empty">
                  Loading messages...
                </div>
              ) : messages.length ? (
                messages.map((message) => (
                  <div
                    className={`founder-message-row ${
                      message.sender
                        ? "founder-message-row-own"
                        : "founder-message-row-other"
                    }`}
                    key={message.id}
                  >
                    <div
                      className={`founder-message-bubble ${
                        message.sender
                          ? "founder-message-bubble-own"
                          : "founder-message-bubble-other"
                      }`}
                    >
                      <p>{message.text}</p>

                      <div className="founder-message-meta">
                        <span>{message.time}</span>

                        {message.sender && (
                          <CheckCheck
                            size={14}
                            className={
                              message.readAt
                                ? "founder-message-read"
                                : ""
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="founder-message-empty founder-chat-empty-state">
                  <div className="founder-chat-empty-icon">
                    <MessageCircle size={24} />
                  </div>

                  <h3>Start a conversation</h3>
                  <p>
                    Send a message to begin chatting with this user.
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              className="founder-message-composer"
              onSubmit={handleSendMessage}
            >
              {selectedFile && (
                <div className="founder-selected-file">
                  <span>{selectedFile.name}</span>

                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    aria-label="Remove selected file"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="founder-composer-actions">
                <div className="founder-attachment-wrapper">
                  <button
                    type="button"
                    className="founder-composer-icon"
                    aria-label="Attach file"
                    title="Attach file"
                    onClick={() =>
                      setShowAttachmentMenu((value) => !value)
                    }
                  >
                    <Paperclip size={19} />
                  </button>

                  {showAttachmentMenu && (
                    <div className="founder-attachment-menu">
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = "image/*";
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <span className="founder-attachment-menu-icon">
                          <Smile size={18} />
                        </span>
                        Photos & videos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept =
                              ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <span className="founder-attachment-menu-icon">
                          <Paperclip size={18} />
                        </span>
                        Documents
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                  />
                </div>

                <div
                  className="founder-emoji-wrapper"
                  ref={emojiPickerRef}
                >
                  <button
                    type="button"
                    className="founder-composer-icon"
                    aria-label="Choose emoji"
                    title="Emoji"
                    onClick={() =>
                      setShowEmojiPicker((value) => !value)
                    }
                  >
                    <Smile size={19} />
                  </button>

                  {showEmojiPicker && (
                    <div className="founder-emoji-picker">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width="100%"
                        height={350}
                        searchPlaceHolder="Search emoji..."
                        previewConfig={{ showPreview: false }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <textarea
                ref={messageInputRef}
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                placeholder="Type a message..."
                rows={1}
                maxLength={5000}
                disabled={sending}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSendMessage(event);
                  }
                }}
              />

              <button
                type="submit"
                className="founder-send-button"
                aria-label="Send message"
                title="Send message"
                disabled={!messageText.trim() || sending}
              >
                <Send size={19} />
              </button>
            </form>
          </section>
        ) : (
          <section className="founder-chat-no-selection">
            <div>
              <MessageCircle size={30} />
              <h3>
                {loadingConversations
                  ? "Loading conversations..."
                  : "Select a conversation"}
              </h3>
              <p>
                Choose a conversation from the list to view messages.
              </p>
            </div>
          </section>
        )}
      </section>
    </section>
  );
}

export default FounderMessages;