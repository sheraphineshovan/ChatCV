# Backend for ChatCV

A FastAPI backend that provides endpoints for uploading resumes, processing them, and enabling AI-powered chat interactions using RAG (Retrieval Augmented Generation).

## Quick Start

1. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`

## Project Structure

- `app/`: Main application code
  - `api/`: API endpoints
  - `services/`: Business logic
  - `models/`: Data models
  - `utils/`: Utility functions
- `data/`: Storage for uploaded files
- `chroma_db/`: Vector database for embeddings

## Features

- PDF resume processing and text extraction
- Vector embeddings for semantic search
- WebSocket-based chat interface
- RAG-powered question answering
- Secure file handling

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

- Built with FastAPI
- Uses ChromaDB for vector storage
- Implements WebSocket for real-time chat
- Includes security measures for file handling

## License

This project is licensed under the MIT License.