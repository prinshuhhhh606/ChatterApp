import { useEffect, useRef } from "react";
import "./MessageList.css";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, showTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  return (
    <section className="message-list" aria-label="Messages">
      <div className="message-list__date-divider">Today</div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {showTyping && (
        <div className="message-list__typing">
          <span>typing</span>
          <div className="message-list__typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}
