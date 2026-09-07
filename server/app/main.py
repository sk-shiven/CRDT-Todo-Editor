from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, get_db, Base
from .schemas import LoginRequest, TokenResponse, SyncRequest
from .relay import manager
from . import models

# Ensure tables exist in the configured database
Base.metadata.create_all(bind=engine)

# TODO: Initialize FastAPI application instance
app = FastAPI(title="CRDT Todo Op Relay Server")

# TODO: Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Implement POST /api/auth/login endpoint
@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # TODO: Fetch or auto-create User by username
    # TODO: Verify credentials and issue signed JWT token
    raise NotImplementedError()

# TODO: Implement POST /api/sync catch-up endpoint
@app.post("/api/sync")
def sync_ops(req: SyncRequest, db: Session = Depends(get_db)):
    # TODO: Query OpLog table for operations with id > req.lastSeq
    # TODO: Return list of missing ops and latest sequence ID
    raise NotImplementedError()

# TODO: Implement WebSocket /ws relay endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    # TODO: Connect websocket using manager.connect(websocket)
    # TODO: Listen for incoming op JSON objects in a loop
    # TODO: Persist unseen ops to durable OpLog database table
    # TODO: Broadcast op JSON to all other active websocket connections via manager.broadcast
    # TODO: Handle WebSocketDisconnect and call manager.disconnect(websocket)
    raise NotImplementedError()
