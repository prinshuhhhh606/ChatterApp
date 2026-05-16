import { formatMessageTime } from "../../utils/formatTime";
import Avatar from "../Avatar/Avatar";
import "../MessageBubble.css";

export default function MessageBubble({ message, isMe, isGroup }) {
  return (
    <article
      className={`message-bubble-row ${
        isMe ? "message-bubble-row--me" : "message-bubble-row--other"
      }`}
    >
      {isGroup && !isMe && (
        <Avatar user={message.sender} size="sm" className="message-bubble__avatar" />
      )}
      <section className="message-bubble-wrap">
        {isGroup && !isMe && (
          <span className="message-bubble__sender">{message.sender.username}</span>
        )}
        <p
          className={`message-bubble ${
            isMe ? "message-bubble--me" : "message-bubble--other"
          }`}
        >
          {message.text}
        </p>
        <time className="message-bubble__time">
          {formatMessageTime(message.createdAt)}
        </time>
      </section>
    </article>
  );
}
