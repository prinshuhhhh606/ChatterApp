import "./MessageBubble.css";

export default function MessageBubble({ msg }) {
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
          {msg.text}
        </div>
        <time className="message-bubble__time">{msg.time}</time>
      </div>
    </article>
  );
}
