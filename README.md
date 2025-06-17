# Upload and Chat with Your Resume

This project allows users to upload their resumes in PDF format and interact with them through a chat interface powered by a Retrieval Augmented Generation (RAG) model. The application is built using FastAPI for the backend and Next.js for the frontend, providing a seamless user experience.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

- **Backend**: Contains the FastAPI application responsible for handling file uploads, processing resumes, and managing chat interactions.
- **Frontend**: Built with Next.js and Tailwind CSS, this directory includes the user interface for uploading resumes and chatting with the AI assistant.

## Quick Start

The project includes batch files for easy startup on Windows:

1. Start the backend server:
   ```bash
   start_backend.bat
   ```

2. Start the frontend development server:
   ```bash
   start_frontend.bat
   ```

## Manual Setup

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI application:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Resume Upload**: Upload and process PDF resumes
- **AI Chat Interface**: Interact with your resume using natural language
- **Modern UI**: Built with Next.js and Tailwind CSS for a responsive design
- **RAG Integration**: Powered by advanced language models for intelligent responses

## Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:3000`
- API documentation available at `http://localhost:8000/docs`

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.