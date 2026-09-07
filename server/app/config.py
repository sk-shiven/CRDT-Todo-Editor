import os

# Application Configuration & Environment Variables

# TODO: Define SECRET_KEY for JWT encoding/decoding
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "crdt_dev_secret_key_change_in_prod")

# TODO: Define JWT algorithm and token expiry duration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for dev simplicity

# TODO: Define SQLite Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crdt_store.db")
