import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setText("");
  };

  return (
    <footer className="message-input">
      <form className="message-input__form" onSubmit={handleSubmit}>
        <button
          type="button"
          className="message-input__tool-btn"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          😊
        </button>

        <div className="message-input__field-wrap">
          <p style={{ color: "red" }}>{showEmoji ? "OPEN" : "CLOSED"}</p>

          {showEmoji && (
            <div
              style={{
                position: "fixed",
                left: "20px",
                bottom: "100px",
                zIndex: 999999,
              }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setText((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}

          <input
            type="text"
            className="message-input__field"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
          />
        </div>

        <button type="submit" className="message-input__send">
          Send
        </button>
      </form>
    </footer>
  );
}
