# WhatsApp-Style Real-Time Chat App

Full-stack chat application with **React**, **Node.js**, **Express**, **MongoDB**, **Socket.IO**, and **JWT** authentication.

## Project structure

```
ChatApp/
├── backend/          # Express API + Socket.IO
│   └── src/
│       ├── config/   # env, MongoDB
│       ├── models/   # User, Conversation, Message
│       ├── middleware/  # JWT protect
│       ├── controllers/
│       ├── routes/
│       └── socket/
└── frontend/         # React (Vite)
    └── src/
        ├── context/  # Auth, Socket
        ├── pages/    # Login, Register, Chat
        ├── components/
        └── services/
```

## Required npm packages

### Backend
| Package | Purpose |
|---------|---------|
| `express` | REST API |
| `mongoose` | MongoDB ODM |
| `socket.io` | Real-time messaging |
| `jsonwebtoken` | JWT auth |
| `bcryptjs` | Password hashing |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |

### Frontend
| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI |
| `react-router-dom` | Routes & protected pages |
| `socket.io-client` | Real-time client |
| `vite` | Dev server & build |

## Prerequisites

1. **Node.js** 18+
2. **MongoDB** running locally or MongoDB Atlas URI

## Setup steps

### 1. MongoDB

**Local:** Install MongoDB and start the service (default `mongodb://127.0.0.1:27017`).

**Atlas:** Create a cluster and copy your connection string.

### 2. Backend

```powershell
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/chatapp
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Start backend:

```powershell
npm run dev
```

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### 4. Test the app

1. Register **two users** (use two browsers or incognito).
2. User A → click ✏️ → select User B → start chat.
3. Send messages — they appear in real time.
4. Online/offline status updates via Socket.IO.

## API endpoints (JWT required except auth)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Sign up |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users` | List users for new chat |
| GET | `/api/conversations` | Chat sidebar list |
| POST | `/api/conversations` | Start 1-on-1 chat `{ userId }` |
| GET | `/api/conversations/:id/messages` | Message history |

**Auth header:** `Authorization: Bearer <token>`

## Socket.IO events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_conversation` | client → server | Join chat room |
| `send_message` | client → server | Send message |
| `receive_message` | server → client | New message |
| `typing` | both | Typing indicator |
| `user_status` | server → all | Online/offline |
| `online_users` | server → client | Online user IDs |
| `conversation_updated` | server → client | Sidebar preview update |

**Socket auth:** connect with `auth: { token: jwt }`

## Features included

- User signup & login with JWT
- Passwords hashed (bcrypt)
- MongoDB storage for users & messages
- Private 1-on-1 chats
- Real-time messaging (Socket.IO)
- Online / offline status
- Typing indicator
- Chat sidebar with search
- WhatsApp-style responsive UI
- Auto-scroll messages
- Message timestamps
- Protected API routes (`protect` middleware)
