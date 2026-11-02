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
  FileText,
  Image as ImageIcon,
  Download,
  Film,
  Music,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import "./StudentMessages.css";
import "./StudentMessages.attachments.css";

const API_BASE_URL = "http://localhost:5000/api/messages";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "U"
  );
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
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

function formatFileSize(bytes = 0) {
  if (!bytes) return "";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentType(mimeType = "") {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";

  return "document";
}

function getAttachmentIcon(mimeType = "") {
  const type = getAttachmentType(mimeType);

  if (type === "image") return ImageIcon;
  if (type === "video") return Film;
  if (type === "audio") return Music;

  return FileText;
}

function StudentMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState("");

  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");

  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const [loadingConversations, setLoadingConversations] =
    useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const requestIdRef = useRef(0);

  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("startupsync_user") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const currentUserId = String(
    currentUser._id || currentUser.id || ""
  );

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

      if (
        !response.data?.success ||
        !Array.isArray(response.data.data)
      ) {
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
          lastMessage:
            lastMessage.text ||
            (lastMessage.attachments?.length
              ? "Attachment"
              : "Start a conversation"),
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

        if (
          !response.data?.success ||
          !Array.isArray(response.data.data)
        ) {
          throw new Error("Unexpected messages API response.");
        }

        if (requestId !== requestIdRef.current) return;

        setMessages(
          response.data.data.map((message) => ({
            id: String(message._id),
            sender:
              String(message.sender?._id || message.sender) ===
              currentUserId
                ? "me"
                : "them",
            text: message.text || "",
            attachments: message.attachments || [],
            readAt: message.readAt || null,
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
    [currentUserId, getAuthConfig]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [selectedFiles]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPanel(false);
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
    setShowAttachmentMenu(false);
    setShowUserSearch(false);
    setNotice("");
    setError("");
    setSelectedFiles([]);
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if (
      (!text && selectedFiles.length === 0) ||
      !selectedConversationId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      let response;

      if (selectedFiles.length > 0) {
        const formData = new FormData();

        formData.append("text", text);

        selectedFiles.forEach((file) => {
          formData.append("files", file.file);
        });

        response = await axios.post(
          `${API_BASE_URL}/${encodeURIComponent(
            selectedConversationId
          )}`,
          formData,
          {
            ...getAuthConfig(),
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/${encodeURIComponent(
            selectedConversationId
          )}`,
          { text },
          getAuthConfig()
        );
      }

      if (
        !response.data?.success ||
        !response.data.data?._id
      ) {
        throw new Error(
          "The server did not confirm saving this message."
        );
      }

      const saved = response.data.data;

      setMessages((current) => [
        ...current,
        {
          id: String(saved._id),
          sender: "me",
          text: saved.text || "",
          attachments: saved.attachments || [],
          readAt: saved.readAt || null,
          time: formatMessageTime(saved.createdAt),
          createdAt: saved.createdAt,
        },
      ]);

      const previewText =
        saved.text ||
        (saved.attachments?.length
          ? `${saved.attachments.length} attachment(s)`
          : "");

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: previewText,
                time: formatTime(saved.createdAt),
                lastMessageAt: saved.createdAt,
              }
            : conversation
        )
      );

      setMessageText("");
      setSelectedFiles([]);
      setShowEmojiPanel(false);
      setShowAttachmentMenu(false);
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
      const response = await axios.get(
        `${API_BASE_URL}/users`,
        {
          ...getAuthConfig(),
          params: { search: value.trim() },
        }
      );

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

  const startConversation = (user) => {
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
    setError("");
  };

  const addEmoji = (emojiData) => {
    const emoji = emojiData.emoji;

    setMessageText((current) => `${current}${emoji}`);
    setShowEmojiPanel(false);
    messageInputRef.current?.focus();
  };

  const openFilePicker = (type) => {
    if (!fileInputRef.current) return;

    const acceptTypes = {
      image: "image/*",
      video: "video/*",
      document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
      audio: "audio/*",
      all: "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
    };

    fileInputRef.current.accept = acceptTypes[type] || acceptTypes.all;
    fileInputRef.current.click();

    setShowAttachmentMenu(false);
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024;
    const validFiles = [];
    const rejectedFiles = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        rejectedFiles.push(file.name);
      } else {
        validFiles.push({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : "",
        });
      }
    });

    setSelectedFiles((current) => [
      ...current,
      ...validFiles,
    ]);

    if (rejectedFiles.length > 0) {
      setNotice(
        `These files exceed the 10 MB limit: ${rejectedFiles.join(
          ", "
        )}`
      );
    } else {
      setNotice("");
    }

    // Allow selecting the same file again after removing it.
    event.target.value = "";
  };

  const removeSelectedFile = (id) => {
    setSelectedFiles((current) => {
      const removed = current.find((item) => item.id === id);

      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const handleCallAction = (type) => {
    setNotice(
      `${type} calling is not implemented yet.`
    );
  };

  const handleRefresh = async () => {
    await loadConversations();

    if (selectedConversationId) {
      await loadMessages(selectedConversationId);
    }
  };

  const renderAttachment = (attachment, index) => {
    const type = getAttachmentType(attachment.mimeType);
    const AttachmentIcon = getAttachmentIcon(
      attachment.mimeType
    );

    if (type === "image") {
      return (
        <a
          key={`${attachment.url}-${index}`}
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="student-message-image-link"
        >
          <img
            src={attachment.url}
            alt={attachment.originalName || "Shared image"}
            className="student-message-image"
            loading="lazy"
          />
        </a>
      );
    }

    if (type === "video") {
      return (
        <div
          key={`${attachment.url}-${index}`}
          className="student-message-file-card"
        >
          <video
            src={attachment.url}
            controls
            className="student-message-video"
          />
          <div className="student-message-file-details">
            <Film size={18} />
            <span>{attachment.originalName}</span>
            <a
              href={attachment.url}
              download={attachment.originalName}
              target="_blank"
              rel="noreferrer"
              aria-label="Download video"
            >
              <Download size={17} />
            </a>
          </div>
        </div>
      );
    }

    if (type === "audio") {
      return (
        <div
          key={`${attachment.url}-${index}`}
          className="student-message-file-card"
        >
          <audio
            src={attachment.url}
            controls
            className="student-message-audio"
          />
          <div className="student-message-file-details">
            <Music size={18} />
            <span>{attachment.originalName}</span>
            <a
              href={attachment.url}
              download={attachment.originalName}
              target="_blank"
              rel="noreferrer"
              aria-label="Download audio"
            >
              <Download size={17} />
            </a>
          </div>
        </div>
      );
    }

    return (
      <a
        key={`${attachment.url}-${index}`}
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="student-message-document"
      >
        <span className="student-message-document-icon">
          <AttachmentIcon size={22} />
        </span>

        <span className="student-message-document-info">
          <strong>{attachment.originalName}</strong>
          <small>
            {formatFileSize(attachment.size)}
          </small>
        </span>

        <Download size={18} />
      </a>
    );
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
            Connect with recruiters, founders and opportunity
            providers through StartupSync.
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
              <span>
                {conversations.length} conversations
              </span>
            </div>

            <div className="student-conversations-header-actions">
              <button
                type="button"
                title="Find a StartupSync user"
                aria-label="Find a user"
                onClick={() =>
                  setShowUserSearch((value) => !value)
                }
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
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {showUserSearch && (
            <div className="student-user-search-panel">
              <input
                value={userSearch}
                onChange={(event) =>
                  searchPeople(event.target.value)
                }
                placeholder="Search people by name..."
                aria-label="Search StartupSync users"
              />

              {searchingUsers && <p>Searching...</p>}

              {userResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => startConversation(user)}
                  className="student-user-search-result"
                >
                  <span className="student-conversation-avatar">
                    {getInitials(user.name)}
                  </span>

                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.role}</small>
                  </span>
                </button>
              ))}

              {!searchingUsers &&
                userSearch.trim().length >= 2 &&
                userResults.length === 0 && (
                  <p>No users found.</p>
                )}
            </div>
          )}

          <div className="student-conversation-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
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
                  onClick={() =>
                    handleSelectConversation(conversation.id)
                  }
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
                <MessageCircle size={22} />

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

            <div className="student-chat-messages">
              <div className="student-chat-date">
                <span>Conversation</span>
              </div>

              {loadingMessages ? (
                <div className="student-chat-empty">
                  <p>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => {
                  const isMine = message.sender === "me";

                  return (
                    <div
                      key={message.id}
                      className={`student-message-row ${
                        isMine
                          ? "student-message-row-me"
                          : "student-message-row-them"
                      }`}
                    >
                      <div
                        className={`student-message-bubble ${
                          isMine
                            ? "student-message-bubble-me"
                            : "student-message-bubble-them"
                        }`}
                      >
                        {message.text && (
                          <p className="student-message-text">
                            {message.text}
                          </p>
                        )}

                        {message.attachments?.length > 0 && (
                          <div className="student-message-attachments">
                            {message.attachments.map(
                              renderAttachment
                            )}
                          </div>
                        )}

                        <div className="student-message-meta">
                          <span>{message.time}</span>

                          {isMine && (
                            <CheckCheck
                              size={14}
                              className={
                                message.readAt
                                  ? "student-message-read"
                                  : ""
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="student-chat-empty">
                  <div className="student-chat-empty-icon">
                    <MessageCircle size={22} />
                  </div>

                  <h3>Start a conversation</h3>

                  <p>
                    Send a message to begin chatting with this
                    user.
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="student-chat-composer-wrapper">
              {selectedFiles.length > 0 && (
                <div className="student-selected-files">
                  {selectedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="student-selected-file"
                    >
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                        />
                      ) : (
                        <FileText size={22} />
                      )}

                      <div>
                        <strong>{item.file.name}</strong>
                        <small>
                          {formatFileSize(item.file.size)}
                        </small>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${item.file.name}`}
                        onClick={() =>
                          removeSelectedFile(item.id)
                        }
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="student-chat-composer">
                <div className="student-attachment-wrapper">
                  <button
                    type="button"
                    className="student-composer-icon"
                    aria-label="Attach file"
                    title="Attach file"
                    onClick={() =>
                      setShowAttachmentMenu((value) => !value)
                    }
                  >
                    <Paperclip size={19} />
                  </button>

                  {showAttachmentMenu && (
                    <div className="student-attachment-menu">
                      <button
                        type="button"
                        onClick={() => openFilePicker("image")}
                      >
                        <ImageIcon size={18} />
                        <span>Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openFilePicker("video")}
                      >
                        <Film size={18} />
                        <span>Videos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openFilePicker("document")}
                      >
                        <FileText size={18} />
                        <span>Documents</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openFilePicker("audio")}
                      >
                        <Music size={18} />
                        <span>Audio files</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openFilePicker("all")}
                      >
                        <Paperclip size={18} />
                        <span>Browse files</span>
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className="student-emoji-wrapper"
                  ref={emojiPickerRef}
                >
                  <button
                    type="button"
                    className="student-composer-icon"
                    aria-label="Add emoji"
                    title="Emoji"
                    onClick={() =>
                      setShowEmojiPanel((value) => !value)
                    }
                  >
                    <Smile size={19} />
                  </button>

                  {showEmojiPanel && (
                    <div className="student-emoji-panel">
                      <EmojiPicker
                        onEmojiClick={addEmoji}
                        width={320}
                        height={400}
                        searchPlaceHolder="Search emoji..."
                        previewConfig={{
                          showPreview: false,
                        }}
                        skinTonesDisabled={false}
                        lazyLoadEmojis={true}
                      />
                    </div>
                  )}
                </div>

                <textarea
                  ref={messageInputRef}
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  maxLength={5000}
                  disabled={sending}
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileSelection}
                />

                <button
                  type="button"
                  className="student-send-button"
                  aria-label="Send message"
                  title="Send message"
                  disabled={
                    (!messageText.trim() &&
                      selectedFiles.length === 0) ||
                    sending
                  }
                  onClick={handleSendMessage}
                >
                  <Send size={18} />
                </button>
              </div>
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