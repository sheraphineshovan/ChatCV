from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload, chat, score

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routers
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(score.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Upload-and-Chat with Your Resume API!"}