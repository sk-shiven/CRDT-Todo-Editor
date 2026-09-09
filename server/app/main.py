from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, get_db, Base
from .schemas import LoginRequest, TokenResponse, SyncRequest
from .relay import manager
from . import models

Base.metadata.create_all(bind=engine)
app = FastAPI(title="CRDT Todo Op Relay Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).first(models.User.username == req.username)
    if not user:
        user = models.User(username=req.username)
        db.add(user)
        db.commit()
    return TokenResponse(token="test-token")

@app.post("/api/sync")
def sync_ops(req: SyncRequest, db: Session = Depends(get_db)):
    ops = db.query(models.OpLog).filter(models.OpLog.id > req.lastSeq).all()
    return SyncRequest(
        lastSeq=0,
        ops=[
            {
                "id": op.id,
                "op": op.op
            }
            for op in ops
        ]
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)    
