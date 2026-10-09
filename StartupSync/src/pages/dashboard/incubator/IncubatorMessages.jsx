import { useState } from "react";
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

import "./IncubatorMessages.css";

const initialConversations = [
  {
    id: 1,
    name: "Ananya Kulkarni",
    role: "Startup Founder",
    lastMessage: "Thank you for reviewing our application.",
    time: "10:42 AM",
    unread: 2,
    online: true,
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Hello, I submitted our startup application.",
        time: "10:20 AM"
      },
      {
        id: 2,
        sender: "me",
        text: "Thanks, I will review the application.",
        time: "10:25 AM"
      },
      {
        id: 3,
        sender: "them",
        text: "Thank you for reviewing our application.",
        time: "10:42 AM"
      }
    ]
  },
  {
    id: 2,
    name: "Rahul Deshmukh",
    role: "Mentor",
    lastMessage: "I can join the session next week.",
    time: "9:18 AM",
    unread: 1,
    online: true,
    messages: [
      {
        id: 1,
        sender: "them",
        text: "I can join the session next week.",
        time: "9:18 AM"
      }
    ]
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Startup Founder",
    lastMessage: "Can we discuss the accelerator program?",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Can we discuss the accelerator program?",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 4,
    name: "Vikram Joshi",
    role: "Investor",
    lastMessage: "Please send the latest startup list.",
    time: "Yesterday",
    unread: 3,
    online: false,
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Please send the latest startup list.",
        time: "Yesterday"
      }
    ]
  },
  {
    id: 5,
    name: "Meera Joshi",
    role: "Startup Founder",
    lastMessage: "Our cohort documents are ready.",
    time: "Mon",
    unread: 0,
    online: true,
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Our cohort documents are ready.",
        time: "Mon"
      }
    ]
  }
];

function IncubatorMessages() {
  const [conversations, setConversations] = useState(
    initialConversations
  );

  const [selectedId, setSelectedId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conversation.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setShowEmojiPanel(false);

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !selectedConversation) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: trimmedMessage,
      time: "Just now"
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedId
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

    setMessage("");
  };

  const addEmoji = (emoji) => {
    setMessage((current) => `${current}${emoji}`);
  };

  const showActionMessage = (action) => {
    window.alert(
      `${action} will be connected to the backend communication service later.`
    );
  };

  return (
    <section className="incubator-messages-page">
      <div className="incubator-messages-header">
        <div>
          <span className="incubator-messages-eyebrow">
            Incubator Workspace
          </span>

          <h1>Messages</h1>

          <p>
            Communicate with founders, mentors, investors and
            ecosystem partners.
          </p>
        </div>
      </div>

      <div className="incubator-messages-container">
        {/* Conversation sidebar */}

        <aside className="incubator-conversations">
          <div className="incubator-conversations-header">
            <h2>Conversations</h2>

            <span>
              {conversations.reduce(
                (total, conversation) =>
                  total + conversation.unread,
                0
              )}{" "}
              unread
            </span>
          </div>

          <div className="incubator-message-search">
            <Search size={15} />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="incubator-conversation-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`incubator-conversation ${
                    selectedId === conversation.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectConversation(
                      conversation.id
                    )
                  }
                >
                  <div className="incubator-avatar">
                    {conversation.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="incubator-conversation-info">
                    <div className="incubator-conversation-top">
                      <strong>
                        {conversation.name}
                      </strong>

                      <span>
                        {conversation.time}
                      </span>
                    </div>

                    <div className="incubator-conversation-bottom">
                      <span>
                        {conversation.lastMessage}
                      </span>

                      {conversation.unread > 0 && (
                        <b>{conversation.unread}</b>
                      )}
                    </div>

                    <small>
                      {conversation.role}
                    </small>
                  </div>

                  {conversation.online && (
                    <i className="incubator-online-dot" />
                  )}
                </button>
              ))
            ) : (
              <div className="incubator-empty-conversations">
                No conversations found.
              </div>
            )}
          </div>
        </aside>

        {/* Chat */}

        {selectedConversation && (
          <div className="incubator-chat-panel">
            <div className="incubator-chat-header">
              <div className="incubator-chat-person">
                <div className="incubator-avatar incubator-avatar-large">
                  {selectedConversation.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <strong>
                    {selectedConversation.name}
                  </strong>

                  <span>
                    {selectedConversation.online
                      ? "Online"
                      : selectedConversation.role}
                  </span>
                </div>
              </div>

              <div className="incubator-chat-actions">
                <button
                  type="button"
                  onClick={() =>
                    showActionMessage("Voice call")
                  }
                  aria-label="Voice call"
                >
                  <Phone size={17} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showActionMessage("Video call")
                  }
                  aria-label="Video call"
                >
                  <Video size={18} />
                </button>
              </div>
            </div>

            <div className="incubator-chat-messages">
              <div className="incubator-chat-date">
                Today
              </div>

              {selectedConversation.messages.map(
                (chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`incubator-message-row ${
                      chatMessage.sender === "me"
                        ? "mine"
                        : ""
                    }`}
                  >
                    <div className="incubator-message-bubble">
                      <p>{chatMessage.text}</p>

                      <span>
                        {chatMessage.time}

                        {chatMessage.sender === "me" && (
                          <CheckCheck size={12} />
                        )}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="incubator-chat-composer">
              {showEmojiPanel && (
                <div className="incubator-emoji-panel">
                  {[
                    "😊",
                    "👍",
                    "🎉",
                    "🚀",
                    "💡",
                    "👏",
                    "❤️",
                    "🙌"
                  ].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="incubator-composer-icon"
                onClick={() =>
                  setShowEmojiPanel(
                    (current) => !current
                  )
                }
                aria-label="Emoji"
              >
                <Smile size={18} />
              </button>

              <button
                type="button"
                className="incubator-composer-icon"
                onClick={() =>
                  showActionMessage("File attachment")
                }
                aria-label="Attachment"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder="Write a message..."
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />

              <button
                type="button"
                className="incubator-send-button"
                onClick={handleSendMessage}
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default IncubatorMessages;