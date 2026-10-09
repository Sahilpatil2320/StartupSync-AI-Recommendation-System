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

import "./InvestorMessages.css";

const initialConversations = [
  {
    id: 1,
    name: "FinFlow",
    role: "Startup Founder",
    initials: "FF",
    online: true,
    unread: 2,
    lastMessage: "I have shared the updated pitch deck.",
    time: "10:42 AM",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Hello! Thank you for showing interest in FinFlow.",
        time: "10:20 AM"
      },
      {
        id: 2,
        sender: "me",
        text: "Hi! I went through your startup profile. The business model looks interesting.",
        time: "10:25 AM"
      },
      {
        id: 3,
        sender: "them",
        text: "Great. I would be happy to walk you through our current progress.",
        time: "10:31 AM"
      },
      {
        id: 4,
        sender: "them",
        text: "I have shared the updated pitch deck.",
        time: "10:42 AM"
      }
    ]
  },
  {
    id: 2,
    name: "HealthNest",
    role: "Startup Founder",
    initials: "HN",
    online: true,
    unread: 0,
    lastMessage: "Can we schedule a discussion this week?",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Thanks for connecting with HealthNest.",
        time: "Yesterday"
      },
      {
        id: 2,
        sender: "me",
        text: "You're welcome. I would like to understand your growth plans.",
        time: "Yesterday"
      },
      {
        id: 3,
        sender: "them",
        text: "Can we schedule a discussion this week?",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 3,
    name: "AgriNova",
    role: "Startup Founder",
    initials: "AN",
    online: false,
    unread: 1,
    lastMessage: "Our next milestone is market expansion.",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "me",
        text: "Could you share your expansion roadmap?",
        time: "Yesterday"
      },
      {
        id: 2,
        sender: "them",
        text: "Our next milestone is market expansion.",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 4,
    name: "Ananya Sharma",
    role: "Startup Mentor",
    initials: "AS",
    online: true,
    unread: 0,
    lastMessage: "I can introduce you to the founder.",
    time: "Monday",
    messages: [
      {
        id: 1,
        sender: "me",
        text: "I am looking at a few early-stage startups in FinTech.",
        time: "Monday"
      },
      {
        id: 2,
        sender: "them",
        text: "I can introduce you to the founder.",
        time: "Monday"
      }
    ]
  },
  {
    id: 5,
    name: "NextWave Ventures",
    role: "Co-Investor",
    initials: "NW",
    online: false,
    unread: 0,
    lastMessage: "Let's review the opportunity together.",
    time: "Sunday",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "We are also evaluating FinTech opportunities.",
        time: "Sunday"
      },
      {
        id: 2,
        sender: "me",
        text: "Let's compare notes on the startups we are reviewing.",
        time: "Sunday"
      },
      {
        id: 3,
        sender: "them",
        text: "Let's review the opportunity together.",
        time: "Sunday"
      }
    ]
  }
];

function InvestorMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );

  const [selectedId, setSelectedId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] =
    useState(false);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const filteredConversations = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return conversations;
    }

    return conversations.filter(
      (conversation) =>
        conversation.name
          .toLowerCase()
          .includes(search) ||
        conversation.role
          .toLowerCase()
          .includes(search) ||
        conversation.lastMessage
          .toLowerCase()
          .includes(search)
    );
  }, [conversations, searchTerm]);

  const openConversation = (conversationId) => {
    setSelectedId(conversationId);
    setMobileChatOpen(true);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text || !selectedConversation) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text,
      time: "Just now"
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: text,
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
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const showPlaceholder = (feature) => {
    alert(
      `${feature} will be connected to the backend/service later.`
    );
  };

  return (
    <div className="investor-messages-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <section className="investor-messages-header">
        <div>
          <span className="investor-messages-badge">
            Communication
          </span>

          <h2>Messages</h2>

          <p>
            Connect with startup founders, mentors and
            other members of the StartupSync ecosystem.
          </p>
        </div>
      </section>

      {/* =========================
          MESSAGING AREA
      ========================= */}

      <section
        className={`investor-chat-container ${
          mobileChatOpen
            ? "investor-mobile-chat-open"
            : ""
        }`}
      >

        {/* =========================
            CONVERSATION SIDEBAR
        ========================= */}

        <aside className="investor-conversation-panel">

          <div className="investor-conversation-header">
            <h3>Conversations</h3>

            <span>
              {
                conversations.filter(
                  (conversation) =>
                    conversation.unread > 0
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
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
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

            {filteredConversations.length > 0 ? (
              filteredConversations.map(
                (conversation) => (
                  <button
                    type="button"
                    key={conversation.id}
                    className={`investor-conversation-item ${
                      selectedId === conversation.id
                        ? "investor-conversation-selected"
                        : ""
                    }`}
                    onClick={() =>
                      openConversation(conversation.id)
                    }
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
                        <strong>
                          {conversation.name}
                        </strong>

                        <span>
                          {conversation.time}
                        </span>
                      </div>

                      <div className="investor-conversation-role">
                        {conversation.role}
                      </div>

                      <div className="investor-conversation-message-row">

                        <p>
                          {conversation.lastMessage}
                        </p>

                        {conversation.unread > 0 && (
                          <span className="investor-unread-count">
                            {conversation.unread}
                          </span>
                        )}

                      </div>

                    </div>

                  </button>
                )
              )
            ) : (
              <div className="investor-no-conversations">
                <Search size={24} />
                <p>No conversations found.</p>
              </div>
            )}

          </div>

        </aside>

        {/* =========================
            CHAT AREA
        ========================= */}

        {selectedConversation ? (
          <div className="investor-chat-panel">

            {/* Chat Header */}

            <div className="investor-chat-header">

              <button
                type="button"
                className="investor-mobile-back"
                onClick={() =>
                  setMobileChatOpen(false)
                }
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

                <strong>
                  {selectedConversation.name}
                </strong>

                <span>
                  {selectedConversation.online
                    ? "Online"
                    : selectedConversation.role}
                </span>

              </div>

              <div className="investor-chat-actions">

                <button
                  type="button"
                  onClick={() =>
                    showPlaceholder("Phone calling")
                  }
                  aria-label="Call"
                >
                  <Phone size={18} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showPlaceholder("Video calling")
                  }
                  aria-label="Video call"
                >
                  <Video size={18} />
                </button>

              </div>

            </div>

            {/* Messages */}

            <div className="investor-chat-messages">

              <div className="investor-chat-date">
                <span>Today</span>
              </div>

              {selectedConversation.messages.map(
                (message) => (
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
                )
              )}

            </div>

            {/* Message Composer */}

            <div className="investor-message-composer">

              <button
                type="button"
                onClick={() =>
                  showPlaceholder("File attachment")
                }
                aria-label="Attach file"
              >
                <Paperclip size={19} />
              </button>

              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                onClick={() =>
                  setMessageText(
                    (current) => `${current} 😊`
                  )
                }
                aria-label="Add emoji"
              >
                <Smile size={19} />
              </button>

              <button
                type="button"
                className="investor-send-button"
                onClick={sendMessage}
                disabled={!messageText.trim()}
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

            <p>
              Choose a conversation to start messaging.
            </p>
          </div>
        )}

      </section>
    </div>
  );
}

export default InvestorMessages;