from sqlalchemy import Column, Integer, String, DateTime, JSON
from .database import Base

# TODO: Define User ORM model for authentication
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

# TODO: Define OpLog ORM model for append-only operation log
class OpLog(Base):
    __tablename__ = "op_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    op_id = Column(String(255), unique=True, index=True, nullable=False)
    replica_id = Column(String(255), index=True, nullable=False)
    op_type = Column(String(50), nullable=False)
    item_id = Column(String(255), index=True, nullable=False)
    payload = Column(JSON, nullable=False)
