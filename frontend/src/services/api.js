const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export const authApi = {
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
};

export const userApi = {
  getAll: () => request("/api/users"),
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
  removeAvatar: () =>
    request("/api/users/me/avatar", { method: "DELETE" }),
};

export const chatApi = {
  getConversations: () => request("/api/conversations"),
  createConversation: (userId) =>
    request("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  createGroup: (name, userIds) =>
    request("/api/conversations/group", {
      method: "POST",
      body: JSON.stringify({ name, userIds }),
    }),
  getMessages: (conversationId) =>
    request(`/api/conversations/${conversationId}/messages`),
};
