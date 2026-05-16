import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // On app load: validate stored token
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: me } = await authApi.me();
        setUser(me);
        connectSocket(token);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        disconnectSocket();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const saveSession = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    connectSocket(newToken);
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const data = await authApi.register({ username, email, password });
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (updated) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
