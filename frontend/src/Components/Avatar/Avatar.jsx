import { getPhotoUrl } from "../../utils/avatar";
import "./Avatar.css";

const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

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
  const photoUrl = isGroup
    ? user?.groupPhotoUrl || user?.photoUrl
    : getPhotoUrl(user);

  const classes = [
    "avatar",
    `avatar--${size}`,
    round ? "avatar--round" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <img
        src={photoUrl || DEFAULT_AVATAR}
        alt={isGroup ? groupName || "Group" : user?.username || "User"}
        className="avatar__img"
        onError={(e) => {
          e.target.src = DEFAULT_AVATAR;
        }}
      />

      {showStatus && (
        <span
          className={`avatar__status ${
            online ? "" : "avatar__status--offline"
          }`}
        />
      )}
    </span>
  );
}
