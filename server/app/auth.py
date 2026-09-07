import datetime
import jwt

# pyrefly: ignore [missing-import]
from passlib.context import CryptContext
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    # TODO: Encode JWT token containing payload data and expiration timestamp
    raise NotImplementedError()

def decode_access_token(token: str) -> dict:
    # TODO: Decode and validate JWT token signature using SECRET_KEY and ALGORITHM
    raise NotImplementedError()