# Frontend for Upload-and-Chat with Your Resume

This project is a web application that allows users to upload their resumes and interact with them through a chat interface. The application is built using Next.js for the frontend and FastAPI for the backend.

## Getting Started

To get started with the frontend, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd upload-and-chat-with-your-resume/frontend
   ```

2. **Install Dependencies:**
   Make sure you have Node.js installed. Then, run the following command to install the necessary packages:
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## File Structure

- `app/`: Contains the main application files, including pages and global styles.
- `components/`: Contains reusable React components such as file upload and chat interfaces.
- `hooks/`: Contains custom hooks for managing WebSocket connections.
- `public/`: Directory for static assets.
- `tailwind.config.js`: Configuration file for Tailwind CSS.
- `package.json`: Lists the dependencies and scripts for the frontend application.
- `tsconfig.json`: TypeScript configuration file.

## Features

- **Resume Upload:** Users can upload their resumes in PDF format.
- **Chat Interface:** Users can interact with the AI assistant to ask questions about their resumes.
- **Role-Fit Score:** Users can receive a score based on how well their resume matches a specified job role.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.