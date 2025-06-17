"use client";
import React, { useState, useRef } from "react";

interface FileUploadProps {
    sessionId: string;
    onUploadSuccess: (file: File) => void;
    onUploadError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ sessionId, onUploadSuccess, onUploadError }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            // Validate file type
            const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
            if (!['pdf', 'doc', 'docx'].includes(fileExt || '')) {
                setError('Please upload a PDF or DOC/DOCX file');
                onUploadError('Please upload a PDF or DOC/DOCX file');
                return;
            }
            // Validate file size (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size should be less than 10MB');
                onUploadError('File size should be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setUploadStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            onUploadError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadStatus('Uploading...');
        setProgress(0);

        try {
            // Simulate progress for demo (remove if you have real progress events)
            for (let i = 1; i <= 10; i++) {
                await new Promise((res) => setTimeout(res, 40));
                setProgress(i * 10);
            }
            onUploadSuccess(file);
            setUploadStatus('Upload complete!');
            setProgress(100);
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload file. Please try again.';
            setError(errorMessage);
            onUploadError(errorMessage);
            setUploadStatus(null);
            setProgress(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 flex flex-col items-center transition-all duration-300">
            <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-md mr-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight drop-shadow">Upload Your Resume</h2>
            </div>
            <div className="space-y-6 w-full">
                <div className="relative flex flex-col items-center">
                    <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-white/70 cursor-pointer hover:border-blue-500 transition-colors">
                        <span className="text-blue-600 font-semibold text-base mb-2">{file ? file.name : 'Drag & drop or click to select a file'}</span>
                        <input
                            id="file-upload"
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all text-base shadow-lg ${
                        !file || uploading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl'
                    }`}
                >
                    {uploading ? (
                        <span className="flex flex-col items-center justify-center">
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </span>
                            {progress !== null && (
                                <span className="mt-1 text-xs text-blue-700 font-semibold">{progress}%</span>
                            )}
                        </span>
                    ) : 'Upload'}
                </button>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                )}

                {uploadStatus === 'Upload complete!' && !error && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                        <p className="text-green-600 text-sm font-medium">Upload complete!</p>
                    </div>
                )}

                {uploadStatus === 'Uploading...' && uploading && !error && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-blue-600 text-sm font-medium">Uploading...</p>
                        {progress !== null && (
                            <p className="text-blue-700 text-xs font-semibold mt-1">{progress}%</p>
                        )}
                    </div>
                )}

                {file && !uploading && !error && !uploadStatus && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-blue-600 text-sm font-medium">
                            Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;