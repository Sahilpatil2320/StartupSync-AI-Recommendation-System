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
import { useMemo, useState } from "react";

import "./StudentMessages.css";

const initialConversations = [
  {
    id: 1,
    name: "Rahul Patil",
    role: "Recruiter · TechNova Solutions",
    avatar: "RP",
    lastMessage:
      "We would like to schedule your technical interview.",
    time: "10:42 AM",
    unread: 2,
    online: true,
    messages: [
      {
        id: 1,
        sender: "them",
        text:
          "Hello! We reviewed your application for the Full Stack Developer Internship.",
        time: "10:31 AM"
      },
      {
        id: 2,
        sender: "me",
        text:
          "Hello Rahul, thank you for the update. I am interested in the opportunity.",
        time: "10:35 AM"
      },
      {
        id: 3,
        sender: "them",
        text:
          "Great! We would like to schedule your technical interview.",
        time: "10:42 AM"
      }
    ]
  },
  {
    id: 2,
    name: "Ananya Kulkarni",
    role: "Talent Partner · EduBridge",
    avatar: "AK",
    lastMessage:
      "Your profile looks interesting. Can we discuss the role?",
    time: "9:15 AM",
    unread: 1,
    online: true,
    messages: [
      {
        id: 1,
        sender: "them",
        text:
          "Hi! I came across your StartupSync profile.",
        time: "9:04 AM"
      },
      {
        id: 2,
        sender: "them",
        text:
          "Your profile looks interesting. Can we discuss the role?",
        time: "9:15 AM"
      }
    ]
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "HR · FinFlow Technologies",
    avatar: "PS",
    lastMessage:
      "Please let us know if you are available tomorrow.",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: "me",
        text:
          "Could you please share the interview details?",
        time: "Yesterday"
      },
      {
        id: 2,
        sender: "them",
        text:
          "Please let us know if you are available tomorrow.",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 4,
    name: "Vikram Deshmukh",
    role: "Founder · GreenGrid Systems",
    avatar: "VD",
    lastMessage:
      "Thanks for applying. We will review your profile.",
    time: "23 Sep",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: "them",
        text:
          "Thanks for applying. We will review your profile.",
        time: "23 Sep"
      }
    ]
  },
  {
    id: 5,
    name: "Meera Joshi",
    role: "Recruiter · HealthNest Innovations",
    avatar: "MJ",
    lastMessage:
      "Could you share your latest portfolio?",
    time: "21 Sep",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: "them",
        text:
          "Could you share your latest portfolio?",
        time: "21 Sep"
      }
    ]
  }
];

function StudentMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );

  const [selectedConversationId, setSelectedConversationId] =
    useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");

  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.id === selectedConversationId
  );

  const filteredConversations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return conversations;
    }

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(search) ||
        conversation.role.toLowerCase().includes(search) ||
        conversation.lastMessage
          .toLowerCase()
          .includes(search)
    );
  }, [conversations, searchTerm]);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              unread: 0
            }
          : conversation
      )
    );
  };

  const handleSendMessage = () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || !selectedConversation) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: trimmedMessage,
              time: "Just now",
              messages: [
                ...conversation.messages,
                newMessage
              ]
            }
          : conversation
      )
    );

    setMessageText("");
    setShowEmojiPanel(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = () => {
    window.alert(
      "Attachment upload will be connected with the backend later."
    );
  };

  const handleCallAction = (type) => {
    window.alert(
      `${type} calling will be connected with the backend later.`
    );
  };

  const addEmoji = (emoji) => {
    setMessageText((current) => `${current}${emoji}`);
    setShowEmojiPanel(false);
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

      <div className="student-messages-shell">
        {/* Conversation Sidebar */}

        <aside className="student-conversations-panel">
          <div className="student-conversations-header">
            <div>
              <h3>Conversations</h3>
              <span>
                {conversations.length} active conversations
              </span>
            </div>
          </div>

          <div className="student-conversation-search">
            <Search size={16} />

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
            {filteredConversations.length > 0 ? (
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

                    {conversation.online && (
                      <span className="student-online-dot" />
                    )}
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
                <Search size={21} />
                <h4>No conversations found</h4>
                <p>
                  Try searching with a different name or
                  keyword.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}

        {selectedConversation ? (
          <div className="student-chat-panel">
            <header className="student-chat-header">
              <div className="student-chat-person">
                <div className="student-chat-avatar">
                  {selectedConversation.avatar}

                  {selectedConversation.online && (
                    <span className="student-online-dot" />
                  )}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>

                  <p>
                    {selectedConversation.online
                      ? "Online"
                      : selectedConversation.role}
                  </p>
                </div>
              </div>

              <div className="student-chat-header-actions">
                <button
                  type="button"
                  aria-label="Start audio call"
                  title="Audio call"
                  onClick={() =>
                    handleCallAction("Audio")
                  }
                >
                  <Phone size={17} />
                </button>

                <button
                  type="button"
                  aria-label="Start video call"
                  title="Video call"
                  onClick={() =>
                    handleCallAction("Video")
                  }
                >
                  <Video size={18} />
                </button>
              </div>
            </header>

            <div className="student-chat-messages">
              <div className="student-chat-date">
                <span>Today</span>
              </div>

              {selectedConversation.messages.map(
                (message) => (
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
                )
              )}
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
                    "🙌"
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
                onClick={() =>
                  setShowEmojiPanel((current) => !current)
                }
              >
                <Smile size={18} />
              </button>

              <textarea
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
              />

              <button
                type="button"
                className="student-send-button"
                aria-label="Send message"
                title="Send message"
                disabled={!messageText.trim()}
                onClick={handleSendMessage}
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        ) : (
          <div className="student-chat-empty">
            <div className="student-chat-empty-icon">
              <Send size={22} />
            </div>

            <h3>Select a conversation</h3>

            <p>
              Choose a conversation from the list to start
              messaging.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default StudentMessages;