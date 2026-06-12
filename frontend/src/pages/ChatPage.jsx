import { useCallback, useEffect, useState } from "react";
import { chatApi } from "../services/api";
import { getSocket } from "../services/socket";
import Sidebar from "../Components/Sidebar/Sidebar";
import ChatWindow from "../Components/ChatWindow/ChatWindow";
import EmptyState from "../Components/EmptyState";
import "./ChatPage.css";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const loadConversations = useCallback(async () => {
    const list = await chatApi.getConversations();
    setConversations(list);
    return list;
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onConvUpdate = ({ conversationId, lastMessage, lastMessageAt }) => {
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage,
                  lastMessageAt: lastMessageAt || new Date(),
                }
              : c,
          )
          .sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
          ),
      );
    };

    socket.on("conversation_updated", onConvUpdate);
    return () => socket.off("conversation_updated", onConvUpdate);
  }, []);

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    setMobileShowChat(true);
    try {
      const msgs = await chatApi.getMessages(conv.id);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  const handleNewMessage = (msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    setConversations((prev) =>
      [
        ...prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt }
            : c,
        ),
      ].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
    );
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatApi.deleteMessage(messageId, activeConv?.id);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Delete message failed", error);
      alert(error.message || "Unable to delete message");
    }
  };

  const handleConversationCreated = (conv) => {
    setConversations((prev) => {
      if (prev.find((c) => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
    selectConversation(conv);
  };

  if (loading) {
    return (
      <section className="chat-app chat-app--loading">
        <section className="chat-app__loader">
          <span className="chat-app__loader-ring" />
          <p>Loading ChatSphere...</p>
        </section>
      </section>
    );
  }

  const appClass = `chat-app ${mobileShowChat ? "chat-app--show-chat" : ""}`;

  return (
    <section className={appClass}>
      <Sidebar
        conversations={conversations}
        activeId={activeConv?.id}
        onSelect={selectConversation}
        onConversationCreated={handleConversationCreated}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {activeConv ? (
        <ChatWindow
          conversation={activeConv}
          messages={messages}
          onBack={() => setMobileShowChat(false)}
          onMessage={handleNewMessage}
          onConversationUpdate={({ lastMessage, lastMessageAt }) => {
            setActiveConv((c) => ({ ...c, lastMessage, lastMessageAt }));
          }}
          onDeleteMessage={handleDeleteMessage}
        />
      ) : (
        <EmptyState />
      )}
    </section>
  );
}
