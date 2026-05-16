import { useState } from "react";
import "./MessageInput.css";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
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
        <div className="message-input__tools">
          <button type="button" className="message-input__tool-btn" aria-label="Attach file">
            📎
          </button>
          <button type="button" className="message-input__tool-btn" aria-label="Add emoji">
            😊
          </button>
        </div>

        <div className="message-input__field-wrap">
          <input
            type="text"
            className="message-input__field"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className="message-input__send"
          disabled={disabled || !text.trim()}
        >
          Send
        </button>
      </form>
    </footer>
  );
}
