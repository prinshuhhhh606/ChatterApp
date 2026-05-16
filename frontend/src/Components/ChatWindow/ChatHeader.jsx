import { useSocket } from "../../context/SocketContext";
import { formatLastSeen } from "../../utils/formatTime";
import Avatar from "../Avatar/Avatar";
import "../ChatHeader.css";

export default function ChatHeader({ conversation, typingUser, onBack }) {
  const { isOnline } = useSocket();

  if (conversation.isGroup) {
    const onlineCount = conversation.participants?.filter(
      (p) => isOnline(p.id) || p.isOnline
    ).length;

    return (
      <header className="chat-header">
        {onBack && (
          <button type="button" className="chat-header__back" onClick={onBack}>
            ←
          </button>
        )}
        <section className="chat-header__user">
          <Avatar
            isGroup
            groupName={conversation.groupName}
            user={{ groupPhotoUrl: conversation.groupPhotoUrl }}
            size="sm"
          />
          <section>
            <h2 className="chat-header__name">{conversation.groupName}</h2>
            <p className="chat-header__status chat-header__status--offline">
              {typingUser
                ? `${typingUser} is typing...`
                : `${conversation.memberCount} members · ${onlineCount || 0} online`}
            </p>
          </section>
        </section>
      </header>
    );
  }

  const other = conversation.otherUser;
  const online = isOnline(other.id) || other.isOnline;

  return (
    <header className="chat-header">
      {onBack && (
        <button type="button" className="chat-header__back" onClick={onBack}>
          ←
        </button>
      )}
      <section className="chat-header__user">
        <Avatar user={other} size="sm" showStatus online={online} />
        <section>
          <h2 className="chat-header__name">{other.username}</h2>
          <p
            className={`chat-header__status ${
              online && !typingUser ? "" : "chat-header__status--offline"
            }`}
          >
            <span className="chat-header__status-dot" />
            {typingUser
              ? `${typingUser} is typing...`
              : formatLastSeen(other.lastSeen, online)}
          </p>
        </section>
      </section>
      <nav className="chat-header__actions" aria-label="Chat actions">
        <button type="button" className="chat-header__btn">
          <span className="chat-header__btn-icon">📞</span>
          <span>Call</span>
        </button>
        <button type="button" className="chat-header__btn">
          <span className="chat-header__btn-icon">🎥</span>
          <span>Video</span>
        </button>
      </nav>
    </header>
  );
}
