import { useEffect, useState } from "react";
import { chatApi, userApi } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../Avatar/Avatar";
import "./NewChatModal.css";

export default function NewChatModal({ onClose, onSelect }) {
  const { isOnline } = useSocket();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    userApi
      .getAll()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const startChat = async (userId) => {
    setCreating(userId);
    try {
      const conv = await chatApi.createConversation(userId);
      onSelect(conv);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(null);
    }
  };

  return (
    <section className="modal-overlay" onClick={onClose} role="presentation">
      <article className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>New chat</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <label className="modal__search">
          <input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <ul className="modal__list">
          {loading ? (
            <li className="modal__empty">Loading users...</li>
          ) : filtered.length === 0 ? (
            <li className="modal__empty">No users found</li>
          ) : (
            filtered.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className="modal__user"
                  disabled={creating === u.id}
                  onClick={() => startChat(u.id)}
                >
                  <Avatar
                    user={u}
                    size="md"
                    showStatus
                    online={isOnline(u.id) || u.isOnline}
                  />
                  <span>
                    <p className="modal__username">{u.username}</p>
                    <p
                      className={`modal__status ${
                        isOnline(u.id) || u.isOnline ? "modal__status--online" : ""
                      }`}
                    >
                      {isOnline(u.id) || u.isOnline ? "online" : "offline"}
                    </p>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </article>
    </section>
  );
}
