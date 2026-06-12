import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../services/api";
import { DEFAULT_AVATAR } from "../../constants";
import Avatar from "../Avatar/Avatar";
import "../NewChatModal/NewChatModal.css";
import "./ProfileModal.css";

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be under 3MB");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { user: updated } = await userApi.uploadAvatar(file);
      updateUser(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    try {
      const { user: updated } = await userApi.removeAvatar();
      updateUser(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="modal-overlay profile-modal"
      onClick={onClose}
      role="presentation"
    >
      <article className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2>Profile photo</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <section className="profile-modal__preview">
          <Avatar
            user={{
              ...user,
              profilePhotoUrl:
                user?.profilePhotoUrl || user?.profilePhoto || DEFAULT_AVATAR,
            }}
            size="lg"
            round
          />
          <p className="profile-modal__hint">JPG, PNG or WEBP · max 3MB</p>
          {error && (
            <p className="auth-error" style={{ width: "100%" }}>
              {error}
            </p>
          )}
        </section>

        <section className="profile-modal__actions">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="profile-modal__file"
            onChange={handleFile}
          />
          <button
            type="button"
            className="profile-modal__btn profile-modal__btn--primary"
            disabled={loading}
            onClick={() => fileRef.current?.click()}
          >
            {loading ? "Uploading..." : "Upload photo"}
          </button>
          {(user.profilePhotoUrl || user.profilePhoto) && (
            <button
              type="button"
              className="profile-modal__btn profile-modal__btn--danger"
              disabled={loading}
              onClick={handleRemove}
            >
              Remove photo
            </button>
          )}
          <button
            type="button"
            className="profile-modal__btn profile-modal__btn--ghost"
            onClick={onClose}
          >
            Cancel
          </button>
        </section>
      </article>
    </section>
  );
}
