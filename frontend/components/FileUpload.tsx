"use client";
import React, { useState } from "react";

interface FileUploadProps {
    sessionId: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ sessionId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file to upload.");
            return;
        }

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);
        // Optionally, include sessionId if your backend expects it:
        // formData.append("sessionId", sessionId);

        try {
            const response = await fetch("/api/upload/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`File uploaded successfully: ${data.filename}`);
            } else {
                setMessage("File upload failed. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred during file upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
                {uploading ? "Uploading..." : "Upload Resume"}
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
    );
};

export default FileUpload;