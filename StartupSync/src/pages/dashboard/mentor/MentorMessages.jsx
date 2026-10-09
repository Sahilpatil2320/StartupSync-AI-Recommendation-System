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

import "./MentorMessages.css";

const initialConversations = [
  {
    id: 1,
    name: "FinFlow",
    person: "Rahul Mehta",
    type: "Startup Founder",
    online: true,
    unread: 2,
    avatar: "F",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Hello! Thank you for accepting our mentorship request.",
        time: "10:12 AM"
      },
      {
        id: 2,
        sender: "me",
        text: "You're welcome. I'm looking forward to understanding FinFlow better.",
        time: "10:15 AM"
      },
      {
        id: 3,
        sender: "them",
        text: "We would especially like guidance around our business strategy.",
        time: "10:17 AM"
      },
      {
        id: 4,
        sender: "them",
        text: "Could we discuss our current priorities this week?",
        time: "10:18 AM"
      }
    ]
  },
  {
    id: 2,
    name: "HealthNest",
    person: "Ananya Sharma",
    type: "Startup Founder",
    online: true,
    unread: 0,
    avatar: "H",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "We have updated our product roadmap based on your suggestions.",
        time: "Yesterday"
      },
      {
        id: 2,
        sender: "me",
        text: "Great. Please share the updated priorities before our next session.",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 3,
    name: "AgriNova",
    person: "Vikram Patil",
    type: "Startup Founder",
    online: false,
    unread: 1,
    avatar: "A",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "We have started preparing our investor presentation.",
        time: "Mon"
      },
      {
        id: 2,
        sender: "me",
        text: "Excellent. Make sure the problem, traction and business model are clear.",
        time: "Mon"
      }
    ]
  },
  {
    id: 4,
    name: "EduBridge",
    person: "Priya Deshmukh",
    type: "Startup Founder",
    online: false,
    unread: 0,
    avatar: "E",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Thank you for all the guidance during our mentorship.",
        time: "Sep 15"
      },
      {
        id: 2,
        sender: "me",
        text: "It was great working with your team. Best wishes for the next stage.",
        time: "Sep 15"
      }
    ]
  },
  {
    id: 5,
    name: "StartupSync Team",
    person: "Platform Support",
    type: "System",
    online: true,
    unread: 0,
    avatar: "S",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Welcome to the Mentor Workspace.",
        time: "Sep 10"
      },
      {
        id: 2,
        sender: "me",
        text: "Thank you.",
        time: "Sep 10"
      }
    ]
  }
];

function MentorMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );

  const [selectedId, setSelectedId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedId
    ) || conversations[0];

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm
      .toLowerCase()
      .trim();

    if (!normalizedSearch) {
      return conversations;
    }

    return conversations.filter(
      (conversation) =>
        conversation.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        conversation.person
          .toLowerCase()
          .includes(normalizedSearch)
    );
  }, [conversations, searchTerm]);

  const openConversation = (id) => {
    setSelectedId(id);

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

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !selectedConversation) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      })
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                newMessage
              ]
            }
          : conversation
      )
    );

    setMessage("");
  };

  const handleAttachment = () => {
    alert(
      "File attachment will be connected to backend storage later."
    );
  };

  const handleCall = () => {
    alert(
      "Voice calling will be connected to the communication service later."
    );
  };

  const handleVideo = () => {
    alert(
      "Video calling will be connected to the communication service later."
    );
  };

  const addEmoji = () => {
    setMessage((current) => `${current} 😊`.trimStart());
  };

  return (
    <div className="mentor-messages-page">
      {/* Header */}

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

      {/* Messaging workspace */}

      <section className="mentor-messages-workspace">
        {/* Conversation sidebar */}

        <aside className="mentor-conversation-sidebar">
          <div className="mentor-conversation-search">
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

          <div className="mentor-conversation-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`mentor-conversation-item ${
                    selectedConversation?.id ===
                    conversation.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    openConversation(conversation.id)
                  }
                >
                  <div className="mentor-conversation-avatar">
                    {conversation.avatar}

                    {conversation.online && (
                      <span className="mentor-online-dot" />
                    )}
                  </div>

                  <div className="mentor-conversation-info">
                    <div className="mentor-conversation-top">
                      <strong>
                        {conversation.name}
                      </strong>

                      {conversation.unread > 0 && (
                        <span className="mentor-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>

                    <span>
                      {conversation.person}
                    </span>

                    <p>
                      {
                        conversation.messages[
                          conversation.messages.length - 1
                        ]?.text
                      }
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="mentor-no-conversations">
                No conversations found.
              </div>
            )}
          </div>
        </aside>

        {/* Chat area */}

        {selectedConversation && (
          <div className="mentor-chat-area">
            <header className="mentor-chat-header">
              <div className="mentor-chat-user">
                <div className="mentor-chat-avatar">
                  {selectedConversation.avatar}

                  {selectedConversation.online && (
                    <span className="mentor-chat-online" />
                  )}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>

                  <p>
                    {selectedConversation.person}
                    {" · "}
                    {selectedConversation.online
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>

              <div className="mentor-chat-actions">
                <button
                  type="button"
                  onClick={handleCall}
                  aria-label="Start voice call"
                >
                  <Phone size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleVideo}
                  aria-label="Start video call"
                >
                  <Video size={19} />
                </button>
              </div>
            </header>

            <div className="mentor-chat-messages">
              <div className="mentor-chat-date">
                <span>Today</span>
              </div>

              {selectedConversation.messages.map(
                (chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`mentor-chat-message ${
                      chatMessage.sender === "me"
                        ? "sent"
                        : "received"
                    }`}
                  >
                    <div className="mentor-message-bubble">
                      <p>{chatMessage.text}</p>

                      <div className="mentor-message-meta">
                        <span>{chatMessage.time}</span>

                        {chatMessage.sender === "me" && (
                          <CheckCheck size={14} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mentor-chat-composer">
              <div className="mentor-composer-actions">
                <button
                  type="button"
                  onClick={handleAttachment}
                  aria-label="Attach file"
                >
                  <Paperclip size={19} />
                </button>

                <button
                  type="button"
                  onClick={addEmoji}
                  aria-label="Add emoji"
                >
                  <Smile size={19} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Write a message..."
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                type="button"
                className="mentor-send-message"
                onClick={sendMessage}
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile close placeholder */}

        <button
          type="button"
          className="mentor-mobile-close"
          onClick={() => {}}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </section>
    </div>
  );
}

export default MentorMessages;