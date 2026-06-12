import { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import "../MessageInput.css";

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

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

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
    onTyping?.(true);
    inputRef.current?.focus();
  };

  return (
    <footer className="message-input">
      <form className="message-input__form" onSubmit={handleSubmit}>
        <nav className="message-input__tools" aria-label="Attachments">
          <button
            type="button"
            className="message-input__tool-btn"
            aria-label="Attach"
          >
            📎
          </button>
          <button
            type="button"
            className="message-input__tool-btn"
            aria-label="Emoji"
            onClick={() => setShowEmoji((s) => !s)}
          >
            😊
          </button>
        </nav>

        <div className="message-input__field-wrap">
          {showEmoji && (
            <div
              style={{
                position: "fixed",
                left: "20px",
                bottom: "100px",
                zIndex: 999999,
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          <label>
            <input
              ref={inputRef}
              type="text"
              className="message-input__field"
              placeholder="Type a message..."
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </label>
        </div>

        <button
          type="submit"
          className="message-input__send"
          disabled={!text.trim()}
        >
          Send
        </button>
      </form>
    </footer>
  );
}
