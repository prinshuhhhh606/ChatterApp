import "./EmptyState.css";

export default function EmptyState() {
  return (
    <section className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        💬
      </span>
      <h2 className="empty-state__title">Welcome to ChatSphere</h2>
      <p className="empty-state__text">
        Select a conversation from the sidebar or start a new chat with the ✏️
        button. Messages sync in real time.
      </p>
      <ul className="empty-state__hints">
        <li className="empty-state__hint">🔒 JWT secured</li>
        <li className="empty-state__hint">⚡ Real-time</li>
        <li className="empty-state__hint">📱 Responsive</li>
      </ul>
    </section>
  );
}
