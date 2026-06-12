import { useEffect, useState } from "react";
import { chatApi, userApi } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { DEFAULT_AVATAR } from "../../constants";
import Avatar from "../Avatar/Avatar";
import "../NewChatModal/NewChatModal.css";
import "./GroupModal.css";

export default function GroupModal({ onClose, onCreated }) {
  const { isOnline } = useSocket();
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    userApi
      .getAll()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleUser = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Enter a group name");
      return;
    }
    if (selected.size < 1) {
      setError("Select at least one member");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const conv = await chatApi.createGroup(name.trim(), [...selected]);
      onCreated(conv);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="modal-overlay" onClick={onClose} role="presentation">
      <article
        className="modal group-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <h2>New group</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <label className="group-modal__name-wrap">
          <span>Group name</span>
          <input
            type="text"
            placeholder="e.g. Dev Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
        </label>

        <label className="modal__search">
          <input
            type="search"
            placeholder="Add members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {selected.size > 0 && (
          <p className="group-modal__selected">
            {selected.size} member{selected.size > 1 ? "s" : ""} selected
          </p>
        )}

        {error && <p className="group-modal__error">{error}</p>}

        <ul className="modal__list">
          {loading ? (
            <li className="modal__empty">Loading...</li>
          ) : filtered.length === 0 ? (
            <li className="modal__empty">No users found</li>
          ) : (
            filtered.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className={`modal__user group-modal__user ${
                    selected.has(u.id) ? "group-modal__user--selected" : ""
                  }`}
                  onClick={() => toggleUser(u.id)}
                >
                  <Avatar
                    user={{
                      ...u,
                      profilePhotoUrl: u?.profilePhotoUrl || DEFAULT_AVATAR,
                    }}
                    size="md"
                    showStatus
                    online={isOnline(u.id) || u.isOnline}
                  />
                  <span>
                    <p className="modal__username">{u.username}</p>
                    <p
                      className={`modal__status ${
                        isOnline(u.id) || u.isOnline
                          ? "modal__status--online"
                          : ""
                      }`}
                    >
                      {isOnline(u.id) || u.isOnline ? "online" : "offline"}
                    </p>
                  </span>
                  <span className="group-modal__check">
                    {selected.has(u.id) ? "✓" : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        <footer className="group-modal__footer">
          <button
            type="button"
            className="group-modal__create"
            disabled={creating}
            onClick={handleCreate}
          >
            {creating ? "Creating..." : "Create group"}
          </button>
        </footer>
      </article>
    </section>
  );
}
