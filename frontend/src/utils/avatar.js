/** Resolve profile photo URL (supports proxy path or full URL) */
export function getPhotoUrl(user) {
  if (!user?.profilePhotoUrl) return null;
  return user.profilePhotoUrl;
}

export function getDisplayName(conversation) {
  if (conversation.isGroup) return conversation.groupName;
  return conversation.otherUser?.username || "Chat";
}

export function getConversationAvatar(conversation) {
  if (conversation.isGroup) {
    return {
      name: conversation.groupName,
      photoUrl: conversation.groupPhotoUrl,
      color: "#8b5cf6",
      isGroup: true,
    };
  }
  return {
    name: conversation.otherUser?.username,
    photoUrl: conversation.otherUser?.profilePhotoUrl,
    color: conversation.otherUser?.avatarColor,
    letter: conversation.otherUser?.avatar,
    isGroup: false,
  };
}
