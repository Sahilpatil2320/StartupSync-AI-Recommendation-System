import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import "./FounderMessages.css";

const initialConversations = [
  {
    id: 1,
    name: "Arjun Capital",
    role: "Investor",
    initials: "AC",
    lastMessage: "Please share the updated pitch deck.",
    time: "10:42 AM",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "Ananya Sharma",
    role: "Mentor",
    initials: "AS",
    lastMessage: "Let's discuss your product strategy.",
    time: "9:35 AM",
    unread: 0,
    online: true
  },
  {
    id: 3,
    name: "Aarav Patil",
    role: "Co-Founder",
    initials: "AP",
    lastMessage: "The new dashboard design is ready.",
    time: "Yesterday",
    unread: 1,
    online: false
  },
  {
    id: 4,
    name: "NextWave Ventures",
    role: "Investor",
    initials: "NV",
    lastMessage: "We would like to know more about your team.",
    time: "Yesterday",
    unread: 0,
    online: false
  },
  {
    id: 5,
    name: "Sneha Kulkarni",
    role: "Designer",
    initials: "SK",
    lastMessage: "I have uploaded the latest prototype.",
    time: "Mon",
    unread: 0,
    online: true
  }
];

const initialMessages = {
  1: [
    {
      id: 1,
      sender: "other",
      text: "Hello! We reviewed your startup profile.",
      time: "10:30 AM"
    },
    {
      id: 2,
      sender: "me",
      text: "Thank you. I would be happy to share more details.",
      time: "10:34 AM"
    },
    {
      id: 3,
      sender: "other",
      text: "Please share the updated pitch deck.",
      time: "10:42 AM"
    }
  ],
  2: [
    {
      id: 4,
      sender: "other",
      text: "How is the product validation going?",
      time: "9:20 AM"
    },
    {
      id: 5,
      sender: "me",
      text: "We have completed the first round of user interviews.",
      time: "9:28 AM"
    },
    {
      id: 6,
      sender: "other",
      text: "Let's discuss your product strategy.",
      time: "9:35 AM"
    }
  ],
  3: [
    {
      id: 7,
      sender: "other",
      text: "The new dashboard design is ready.",
      time: "Yesterday"
    }
  ],
  4: [
    {
      id: 8,
      sender: "other",
      text: "We would like to know more about your team.",
      time: "Yesterday"
    }
  ],
  5: [
    {
      id: 9,
      sender: "other",
      text: "I have uploaded the latest prototype.",
      time: "Mon"
    }
  ]
};

function FounderMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );

  const [messages, setMessages] = useState(initialMessages);

  const [selectedConversationId, setSelectedConversationId] =
    useState(1);

  const [searchTerm, setSearchTerm] = useState("");

  const [messageText, setMessageText] = useState("");

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.id === selectedConversationId
  );

  const currentMessages =
    messages[selectedConversationId] || [];

  const filteredConversations = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    if (!value) {
      return conversations;
    }

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(value) ||
        conversation.role.toLowerCase().includes(value) ||
        conversation.lastMessage
          .toLowerCase()
          .includes(value)
    );
  }, [conversations, searchTerm]);

  const handleConversationSelect = (id) => {
    setSelectedConversationId(id);
    setMobileChatOpen(true);

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const text = messageText.trim();

    if (!text) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages((previous) => ({
      ...previous,
      [selectedConversationId]: [
        ...(previous[selectedConversationId] || []),
        newMessage
      ]
    }));

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              lastMessage: text,
              time: "Just now"
            }
          : conversation
      )
    );

    setMessageText("");
  };

  const handleBackToConversations = () => {
    setMobileChatOpen(false);
  };

  return (
    <div className="founder-messages-page">
      {/* Page Header */}
      <div className="founder-messages-page-header">
        <div>
          <span className="founder-messages-badge">
            Communication
          </span>

          <h2>Messages</h2>

          <p>
            Connect and communicate with investors, mentors
            and your startup team.
          </p>
        </div>
      </div>

      {/* Messaging Workspace */}
      <section className="founder-messages-workspace">
        {/* Conversation Sidebar */}
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
              <span>
                {conversations.length} active chats
              </span>
            </div>

            <button
              type="button"
              aria-label="More conversation options"
            >
              <MoreVertical size={18} />
            </button>
          </div>

          <div className="founder-conversation-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="founder-conversation-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`founder-conversation-item ${
                    selectedConversationId ===
                    conversation.id
                      ? "founder-conversation-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleConversationSelect(
                      conversation.id
                    )
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
                      <strong>
                        {conversation.name}
                      </strong>

                      <span>
                        {conversation.time}
                      </span>
                    </div>

                    <div className="founder-conversation-message-row">
                      <p>
                        {conversation.lastMessage}
                      </p>

                      {conversation.unread > 0 && (
                        <span className="founder-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>

                    <small>
                      {conversation.role}
                    </small>
                  </div>
                </button>
              ))
            ) : (
              <div className="founder-message-empty">
                <Search size={25} />

                <p>No conversations found.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Area */}
        {selectedConversation ? (
          <section
            className={`founder-chat-panel ${
              mobileChatOpen
                ? "founder-chat-panel-mobile-open"
                : ""
            }`}
          >
            {/* Chat Header */}
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

                  {selectedConversation.online && (
                    <span className="founder-online-dot" />
                  )}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>

                  <span>
                    <i
                      className={
                        selectedConversation.online
                          ? "online"
                          : ""
                      }
                    />
                    {selectedConversation.online
                      ? "Online"
                      : selectedConversation.role}
                  </span>
                </div>
              </div>

              <div className="founder-chat-actions">
                <button
                  type="button"
                  aria-label="Start voice call"
                  onClick={() =>
                    alert("Voice calling will be connected later.")
                  }
                >
                  <Phone size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Start video call"
                  onClick={() =>
                    alert("Video calling will be connected later.")
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

            {/* Messages */}
            <div className="founder-chat-messages">
              <div className="founder-chat-date">
                <span>Today</span>
              </div>

              {currentMessages.map((message) => (
                <div
                  className={`founder-message-row ${
                    message.sender === "me"
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
              ))}
            </div>

            {/* Message Composer */}
            <form
              className="founder-message-composer"
              onSubmit={handleSendMessage}
            >
              <button
                type="button"
                aria-label="Attach file"
                onClick={() =>
                  alert("File attachment will be connected later.")
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
              />

              <button
                type="button"
                aria-label="Add emoji"
                onClick={() =>
                  setMessageText((previous) =>
                    `${previous} 😊`
                  )
                }
              >
                <Smile size={19} />
              </button>

              <button
                type="submit"
                className="founder-send-button"
                aria-label="Send message"
                disabled={!messageText.trim()}
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
              <p>
                Choose a conversation to start messaging.
              </p>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

export default FounderMessages;