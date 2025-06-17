from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, upload
import logging
import uvicorn
from starlette.websockets import WebSocketState
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class WebSocketMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/chat/"):
            # For WebSocket connections, we need to handle them differently
            if request.headers.get("upgrade", "").lower() == "websocket":
                logger.info(f"WebSocket connection attempt to {request.url.path}")
                return await call_next(request)
        return await call_next(request)

# Add WebSocket middleware
app.add_middleware(WebSocketMiddleware)

# Include routers
app.include_router(upload.router, tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Welcome to ChatCV API"}

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up ChatCV API server...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down ChatCV API server...")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ws="auto"  # Enable WebSocket support
    )