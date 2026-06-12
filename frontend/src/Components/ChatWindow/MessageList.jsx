import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "../MessageList.css";

export default function MessageList({
  messages,
  currentUserId,
  isGroup,
  onDeleteMessage,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="message-list" aria-label="Messages">
      {messages.length > 0 && (
        <p className="message-list__date-divider">Today</p>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isMe={msg.sender.id === currentUserId}
          isGroup={isGroup}
          onDelete={() => onDeleteMessage?.(msg.id)}
        />
      ))}
      <span ref={bottomRef} aria-hidden="true" />
    </section>
  );
}
