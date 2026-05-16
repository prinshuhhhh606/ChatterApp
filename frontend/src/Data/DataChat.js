export const chats = [
  {
    id: 1,
    name: "Rahul Sharma",
    avatar: "R",
    color: 1,
    message: "Hey bro, kaisa chal raha? 👋",
    time: "2m",
    online: true,
    unread: 2,
  },
  {
    id: 2,
    name: "Aman Verma",
    avatar: "A",
    color: 2,
    message: "Project complete ho gaya?",
    time: "15m",
    online: true,
    unread: 0,
  },
  {
    id: 3,
    name: "Priya Singh",
    avatar: "P",
    color: 3,
    message: "Call karna free hoke",
    time: "1h",
    online: false,
    unread: 1,
  },
  {
    id: 4,
    name: "Karan Mehta",
    avatar: "K",
    color: 4,
    message: "Socket.io setup done ✅",
    time: "3h",
    online: true,
    unread: 0,
  },
  {
    id: 5,
    name: "Dev Team",
    avatar: "D",
    color: 5,
    message: "Meeting at 5 PM today",
    time: "Yesterday",
    online: false,
    unread: 5,
  },
];

export const messagesByChat = {
  1: [
    { id: 1, text: "Hello! 👋", sender: "other", time: "10:28 AM" },
    { id: 2, text: "Hi bro, sab badhiya?", sender: "me", time: "10:29 AM" },
    { id: 3, text: "Haan yaar, chat app almost ready hai", sender: "other", time: "10:30 AM" },
    { id: 4, text: "UI dekh ke batao kaisa laga 🚀", sender: "me", time: "10:31 AM" },
    { id: 5, text: "Hey bro, kaisa chal raha? 👋", sender: "other", time: "10:32 AM" },
  ],
  2: [
    { id: 1, text: "Bhai deadline kab hai?", sender: "other", time: "9:00 AM" },
    { id: 2, text: "Kal tak submit karna hai", sender: "me", time: "9:05 AM" },
    { id: 3, text: "Project complete ho gaya?", sender: "other", time: "9:15 AM" },
  ],
  3: [
    { id: 1, text: "Free ho to call karna", sender: "other", time: "Yesterday" },
    { id: 2, text: "Sure, shaam ko baat karte hain", sender: "me", time: "Yesterday" },
    { id: 3, text: "Call karna free hoke", sender: "other", time: "Yesterday" },
  ],
  4: [
    { id: 1, text: "Backend ready hai?", sender: "me", time: "Mon" },
    { id: 2, text: "Socket.io setup done ✅", sender: "other", time: "Mon" },
    { id: 3, text: "Frontend bhi connect kar dete hain", sender: "me", time: "Mon" },
  ],
  5: [
    { id: 1, text: "Sprint review kal hai", sender: "other", time: "Tue" },
    { id: 2, text: "Slides ready hain?", sender: "me", time: "Tue" },
    { id: 3, text: "Meeting at 5 PM today", sender: "other", time: "Wed" },
  ],
};

export function formatTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
