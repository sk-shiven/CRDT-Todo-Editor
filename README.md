# Offline-First Collaborative Todo Editor (CRDT from Scratch)

A learning-focused collaborative todo-list application powered by a hand-rolled Conflict-free Replicated Data Type (CRDT) engine built from first principles (no Yjs or Automerge).

## 🚀 Key Features

- **Op-Based RGA CRDT Engine**: Built from scratch using a Replicated Growable Array (RGA) linked-list sequence structure combined with Last-Writer-Wins (LWW) registers for field convergence (`text`, `done`, `deleted`).
- **Resurrectable Deletions**: Deletion is modeled as an LWW boolean register (`deleted: boolean`). Edits with a higher Lamport clock than a deletion will automatically resurrect and update the item.
- **True Offline First**: Local operation log and state persisted in IndexedDB, coupled with a Service Worker for offline app shell caching.
- **Client-Server Relay**: Python FastAPI backend acting purely as a durable append-only log relay and WebSockets broadcaster without server-side merge logic.
- **JWT Local Auth**: Simple authentication issuing signed JWT tokens containing user and replica identity.

## 🏗 Project Structure

```
offline_editor/
├── docs/
│   └── PRD.md              # Project Requirements Document
├── client/                 # React + TypeScript + Vite frontend
│   ├── public/             # Static assets & Service Worker
│   ├── src/
│   │   ├── crdt/          # Pure TypeScript RGA & LWW CRDT Core Engine
│   │   ├── db/            # IndexedDB persistence adapter
│   │   ├── api/           # WebSocket & HTTP catch-up sync client
│   │   ├── components/    # UI components
│   │   └── App.tsx
│   └── tests/             # Vitest convergence unit tests
├── server/                 # Python FastAPI backend
│   └── app/               # FastAPI routes, WebSockets manager, SQLite DB
└── README.md
```

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m app.main
```

## 🧪 Testing CRDT Convergence

To run the CRDT engine unit tests:
```bash
cd client
npm test
```
