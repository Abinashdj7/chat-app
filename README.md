# ChatApp

A full-stack real-time chat and social media application.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Chakra UI |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Cache | Redis (ioredis) |
| Real-time | Socket.io |
| Auth | JWT (30-day expiry), bcrypt |
| Image upload | Cloudinary |

---

## Project Structure

```
chat-app/
├── Client/          # React + TypeScript frontend (Vite)
└── Server/          # Node.js + Express backend
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Redis instance
- Cloudinary account

### Environment Variables

Create `Server/MiddleWare/.env`:

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your JWT secret>
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

Create `Client/.env` (optional — defaults to `http://localhost:5050`):

```
VITE_API_URL=http://localhost:5050
```

### Install & Run

```bash
# Backend
cd Server
npm install
npm start

# Frontend (separate terminal)
cd Client
npm install
npm run dev
```

---

## Testing

### Unit Tests — Frontend (Vitest)

```bash
cd Client && npm test -- --run
```

| Suite | Tests | What is covered |
|---|---|---|
| `ChatLogic.test.ts` | 16 | Utility functions: getSender, isSameSender, isLatestMessage, margins |
| `Login.test.tsx` | 4 | Form validation, API call, localStorage, navigation, error handling |

### Backend Tests — Unit + Integration (Jest)

```bash
cd Server && npm test
```

Both unit and integration tests run in the same command (34 tests, 6 suites).

#### Unit Tests

| Suite | What is covered |
|---|---|
| `UserController.test.js` | Register and login handlers with mocked database |
| `AuthMiddleware.test.js` | JWT validation — valid token, missing token, malformed token |

#### Integration Tests

These tests spin up a real in-memory MongoDB (`mongodb-memory-server`) and exercise the full Express request/response cycle — no mocks.

| Suite | What is covered |
|---|---|
| `integration/auth.test.js` | Registration, duplicate email prevention, login success and failure |
| `integration/users.test.js` | Authenticated user search |
| `integration/chats.test.js` | Creating and fetching 1-to-1 and group chats |
| `integration/posts.test.js` | Creating and fetching posts |

### Replica Set Failover Test

Requires the Docker stack to be running (`docker compose up -d`).

```bash
cd Server && npm run test:failover
```

Spins up a 3-node MongoDB replica set (`mongo1` primary, `mongo2`/`mongo3` secondaries), writes 100 documents with `w:majority`, hard-kills the primary container, waits for automatic election, then reads all documents back from the new primary.

**Verified result (2026-06-21):**

| Metric | Result |
|---|---|
| Documents written | 100 |
| Write time | 154 ms |
| Container stopped | mongo1 (primary) |
| Election time | 523 ms |
| New primary | mongo2 |
| Documents after failover | 100 |
| Read time after failover | 21 ms |
| Data loss | 0 documents |
| Verdict | PASS |

`w:majority` ensures writes are acknowledged only after data is confirmed on ≥ 2 nodes, so zero data loss is guaranteed even when the primary dies before the client ack.

---

### End-to-End Tests (Cypress)

E2E tests require the dev server to be running.

**Terminal 1 — start the dev server:**
```bash
cd Client && npm run dev
```

**Terminal 2 — run headlessly:**
```bash
cd Client && npm run test:e2e
```

**Or open the interactive Cypress UI:**
```bash
cd Client && npm run test:e2e:open
```

Suites: `auth.cy.ts`, `chat.cy.ts`, `posts.cy.ts`

---

## Security — OWASP Top 10

| Threat | Mitigation applied |
|---|---|
| **A01 Broken Access Control** | Every protected route verifies a valid JWT via `AuthMiddleware.protect`. Group admin actions (add/remove members, rename) enforce role checks server-side, not just client-side. |
| **A02 Cryptographic Failures** | Passwords are hashed with bcrypt before storage. JWTs use HS256 with a secret loaded from environment variables — never hardcoded. |
| **A03 Injection** | All MongoDB queries go through Mongoose (parameterised). User-supplied search strings are regex-escaped before use in `$regex` queries, preventing ReDoS attacks. |
| **A05 Security Misconfiguration** | `helmet` sets secure HTTP response headers on every response. CORS is restricted to the `CLIENT_URL` environment variable — not a wildcard. |
| **A07 Identification & Authentication Failures** | The `/api/users/login` endpoint is rate-limited to 20 requests per 15 minutes via `express-rate-limit`. JWT tokens expire after 30 days. |
| **A09 Security Logging & Monitoring Failures** | All unmatched routes return a structured `404` before the global error handler. Server errors are returned as consistent JSON rather than leaking stack traces. |

---

## Clean Code — KISS & SOLID

### Centralised API layer (DIP + KISS)

All HTTP calls are routed through [`Client/src/services/api.ts`](Client/src/services/api.ts) — a single axios instance with:

- `baseURL` from an environment variable (`VITE_API_URL`)
- Auth header injected once via a request interceptor, not repeated in every component
- Named domain functions (`authApi.login`, `chatApi.fetchChats`, `messageApi.sendMessage`, etc.)

Before this, `http://localhost:5050` and the auth header config object were duplicated in over ten components.

### Custom hooks (SRP)

Each hook owns exactly one concern:

| Hook | Responsibility |
|---|---|
| [`useSocket`](Client/src/hooks/useSocket.ts) | Socket.io connection lifecycle, setup handshake, typing indicator state |
| [`useUserSearch`](Client/src/hooks/useUserSearch.ts) | User search API call, loading state, error toast |
| [`usePostActions`](Client/src/hooks/usePostActions.ts) | Fetch and mutate likes and comments for a single post |

### Shared hooks eliminate duplication (OCP / DRY)

`useUserSearch` is consumed by `SideDrawer`, `GroupChatModel`, and `UpdateGroupChatModel`. The identical search-fetch-loading pattern that previously lived in all three components now lives in one place.

### Bugs fixed during refactor

| Location | Bug |
|---|---|
| `PostInterface.tsx` | `getLike()` called `axios.delete` instead of `axios.get` — fixed via `usePostActions` |
| `Comments.tsx` | Rendered `c.user` (always `undefined`) instead of `c.sender.name` |
| `SingleChat.tsx` | Sent `chatId: selectedChat` (the whole object) instead of `chatId: selectedChat._id`; module-level `socket` and `selectedChatCompare` variables replaced with `useRef`; the `message received` effect had no deps array or cleanup, adding a new listener on every render |
| `GroupChatModel.tsx` | `handleSearch` referenced stale `search` state instead of the live `query` parameter (closure bug) |
| `Login.tsx` | Success toast title said "Registration" |
| `NavBar.tsx` | Notification item displayed literal string `"GetSender"` instead of the sender's name |
| `LikeController.js` | `addLIke` export name typo |

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/users` | No | Register |
| POST | `/api/users/login` | No | Login (rate-limited) |
| GET | `/api/users?search=` | Yes | Search users |
| POST | `/api/chats` | Yes | Create / fetch 1-to-1 chat |
| GET | `/api/chats` | Yes | List user's chats |
| POST | `/api/chats/group` | Yes | Create group chat |
| PUT | `/api/chats/rename` | Yes | Rename group chat |
| PUT | `/api/chats/groupadd` | Yes | Add user to group (admin only) |
| PUT | `/api/chats/groupremove` | Yes | Remove user from group |
| POST | `/api/messages` | Yes | Send message |
| GET | `/api/messages/:chatId` | Yes | Fetch messages for a chat |
| POST | `/api/posts` | Yes | Create post |
| GET | `/api/posts` | Yes | Fetch all posts |
| POST | `/api/likes` | Yes | Like a post |
| GET | `/api/likes/:postId` | Yes | Get likes for a post |
| DELETE | `/api/likes/:postId/:userId` | Yes | Unlike a post |
| POST | `/api/comments` | Yes | Add comment |
| GET | `/api/comments/:postId` | Yes | Get comments for a post |
