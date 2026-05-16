import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchChats, fetchMessages, markChatRead } from "../services/api";
import { getSocket } from "../services/socket";
import { chats as fallbackChats, messagesByChat as fallbackMessages } from "../Data/DataChat";

export function useChatApp() {
  const [chatList, setChatList] = useState([]);
  const [messagesMap, setMessagesMap] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const chats = await fetchChats();
        if (cancelled) return;

        setChatList(chats);
        const firstId = chats[0]?.id ?? null;
        setActiveChatId(firstId);

        if (firstId) {
          const messages = await fetchMessages(firstId);
          if (!cancelled) {
            setMessagesMap({ [firstId]: messages });
          }
        }
        setError(null);
      } catch {
        if (!cancelled) {
          setChatList(fallbackChats);
          setMessagesMap(fallbackMessages);
          setActiveChatId(fallbackChats[0]?.id ?? null);
          setError("Backend offline — using local data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onReceive = ({ chatId, message, chat }) => {
      setMessagesMap((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), message],
      }));
      if (chat) {
        const isActive = chatId === activeChatIdRef.current;
        const merged = isActive ? { ...chat, unread: 0 } : chat;
        setChatList((prev) =>
          prev.map((c) => (c.id === merged.id ? { ...c, ...merged } : c))
        );
      }
    };

    const onChatUpdated = (chat) => {
      setChatList((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, ...chat } : c))
      );
    };

    const onTyping = ({ chatId, isTyping }) => {
      if (chatId === activeChatIdRef.current) {
        setShowTyping(isTyping);
      }
    };

    const onChatRead = (chat) => {
      setChatList((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, ...chat } : c))
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceive);
    socket.on("chat_updated", onChatUpdated);
    socket.on("typing", onTyping);
    socket.on("chat_read", onChatRead);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceive);
      socket.off("chat_updated", onChatUpdated);
      socket.off("typing", onTyping);
      socket.off("chat_read", onChatRead);
    };
  }, []);

  useEffect(() => {
    if (!activeChatId) return;

    const socket = getSocket();
    socket.emit("join_chat", { chatId: activeChatId });
    setShowTyping(false);

    markChatRead(activeChatId).catch(() => {});

    async function loadMessages() {
      try {
        const messages = await fetchMessages(activeChatId);
        setMessagesMap((prev) => ({ ...prev, [activeChatId]: messages }));
      } catch {
        /* keep existing */
      }
    }

    loadMessages();
  }, [activeChatId]);

  const activeChat = useMemo(
    () => chatList.find((c) => c.id === activeChatId) ?? null,
    [chatList, activeChatId]
  );

  const activeMessages = messagesMap[activeChatId] ?? [];

  const handleSelectChat = useCallback((id) => {
    setActiveChatId(id);
    setSidebarOpen(false);
    setChatList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }, []);

  const handleSend = useCallback(
    (text) => {
      if (!activeChatId) return;
      const socket = getSocket();
      socket.emit("send_message", { chatId: activeChatId, text });
    },
    [activeChatId]
  );

  return {
    chatList,
    activeChat,
    activeMessages,
    activeChatId,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
    showTyping,
    loading,
    connected,
    error,
    handleSelectChat,
    handleSend,
  };
}
