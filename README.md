# ChatApp

A full-stack real-time chat and social feed application built with React, Node.js, Socket.IO, and MongoDB — fully containerised with Docker and covered by a CI/CD pipeline.

---

## Features

- **Real-time messaging** via Socket.IO with typing indicators
- **1-to-1 and group chats** with admin controls (add/remove members, rename)
- **Social feed** — create posts with image uploads, like, and comment
- **JWT authentication** — register, login, and protected routes
- **User search** — find other users to start a chat
- **Notifications** — unread message badges
- **Fully containerised** — runs with a single `docker compose up`
- **CI/CD pipeline** — automated lint, tests, and Docker build on every push

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Chakra UI, Framer Motion, Lottie |
| Real-time | Socket.IO |
| HTTP client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcrypt |
| Image uploads | Cloudinary |
| Containerisation | Docker, Docker Compose, nginx |
| CI/CD | GitHub Actions |
| Testing | Jest (server), Vitest + React Testing Library (client) |

---

## Architecture

```
Browser
  │
  ├── HTTP (port 8080) ──► nginx (client container)
  │                            └── serves React SPA
  │
  └── HTTP/WS (port 5050) ──► Express + Socket.IO (server container)
                                    └── Mongoose ──► MongoDB (mongo container)
```

Three Docker containers communicate over an internal Docker network. The React app is built at image-build time and served as static files by nginx. The Express server handles all API and WebSocket traffic. MongoDB data is persisted via a named Docker volume.

---

## Folder Structure

```
chat-app/
├── Client/                  # React + TypeScript frontend
│   ├── src/
│   │   ├── __tests__/       # Vitest unit tests
│   │   ├── Authentication/  # Login & SignUp forms
│   │   ├── ChatPageComponents/  # Chat list, search drawer
│   │   ├── Messaging/       # Single chat, group chat modals, scrollable feed
│   │   ├── Pages/           # Route-level page components
│   │   ├── PostPageComponents/  # Posts, comments, likes
│   │   ├── UserComponents/  # User badges, list items, profile modal
│   │   ├── ChatLogic.tsx    # Pure message-rendering utility functions
│   │   ├── ChatProvider.tsx # Global React context + custom hook
│   │   └── App.tsx          # Router root
│   ├── Dockerfile (via Dockerfile.client)
│   └── nginx.conf
│
├── Server/                  # Node.js + Express backend
│   ├── Controllers/         # Route handler logic
│   ├── MiddleWare/          # Auth, error handling, JWT generation
│   ├── Models/              # Mongoose schemas
│   ├── Routes/              # Express routers
│   ├── __tests__/           # Jest unit tests
│   ├── App.js               # Express app + Socket.IO setup
│   └── Db.js                # MongoDB connection
│
├── Dockerfile.client
├── Dockerfile.server
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### Installation

```bash
git clone https://github.com/Abinashdj7/chat-app.git
cd chat-app
```

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then fill in your values (see [Environment Variables](#environment-variables)).

### Run with Docker

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:5050 |
| MongoDB | localhost:27017 |

---

## Environment Variables

Create a `.env` file at the project root (`chat-app/.env`):

```env
MONGO_URI=mongodb://mongo:27017/chatapp
CLIENT_URL=http://localhost:8080
JWT_SECRET=your_long_random_secret_here
```

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string. Defaults to the containerised MongoDB instance. |
| `CLIENT_URL` | Origin allowed by Socket.IO CORS — must match the URL the browser loads the app from. |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens. Use a long random string in production. |

> **Never commit `.env` to version control.** It is listed in `.gitignore`.

---

## Development Scripts

### Client (`Client/`)

```bash
npm run dev          # Start Vite dev server (hot reload)
npm run build        # TypeScript check + production build
npm run lint         # ESLint across all .ts/.tsx files
npm run test         # Run Vitest in watch mode
npm run test:coverage  # Run Vitest with coverage report
```

### Server (`Server/`)

```bash
npm start   # Start Express server with node
npm test    # Run Jest unit tests
```

---

## API Overview

All routes are prefixed with `/api`. Protected routes require a `Bearer <token>` Authorization header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users` | No | Register a new user |
| POST | `/api/users/login` | No | Login and receive a JWT |
| GET | `/api/users?search=` | Yes | Search users by name or email |
| GET | `/api/chats` | Yes | Get all chats for the logged-in user |
| POST | `/api/chats` | Yes | Access or create a 1-to-1 chat |
| POST | `/api/chats/group` | Yes | Create a group chat |
| PUT | `/api/chats/rename` | Yes | Rename a group chat |
| PUT | `/api/chats/groupadd` | Yes | Add a user to a group |
| PUT | `/api/chats/groupremove` | Yes | Remove a user from a group |
| GET | `/api/messages/:chatId` | Yes | Get all messages in a chat |
| POST | `/api/messages` | Yes | Send a message |
| GET | `/api/posts` | Yes | Get all posts (newest first) |
| POST | `/api/posts` | Yes | Create a post |
| POST | `/api/likes` | Yes | Like a post |
| DELETE | `/api/likes/:postId/:userId` | Yes | Unlike a post |
| GET | `/api/comments/:postId` | Yes | Get comments on a post |
| POST | `/api/comments` | Yes | Add a comment to a post |

### Socket.IO Events

| Event (emit) | Payload | Description |
|---|---|---|
| `setup` | `userData` | Join personal notification room on connect |
| `join chat` | `roomId` | Join a chat room |
| `new message` | `messageObject` | Broadcast a new message to the room |
| `typing` | `roomId` | Notify others the user is typing |
| `stop typing` | `roomId` | Notify others the user stopped typing |

---

## CI/CD Pipeline

GitHub Actions runs on every push and pull request to `main`:

```
test-server ──┐
              ├──► docker-build
test-client ──┘
```

1. **Server Tests** — installs dependencies and runs Jest
2. **Client Lint & Tests** — runs ESLint then Vitest
3. **Docker Build** — builds both images only if tests pass

---

## Deployment Notes

- The `MONGO_URI` defaults to the containerised MongoDB. To use MongoDB Atlas, set `MONGO_URI` to your Atlas connection string in `.env`.
- `JWT_SECRET` must be a strong random value in production. Generate one with:
  ```bash
  python -c "import secrets; print(secrets.token_hex(64))"
  ```
- Windows users: port 5000 is reserved by Hyper-V. The server is mapped to **5050** on the host by default.
- The client container uses nginx to serve the React build and can be placed behind a reverse proxy (Nginx, Traefik, Caddy) in production.

---

## Future Improvements

- Replace `any` types throughout the client with proper TypeScript interfaces
- Add a centralised API service layer to remove hardcoded `localhost:5050` URLs
- Persist notifications across page refreshes
- Add end-to-end tests with Playwright or Cypress
- Add message pagination to avoid loading entire chat history on open
- Fix socket memory leak in `SingleChat` — add cleanup on component unmount

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request against `main`

All PRs must pass the CI pipeline (lint, tests, Docker build) before merging.
