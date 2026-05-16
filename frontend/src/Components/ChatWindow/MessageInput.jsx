import { useState } from "react";
import "../MessageInput.css";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    onTyping?.(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer className="message-input">
      <form className="message-input__form" onSubmit={handleSubmit}>
        <nav className="message-input__tools" aria-label="Attachments">
          <button type="button" className="message-input__tool-btn" aria-label="Attach">
            📎
          </button>
          <button type="button" className="message-input__tool-btn" aria-label="Emoji">
            😊
          </button>
        </nav>
        <label className="message-input__field-wrap">
          <input
            type="text"
            className="message-input__field"
            placeholder="Type a message..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </label>
        <button type="submit" className="message-input__send" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </footer>
  );
}
