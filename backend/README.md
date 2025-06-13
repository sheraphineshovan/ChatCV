# Backend for Upload-and-Chat with Your Resume

This backend application is built using FastAPI and provides endpoints for uploading resumes, chatting with the uploaded content, and calculating role-fit scores.

## Project Structure

- **app/**: Contains the main application code.
  - **api/**: Contains the API endpoint implementations.
    - **upload.py**: Handles file uploads and processing.
    - **chat.py**: Manages WebSocket interactions for chatting with the resume.
    - **score.py**: Calculates the role-fit score based on the resume content.
  - **services/**: Contains business logic and services.
    - **file_processing.py**: Functions for processing uploaded files and extracting text.
    - **vector_store.py**: Manages the vector store for embeddings.
    - **rag_chain.py**: Implements the RAG chain for question answering.
    - **scoring.py**: Functions for analyzing resumes and calculating scores.
  - **models/**: Contains data models used in the application.
    - **chat_history.py**: Defines the model for storing chat history.
  - **utils/**: Utility functions for various tasks.
    - **security.py**: Functions for file sanitization and security checks.
    - **session.py**: Manages user session data.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd upload-and-chat-with-your-resume/backend
   ```

2. **Create a Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Copy the `.env.example` to `.env` and fill in the required variables.

5. **Run the Application**
   ```bash
   uvicorn app.main:app --reload
   ```

## Usage Guidelines

- **Upload Resume**: Send a POST request to `/upload/` with the PDF file.
- **Chat with Resume**: Establish a WebSocket connection to `/chat/{session_id}` to interact with the uploaded resume.
- **Calculate Role-Fit Score**: Send a request to `/score/` with the necessary parameters to get the score based on the resume content.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.