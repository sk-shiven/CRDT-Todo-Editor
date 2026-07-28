# PRD: Offline-First Collaborative Todo Editor (CRDT from Scratch)

## 1. Purpose

A learning-focused project to understand Conflict-free Replicated Data Types
(CRDTs) from first principles by implementing one from scratch — not by
wrapping a library like Yjs or Automerge. The end product is a small
collaborative todo-list app where two or more users can edit fully offline
and have their changes merge automatically and consistently when they
reconnect, with no central authority resolving conflicts.

**This is not a production app.** Every design choice below optimizes for
"can I explain why this merge is correct" over performance, scale, or
feature completeness.

## 2. Goals

- Implement an op-based CRDT for a structured todo list by hand using a linked-list (RGA) sequence structure.
- Support real offline editing (not just a simulated toggle) via local
  persistence and a service worker.
- Demonstrate two concrete classes of conflicts converging correctly:
  1. **Concurrent field edits** — two replicas edit the same field on the
     same item differently while offline (e.g. both rename the same todo).
  2. **Concurrent structural edits** — one replica moves/inserts an item
     while another deletes or edits it.
- Ship a working client-server relay: the server stores and forwards
  operations but never merges them — merge logic lives only in the CRDT
  implementation, run identically on every client. This makes divergence
  bugs visible instead of silently "fixed" by a smarter server.
- Simple JWT authentication so multiple real users can log in from different
  browsers/devices to test real offline scenarios.

## 3. Non-Goals (v1)

- Peer-to-peer networking (WebRTC/NAT traversal) — explicitly out of scope;
  adds networking complexity unrelated to CRDT learning.
- Server-side merge logic — the server is a dumb relay/store only.
- Multi-list support in v1 — strictly a single shared todo list for v1 (can expand post-v1).
- Large-scale data (many lists, hundreds of items, deep nesting) or
  performance tuning.
- Rich text editing — content is structured todo-list data only.
- CRDT internals visualizer/debug panel — nice-to-have, deferred past v1.

## 4. Users & Scenario

- A small number of test users (yourself + test accounts across browser profiles) logging in via a local endpoint issuing JWT tokens.
- Primary test scenario: User A and User B both open the shared todo list,
  go offline (real network disconnect via browser dev tools or server shutdown), each make
  changes, then come back online. The app must converge to the same final
  state on both sides without data loss or a crash, and the merge
  result must be deterministic across all replicas.

## 5. Data Model

A single shared todo list, structured as an RGA linked-list sequence of item nodes:

```
List (Single shared root)
 └── Nodes[] (RGA Linked-List)
      ├── id (replica_id, counter tuple — stable & globally unique)
      ├── origin_id (id of the item immediately preceding this one at creation time)
      ├── text (LWW-Register: { value: string, clock: LamportTuple })
      ├── done (LWW-Register: { value: boolean, clock: LamportTuple })
      └── deleted (LWW-Register: { value: boolean, clock: LamportTuple })
```

Kept intentionally small: one shared list, a handful of items, no nested
sub-lists in v1. This keeps every merge case inspectable by eye.

## 6. CRDT Design

### 6.1 Op-Based Linked-List CRDT (RGA Architecture)

Each item in the list handles two complementary CRDT mechanisms:

- **Per-field values (`text`, `done`, `deleted`)** → **LWW-Register** (Last-Writer-Wins
  register) per field, using a Lamport timestamp tuple `(lamport_clock, replica_id)` as the tiebreaker.
- **Deletion (`deleted`)** → Modeled as an LWW-Register boolean. If Replica A deletes an item (`deleted = true`), and Replica B concurrently edits its `text` with a higher Lamport clock, the edit applies and resurrects the item (`deleted = false` or updated text visible). The newest clock always wins cleanly without custom edge-case code.
- **List Ordering & Sequence (`RGA Linked-List`)** → Each inserted node explicitly references its `origin_id` (the ID of the node it was inserted directly after). When concurrent insertions share the same `origin_id`, ties are broken deterministically by comparing their creation Lamport tuples `(lamport_clock, replica_id)`.

### 6.2 Identity

Every item gets a globally unique, replica-independent ID at creation time:
`item_id = (creator_replica_id, local_sequence_counter)`

Never use array indices as identity — array indices change during concurrent mutations.

### 6.3 Linked-List RGA Insertion & Ordering Algorithm

1. Every insertion op carries `(item_id, origin_id, lamport_clock, replica_id)`.
2. When inserting a new node into the local linked list:
   - Locate `origin_id` in the linked list (if `origin_id` is `null`, insert at the head).
   - If multiple concurrent nodes share the exact same `origin_id`, order them by descending `(lamport_clock, replica_id)`.
   - Skip past any existing concurrent children of `origin_id` that have a higher sorting tuple before inserting.
3. This guarantees all replicas reach the exact same linear sequence order regardless of op arrival order.

### 6.4 Conflict Scenarios to Explicitly Test

| Scenario | Expected Resolution |
|---|---|
| Both replicas rename the same item's `text` while offline | LWW by `(lamport_clock, replica_id)`. Higher clock wins. |
| Both replicas toggle the same item's `done` state | Same LWW mechanism by `(lamport_clock, replica_id)`. |
| Replica A sets `deleted = true`; Replica B edits `text` concurrently | LWW on `deleted` and `text` fields. If edit clock > delete clock, edit applies and resurrects item. If delete clock > edit clock, deletion wins. |
| Both replicas insert a new item after the same item X concurrently | RGA ordering places both items after X deterministically, sorted by `(lamport_clock, replica_id)`. |
| Replica A inserts item Y after X; Replica B deletes item X concurrently | Item Y is still inserted correctly after X (tombstoned or referenced by ID). Order remains stable. |

## 7. Sync Architecture

**Client-Server Relay**:

- Each client maintains a local CRDT replica plus a persistent local op-log in IndexedDB.
- Client applies its own ops locally immediately (optimistic UI, works fully offline).
- When online, client sends unsent ops to the server over a WebSocket connection.
- Server appends ops to a durable SQLite log per list and rebroadcasts them to all other connected clients.
- The server does **not** interpret or merge ops — it acts as a durable append-only log relay.
- When a client reconnects after being offline, it issues a catch-up request (`SYNC_REQ(last_seen_server_seq)`), receives missing ops via HTTP/WebSocket, and replays them locally through the CRDT merge engine.

## 8. Offline Support

- **IndexedDB**: Persists the local op-log and materialized state so full page reloads while offline preserve all state and unsent ops.
- **Service Worker**: Caches the frontend static assets so the app shell loads with zero network connectivity.
- **Online/Offline Status Bar**: Visual indicator showing current network state, unsent pending op count, and sync state.

## 9. Stack

- **Frontend:** React + TypeScript + Vite. Custom local CRDT state manager (plain TS classes/objects driving RGA linked-list ops — zero external CRDT libraries), IndexedDB (`idb`) for persistence, Service Worker for offline app shell.
- **Backend:** Python (FastAPI), WebSockets for real-time relay, SQLite + SQLAlchemy/SQLModel for append-only op storage and user records.
- **Auth:** Local JWT auth via `/api/auth/login` endpoint issuing JWT tokens containing `user_id` and `replica_id`.
- **Transport:** WebSockets for live op streaming; REST (`/api/sync`) for catch-up sync on reconnection.

## 10. Milestones

1. **CRDT RGA Core (Unit-tested, no UI/Network)** — Implement LWW-registers, `deleted` LWW field, and RGA linked-list sequence ordering in pure TypeScript. Validate convergence with test suites applying ops out-of-order.
2. **Single-Client App & Persistence** — Connect CRDT engine to React UI and IndexedDB local storage.
3. **Relay Server & Multi-Client Sync** — FastAPI server with SQLite op-log + WebSockets + JWT login endpoint. Sync live ops between two clients.
4. **Offline Mode & Service Worker** — Add Service Worker, catch-up sync flow on reconnect (`SYNC_REQ`), and pending op queue.
5. **Conflict Matrix Verification** — Interactively test and verify all scenarios in Section 6.4 matrix.
6. **Polish & Documentation** — Clean UI, online/offline status bar, and detailed README documenting RGA linked-list design and merge math.

## 11. Resolved Architectural Decisions

1. **Auth Mechanism**: JWT authentication issued by a simple local `/api/auth/login` endpoint for easy multi-browser testing without external mail dependencies.
2. **Delete-vs-Edit Conflict Policy**: Deletion is an LWW-Register boolean (`deleted`). Concurrent edit with a higher Lamport clock than deletion will resurrect/update the item cleanly.
3. **Ordering Strategy**: RGA (Replicated Growable Array) Linked-List Sequence CRDT using explicit `origin_id` pointers and deterministic `(lamport_clock, replica_id)` tie-breaking.
4. **Scope**: Single shared todo list for v1 to maximize focus on CRDT mechanics.

## 12. Explicitly Deferred / Out of Scope

- Multi-list support (post-v1).
- Visualizer/debug panel (nice-to-have, deferred).
- Peer-to-Peer (P2P / WebRTC) sync.
- Server-side merge logic.
- Rich text editing & nested lists.
