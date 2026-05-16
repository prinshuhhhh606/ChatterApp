import { getPhotoUrl } from "../../utils/avatar";
import "./Avatar.css";

export default function Avatar({
  user,
  size = "md",
  round = false,
  showStatus = false,
  online = false,
  isGroup = false,
  groupName,
  className = "",
}) {
  const photoUrl = isGroup ? user?.groupPhotoUrl || user?.photoUrl : getPhotoUrl(user);
  const letter = isGroup
    ? (groupName || user?.groupName || "G").charAt(0).toUpperCase()
    : user?.avatar || "?";
  const color = user?.avatarColor || "#8b5cf6";

  const classes = [
    "avatar",
    `avatar--${size}`,
    round ? "avatar--round" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={!photoUrl ? { background: color } : undefined}>
      {photoUrl ? (
        <img src={photoUrl} alt="" className="avatar__img" />
      ) : isGroup ? (
        <span className="avatar__group-icon" aria-hidden="true">
          👥
        </span>
      ) : (
        letter
      )}
      {showStatus && (
        <span
          className={`avatar__status ${online ? "" : "avatar__status--offline"}`}
        />
      )}
    </span>
  );
}
