import "./MessageBubble.css";

export default function MessageBubble({ msg, onDelete }) {
  const isMe = msg.sender === "me";

  return (
    <article
      className={`message-bubble-row ${
        isMe ? "message-bubble-row--me" : "message-bubble-row--other"
      }`}
    >
      <div className="message-bubble-wrap">
        <div
          className={`message-bubble ${
            isMe ? "message-bubble--me" : "message-bubble--other"
          }`}
        >
          <span className="message-text">{msg.text}</span>

          <button
            className="message-delete-btn"
            style={{
              opacity: 1,
              visibility: "visible",
            }}
          >
            🗑️
          </button>
        </div>

        <time className="message-bubble__time">{msg.time}</time>
      </div>
    </article>
  );
}
