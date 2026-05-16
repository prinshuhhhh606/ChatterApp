/**
 * Build full URL for profile photo path.
 */
export function photoUrl(profilePhoto, baseUrl = "") {
  if (!profilePhoto) return null;
  if (profilePhoto.startsWith("http")) return profilePhoto;
  return `${baseUrl}${profilePhoto}`;
}

/**
 * Shape user document for API responses (no password).
 */
export function formatUser(user, baseUrl = "") {
  const initials = user.username?.charAt(0).toUpperCase() || "?";
  const path = user.profilePhoto || "";

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar || initials,
    avatarColor: user.avatarColor,
    profilePhoto: path,
    profilePhotoUrl: photoUrl(path, baseUrl),
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  };
}
