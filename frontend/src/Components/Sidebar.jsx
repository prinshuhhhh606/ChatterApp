import "./Sidebar.css";
import ChatCard from "./ChatCard";
import { DEFAULT_AVATAR } from "../constants";

export default function Sidebar({
  chats,
  activeChatId,
  searchQuery,
  onSearchChange,
  onSelectChat,
  connected = false,
}) {
  const filtered = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className="sidebar">
      <header className="sidebar-top">
        <div className="sidebar-header-row">
          <h1 className="sidebar-logo">ChatSphere</h1>
          <span
            className={`sidebar-badge ${connected ? "sidebar-badge--live" : ""}`}
            title={connected ? "Connected to server" : "Offline"}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </div>

        <div className="sidebar-search-wrap">
          <span className="sidebar-search-icon" aria-hidden="true">
            🔍
          </span>

          <input
            type="search"
            placeholder="Search chats..."
            className="sidebar-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </header>

      <p className="sidebar-section-label">Recent</p>

      <div className="sidebar-chat-list">
        {filtered.length === 0 ? (
          <p className="sidebar-empty">No chats found</p>
        ) : (
          filtered.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={onSelectChat}
            />
          ))
        )}
      </div>
    </aside>
  );
}
