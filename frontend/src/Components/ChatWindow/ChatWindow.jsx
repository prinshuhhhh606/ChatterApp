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
  onDeleteMessage,
}) {
  const { user } = useAuth();

  const [typingUser, setTypingUser] = useState(null);

  const typingTimeout = useRef(null);

  const conversationId = conversation?._id || conversation?.id;

  useEffect(() => {
    const socket = getSocket();

    if (!socket || !conversationId) return;

    console.log("📥 Joining conversation:", conversationId);

    socket.emit("join_conversation", {
      conversationId,
    });

    const onReceive = (msg) => {
      console.log("📩 Message received:", msg);

      if (msg.conversationId === conversationId) {
        onMessage(msg);
      }
    };

    const onTyping = ({ conversationId: cid, userId, username, isTyping }) => {
      if (cid === conversationId && userId !== (user._id || user.id)) {
        setTypingUser(isTyping ? username : null);
      }
    };

    const onConvUpdate = ({
      conversationId: cid,
      lastMessage,
      lastMessageAt,
    }) => {
      if (cid === conversationId) {
        onConversationUpdate({
          lastMessage,
          lastMessageAt,
        });
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
  }, [conversationId]);

  const handleSend = (text) => {
    const socket = getSocket();

    if (!socket || !conversationId) return;

    console.log("📤 Sending:", {
      conversationId,
      text,
    });

    socket.emit(
      "send_message",
      {
        conversationId,
        text,
      },
      (res) => {
        console.log("SEND RESPONSE:", res);

        if (res?.message) {
          onMessage(res.message);
        }

        if (res?.error) {
          console.log("SEND ERROR:", res.error);

          alert(res.error);
        }
      },
    );
  };

  const handleTyping = (isTyping) => {
    const socket = getSocket();

    if (!socket || !conversationId) return;

    socket.emit("typing", {
      conversationId,
      isTyping,
    });

    clearTimeout(typingTimeout.current);

    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        handleTyping(false);
      }, 1500);
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
        currentUserId={user._id || user.id}
        isGroup={conversation.isGroup}
        onDeleteMessage={onDeleteMessage}
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
