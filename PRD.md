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

- Implement a CRDT for a structured (JSON-tree-like) todo list, by hand.
- Support real offline editing (not just a simulated toggle) via local
  persistence and a service worker.
- Demonstrate two concrete classes of conflicts converging correctly:
  1. **Concurrent field edits** — two replicas edit the same field on the
     same item differently while offline (e.g. both rename the same todo).
  2. **Concurrent structural edits** — one replica moves/reorders an item
     while another deletes or edits it.
- Ship a working client-server relay: the server stores and forwards
  operations but never merges them — merge logic lives only in the CRDT
  implementation, run identically on every client. This makes divergence
  bugs visible instead of silently "fixed" by a smarter server.
- Simple auth so multiple real users can log in from different
  browsers/devices to test real offline scenarios.

## 3. Non-Goals (v1)

- Peer-to-peer networking (WebRTC/NAT traversal) — explicitly out of scope;
  adds networking complexity unrelated to CRDT learning.
- Server-side merge logic — the server is a dumb relay/store only.
- Large-scale data (many lists, hundreds of items, deep nesting) or
  performance tuning.
- Rich text editing — content is structured todo-list data only.
- CRDT internals visualizer/debug panel — nice-to-have, deferred past v1
  (see Section 9).

## 4. Users & Scenario

- A small number of test users (yourself + maybe a friend, or two browser
  profiles) with simple auth (email/password or magic link — TBD in
  implementation).
- Primary test scenario: User A and User B both open the same todo list,
  go offline (real network disconnect, not just a flag), each make
  changes, then come back online. The app must converge to the same final
  state on both sides without data loss or a crash, and ideally the merge
  result should make intuitive sense to a human.

## 5. Data Model

A single shared todo list, structured as a small JSON-like tree:

```
List
 └── Items[] (ordered)
      ├── id (stable, replica-independent — see Section 6.2)
      ├── text (string field)
      ├── done (boolean field)
      └── position (for ordering — see Section 6.3)
```

Kept intentionally small: one list, a handful of items, no nested
sub-lists in v1. This keeps every merge case inspectable by eye.

## 6. CRDT Design

This is the core of the project — the part to spend the most time on.

### 6.1 Recommended approach: op-based CRDT, RGA-inspired for ordering

Rather than picking one exotic algorithm, compose it from well-understood
pieces, since each item in the list needs two different kinds of
CRDT behavior:

- **Per-field values** (`text`, `done`) → **LWW-Register** (Last-Writer-Wins
  register) per field, using a Lamport timestamp or (timestamp, replica-id)
  tuple as the tiebreaker. Simple, and a great first CRDT to implement by
  hand.
- **List ordering / item identity** → an **RGA (Replicated Growable Array)**
  or a **fractional-indexing / position-based** approach for ordering, plus
  **tombstones** for deletes so concurrent edit-vs-delete has a well-defined
  outcome (a common, teachable choice: edit wins over delete, or delete
  wins — pick one and document why).

This combination is a good teaching set because it forces you to reason
about *two different CRDT problems* (value convergence vs. structural/order
convergence) rather than treating "CRDT" as one monolithic thing.

### 6.2 Identity

Every item gets a globally unique, replica-independent ID at creation time
(e.g. `(replica_id, local_counter)` — a lightweight Lamport-style ID).
Never use array indices as identity — that's the single most common bug
source in hand-rolled list CRDTs.

### 6.3 Ordering

Recommend fractional indexing (each item has an order key that's a
value between its neighbors, e.g. using strings like `"a0"`, `"a1"`,
`"a05"`) over full RGA-linked-list semantics for v1 — meaningfully
simpler to implement correctly, and sufficient for the small-scale,
teaching-focused goal in Section 3. You can compare it against a "real"
RGA implementation once the simple version works, if you want to go
deeper later.

### 6.4 Conflict scenarios to explicitly test

| Scenario | Expected resolution |
|---|---|
| Both replicas rename the same item's `text` while offline | LWW by (timestamp, replica-id); document that this is "last write wins," not merge-the-text |
| Both replicas toggle the same item's `done` differently | Same LWW mechanism |
| Replica A deletes an item; Replica B edits the same item concurrently | Pick and document one policy (recommend: edit-then-delete semantics are ambiguous, so document your team's chosen resolution, e.g. "delete wins" with a tombstone, or "edit resurrects") |
| Replica A moves item X; Replica B moves item Y past X concurrently | Both moves land in a well-defined order via fractional index comparison — no crash, both intents roughly preserved |
| Both replicas add a new item concurrently | Both items survive; order determined by fractional index at creation |

## 7. Sync Architecture

**Client-server relay** (recommended over P2P or server-merge — see
Section 3 rationale):

- Each client maintains a local CRDT replica plus a persistent op-log.
- Client applies its own ops locally immediately (optimistic UI, works
  offline).
- When online, client sends unsent ops to the server.
- Server appends ops to a durable log per list and rebroadcasts to other
  connected clients — the server does **not** interpret or merge ops.
- When a client reconnects after being offline, it fetches all ops it's
  missing since its last known point and replays/merges them locally
  through the same CRDT merge function used for live updates.

## 8. Offline Support

- Local persistence of the op-log and current materialized state (e.g.
  IndexedDB) so a full page reload while offline doesn't lose data.
- A service worker so the app shell loads and is usable with no network
  at all, not just "API calls fail gracefully."
- A simple online/offline indicator in the UI so it's clear which mode
  you're in for testing.

## 9. Stack

- **Frontend:** React, with local CRDT state manager (plain JS/TS objects
  driving CRDT ops — no CRDT library), IndexedDB for persistence, service
  worker for offline shell.
- **Backend:** Python (e.g. FastAPI), acting purely as an op relay/store
  (simple database table of ops, e.g. SQLite/Postgres — durability matters
  more than schema sophistication here).
- **Transport:** WebSocket for live op broadcast when online; REST/HTTP
  for catch-up sync of missed ops after reconnect.
- **Auth:** simple email/password or magic-link auth — exact mechanism
  still open, see Section 11.

## 10. Milestones (rough, 1-2 week comfortable pace)

1. **CRDT core, no UI, no network** — implement LWW-register fields +
   fractional-index ordering + tombstoned deletes, prove convergence with
   unit tests that apply the same ops in different orders and assert
   identical final state.
2. **Single-client app** — wire the CRDT core to a real React UI and
   local persistence (no multi-user yet).
3. **Two-client sync via relay server** — WebSocket relay, live
   multi-client editing while online.
4. **Real offline support** — service worker, IndexedDB, disconnect/
   reconnect flow, catch-up sync.
5. **Conflict scenario testing** — deliberately trigger each row in the
   Section 6.4 table and verify/document actual behavior.
6. **Polish** — simple auth, basic styling, README explaining the CRDT
   design decisions (valuable both as documentation and as a way to
   solidify your own understanding).
7. *(Stretch)* CRDT internals visualizer/debug panel.

## 11. Open Questions

- Auth mechanism: email/password vs. magic link — not yet decided.
- Delete-vs-edit conflict policy (Section 6.4): needs an explicit decision
  before Milestone 5.
- Whether to implement a "real" RGA for ordering as a stretch goal to
  compare against the simpler fractional-indexing approach.

## 12. Explicitly Deferred / Out of Scope

- Visualizer/debug panel (nice-to-have, not v1).
- P2P sync.
- Server-side merge logic.
- Multi-list, nested trees, rich text, large-scale data.
