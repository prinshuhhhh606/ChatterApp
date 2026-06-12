import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { DEFAULT_AVATAR } from "../../constants";
import ChatCard from "../ChatCard";
import NewChatModal from "../NewChatModal/NewChatModal";
import GroupModal from "../GroupModal/GroupModal";
import ProfileModal from "../ProfileModal/ProfileModal";
import Avatar from "../Avatar/Avatar";
import "./Sidebar.css";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onConversationCreated,
  searchQuery,
  onSearchChange,
}) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const filtered = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (c.isGroup) return c.groupName?.toLowerCase().includes(q);
    return c.otherUser?.username?.toLowerCase().includes(q);
  });

  return (
    <aside className="sidebar">
      <header className="sidebar-top">
        <section className="sidebar-header-row">
          <h1 className="sidebar-logo">Chatter</h1>
          <span
            className={`sidebar-badge ${connected ? "sidebar-badge--live" : ""}`}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </section>

        <section className="sidebar-profile">
          <button
            type="button"
            className="sidebar-profile__avatar-btn"
            onClick={() => setShowProfile(true)}
            title="Change profile photo"
          >
            <Avatar
              user={{
                ...user,
                profilePhotoUrl: user?.profilePhotoUrl || DEFAULT_AVATAR,
              }}
              size="sm"
              round
            />
          </button>
          <span className="sidebar-profile__name">{user.username}</span>
          <nav className="sidebar-actions" aria-label="Sidebar actions">
            <button
              type="button"
              className="sidebar-icon-btn"
              title="New chat"
              onClick={() => setShowNewChat(true)}
            >
              ✏️
            </button>
            <button
              type="button"
              className="sidebar-icon-btn"
              title="New group"
              onClick={() => setShowGroup(true)}
            >
              👥
            </button>
            <button
              type="button"
              className="sidebar-icon-btn"
              title="Logout"
              onClick={logout}
            >
              🚪
            </button>
          </nav>
        </section>

        <label className="sidebar-search-wrap">
          <span className="sidebar-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            className="sidebar-search"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </header>

      <p className="sidebar-section-label">Messages</p>

      <nav className="sidebar-chat-list" aria-label="Conversations">
        {filtered.length === 0 ? (
          <p className="sidebar-empty">
            No chats yet.
            <br />
            ✏️ private · 👥 group
          </p>
        ) : (
          filtered.map((conv) => (
            <ChatCard
              key={conv.id}
              conversation={conv}
              isActive={activeId === conv.id}
              onSelect={() => onSelect(conv)}
            />
          ))
        )}
      </nav>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelect={(conv) => {
            onConversationCreated(conv);
            setShowNewChat(false);
          }}
        />
      )}
      {showGroup && (
        <GroupModal
          onClose={() => setShowGroup(false)}
          onCreated={(conv) => {
            onConversationCreated(conv);
            setShowGroup(false);
          }}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </aside>
  );
}
