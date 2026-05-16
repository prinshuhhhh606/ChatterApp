import "./ChatHeader.css";

export default function ChatHeader({ chat }) {
  if (!chat) return null;

  return (
    <header className="chat-header">
      <div className="chat-header__user">
        <div className="chat-header__avatar">{chat.avatar}</div>
        <div>
          <h2 className="chat-header__name">{chat.name}</h2>
          <p
            className={`chat-header__status ${
              chat.online ? "" : "chat-header__status--offline"
            }`}
          >
            <span className="chat-header__status-dot" />
            {chat.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="chat-header__actions">
        <button type="button" className="chat-header__btn">
          <span className="chat-header__btn-icon">📞</span>
          <span>Call</span>
        </button>
        <button type="button" className="chat-header__btn">
          <span className="chat-header__btn-icon">🎥</span>
          <span>Video</span>
        </button>
        <button type="button" className="chat-header__btn" aria-label="More options">
          <span className="chat-header__btn-icon">⋮</span>
        </button>
      </div>
    </header>
  );
}
