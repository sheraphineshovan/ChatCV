import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Upload and Chat with Your Resume',
  description: 'Upload your resume and chat with it using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-700 flex flex-col">
        <div className="flex flex-col min-h-screen w-full">
          <header className="bg-transparent text-white p-4 shadow-none">
            <h1 className="text-2xl font-bold drop-shadow-lg">Upload and Chat with Your Resume</h1>
          </header>
          <main className="flex-grow flex items-center justify-center">
            {children}
          </main>
          <footer className="bg-transparent text-white p-4 text-center text-sm drop-shadow-lg">
            <p>&copy; {new Date().getFullYear()} ChatCV</p>
          </footer>
        </div>
      </body>
    </html>
  );
}