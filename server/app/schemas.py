from typing import Any, Dict, Optional
from pydantic import BaseModel

# TODO: Define LoginRequest schema (username, password)
class LoginRequest(BaseModel):
    username: str
    password: str

# TODO: Define TokenResponse schema (access_token, token_type, username)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

# TODO: Define OpSchema payload validation schema
class OpSchema(BaseModel):
    opId: str
    replicaId: str
    type: str
    itemId: str
    clock: Dict[str, Any]

# TODO: Define SyncRequest catch-up request schema (lastSeq)
class SyncRequest(BaseModel):
    lastSeq: int = 0
