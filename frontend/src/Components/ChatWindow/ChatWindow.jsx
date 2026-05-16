import { useEffect, useRef, useState } from "react";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "../ChatArea.css";

export default function ChatWindow({
  conversation,
  messages,
  onBack,
  onMessage,
  onConversationUpdate,
}) {
  const { user } = useAuth();
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation) return;

    socket.emit("join_conversation", { conversationId: conversation.id });

    const onReceive = (msg) => {
      if (msg.conversationId === conversation.id) onMessage(msg);
    };

    const onTyping = ({ conversationId, userId, username, isTyping }) => {
      if (conversationId === conversation.id && userId !== user.id) {
        setTypingUser(isTyping ? username : null);
      }
    };

    const onConvUpdate = ({ conversationId, lastMessage, lastMessageAt }) => {
      if (conversationId === conversation.id) {
        onConversationUpdate({ lastMessage, lastMessageAt });
      }
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("conversation_updated", onConvUpdate);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("conversation_updated", onConvUpdate);
    };
  }, [conversation?.id, user.id]);

  const handleSend = (text) => {
    getSocket()?.emit(
      "send_message",
      { conversationId: conversation.id, text },
      (res) => {
        if (res?.message) onMessage(res.message);
        if (res?.error) alert(res.error);
      }
    );
  };

  const handleTyping = (isTyping) => {
    getSocket()?.emit("typing", {
      conversationId: conversation.id,
      isTyping,
    });
    clearTimeout(typingTimeout.current);
    if (isTyping) {
      typingTimeout.current = setTimeout(() => handleTyping(false), 1500);
    }
  };

  return (
    <main className="chat-area">
      <ChatHeader
        conversation={conversation}
        typingUser={typingUser}
        onBack={onBack}
      />
      <MessageList
        messages={messages}
        currentUserId={user.id}
        isGroup={conversation.isGroup}
      />
      {typingUser && (
        <p className="message-list__typing">
          <span>{typingUser} is typing</span>
          <span className="message-list__typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </p>
      )}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </main>
  );
}
