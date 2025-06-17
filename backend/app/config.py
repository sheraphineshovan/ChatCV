import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
VECTOR_STORE_DIR = BASE_DIR / "data" / "vector_store"
SESSIONS_DIR = BASE_DIR / "data" / "sessions"

# Create directories if they don't exist
VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

# File upload settings
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Model settings
MODEL_NAME = "mistral"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# API settings
API_PREFIX = "/api"
CORS_ORIGINS = ["http://localhost:3000"]

class Settings(BaseSettings):
    # Vector store settings
    VECTOR_STORE_DIR: str = str(VECTOR_STORE_DIR)
    VECTOR_STORE_TYPE: str = "chroma"
    
    # Session settings
    SESSIONS_DIR: str = str(SESSIONS_DIR)
    
    # Embedding model settings
    EMBEDDING_MODEL: str = EMBEDDING_MODEL

    # API Keys
    GROQ_API_KEY: str = "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"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chat_history.db")

    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_here")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# File Upload Configuration
ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS
MAX_FILE_SIZE = MAX_FILE_SIZE
MAX_FILE_SIZE_TEXT = 10 * 1024 * 1024  # 10MB 