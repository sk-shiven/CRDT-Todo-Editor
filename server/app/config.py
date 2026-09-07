import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env located in the server directory or root
server_dir = Path(__file__).resolve().parent.parent
env_path = server_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "crdt_dev_secret_key_change_in_prod")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))

# MySQL Database Configuration
DB_USER = os.getenv("DB_USER", "crdt_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "crdt_password")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "crdt_todo")

DEFAULT_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

