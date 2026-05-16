import { useSocket } from "../context/SocketContext";
import { formatMessageTime } from "../utils/formatTime";
import Avatar from "./Avatar/Avatar";
import "./ChatCard.css";

export default function ChatCard({ conversation, isActive, onSelect }) {
  const { isOnline } = useSocket();

  if (conversation.isGroup) {
    return (
      <button
        type="button"
        className={`chat-card ${isActive ? "chat-card--active" : ""}`}
        onClick={onSelect}
      >
        <Avatar
          isGroup
          groupName={conversation.groupName}
          user={{ groupPhotoUrl: conversation.groupPhotoUrl }}
          size="md"
        />
        <span className="chat-card__body">
          <span className="chat-card__row">
            <span className="chat-card__name">👥 {conversation.groupName}</span>
            <span className="chat-card__time">
              {conversation.lastMessageAt
                ? formatMessageTime(conversation.lastMessageAt)
                : ""}
            </span>
          </span>
          <p className="chat-card__preview">
            {conversation.memberCount} members ·{" "}
            {conversation.lastMessage || "No messages"}
          </p>
        </span>
      </button>
    );
  }

  const other = conversation.otherUser;
  const online = isOnline(other.id) || other.isOnline;

  return (
    <button
      type="button"
      className={`chat-card ${isActive ? "chat-card--active" : ""}`}
      onClick={onSelect}
    >
      <Avatar user={other} size="md" showStatus online={online} />
      <span className="chat-card__body">
        <span className="chat-card__row">
          <span className="chat-card__name">{other.username}</span>
          <span className="chat-card__time">
            {conversation.lastMessageAt
              ? formatMessageTime(conversation.lastMessageAt)
              : ""}
          </span>
        </span>
        <p className="chat-card__preview">
          {conversation.lastMessage || "No messages yet"}
        </p>
      </span>
    </button>
  );
}
