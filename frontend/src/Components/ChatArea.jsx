import "./ChatArea.css";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./Messagelist";

export default function ChatArea({ chat, messages, showTyping, onSend }) {
  return (
    <main className="chat-area">
      <ChatHeader chat={chat} />
      <MessageList messages={messages} showTyping={showTyping} />
      <MessageInput onSend={onSend} disabled={!chat} />
    </main>
  );
}
