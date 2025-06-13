# Upload and Chat with Your Resume

This project allows users to upload their resumes in PDF format and interact with them through a chat interface powered by a Retrieval Augmented Generation (RAG) model. The application is built using FastAPI for the backend and Next.js for the frontend, providing a seamless user experience.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

- **Backend**: Contains the FastAPI application responsible for handling file uploads, processing resumes, and managing chat interactions.
- **Frontend**: Built with Next.js, this directory includes the user interface for uploading resumes and chatting with the AI assistant.

## Setup Instructions

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on the `.env.example` file to configure environment variables.

6. Run the FastAPI application:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the necessary packages:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Usage Guidelines

1. Open your web browser and navigate to `http://localhost:3000` to access the application.
2. Use the file upload interface to upload your resume in PDF format.
3. Once uploaded, you can interact with the AI assistant by typing questions related to your resume in the chat interface.
4. The application will provide responses based on the content of your resume.

## Features

- **File Upload**: Securely upload PDF resumes.
- **Chat Interface**: Engage in a conversation with the AI assistant about your resume.
- **Role-Fit Scoring**: Analyze your resume against specific job criteria to assess suitability.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.