from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, get_db, Base
from .schemas import LoginRequest, TokenResponse, SyncRequest
from .relay import manager
from .auth import create_access_token, verify_password, get_password_hash
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
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user:
        user = models.User(
            username=req.username,
            hashed_password=get_password_hash(req.password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return TokenResponse(access_token=token, token_type="bearer", username=user.username)

@app.post("/api/sync")
def sync_ops(req: SyncRequest, db: Session = Depends(get_db)):
    ops = db.query(models.OpLog).filter(models.OpLog.id > req.lastSeq).order_by(models.OpLog.id.asc()).all()
    latest_seq = ops[-1].id if ops else req.lastSeq
    return {
        "lastSeq": latest_seq,
        "ops": [op.payload for op in ops]
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            op_id = data.get("opId")
            if op_id:
                exists = db.query(models.OpLog).filter(models.OpLog.op_id == op_id).first()
                if not exists:
                    log_entry = models.OpLog(
                        op_id=op_id,
                        replica_id=data.get("replicaId", "unknown"),
                        op_type=data.get("type", "UNKNOWN"),
                        item_id=data.get("itemId", "unknown"),
                        payload=data,
                    )
                    db.add(log_entry)
                    db.commit()
            await manager.broadcast(data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)    
