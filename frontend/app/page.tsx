"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from '@/components/ChatInterface';

interface Message {
  type: "user" | "assistant";
  content: string;
}

interface UploadStatus {
  status: "uploading" | "success" | "error";
  progress: number;
}

// Generate a stable sessionId
const generateSessionId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection only after successful upload
  useEffect(() => {
    if (!shouldConnect || !sessionId) return;

    const wsUrl = `ws://localhost:8000/api/chat/${sessionId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setError(null);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "assistant") {
        setMessages((prev) => [...prev, { type: "assistant", content: data.content }]);
      } else if (data.type === "error") {
        setError(data.content);
        if (data.content.includes("No resume data found")) {
          setShouldConnect(false);
          setUploadStatus(null);
        }
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Please try again.");
      setShouldConnect(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId, shouldConnect]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setUploadStatus({ status: "uploading", progress: 0 });

    try {
      // Generate a new session ID for this upload
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`http://localhost:8000/api/upload/${newSessionId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      setUploadStatus({ status: "success", progress: 100 });
      setShouldConnect(true); // Only set shouldConnect to true after successful upload
      setMessages([]); // Clear previous messages
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
      setUploadStatus({ status: "error", progress: 0 });
      setShouldConnect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to chat. Please upload a resume first.");
      return;
    }

    setMessages((prev) => [...prev, { type: "user", content: message }]);
    wsRef.current.send(JSON.stringify({ content: message }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-3xl p-8">
            <FileUpload 
              sessionId={sessionId || ""} 
              onUploadSuccess={handleFileUpload}
              onUploadError={(error: string) => {
                console.error('Upload error:', error);
                setError(error);
                setShouldConnect(false);
                setUploadStatus(null);
              }}
            />
          </div>
          <div className="backdrop-blur-lg bg-white/30 border border-white/40 shadow-2xl rounded-3xl p-8">
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage}
              connected={isConnected && !!sessionId} 
            />
          </div>
        </div>
        {(error || uploadStatus) && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error || uploadStatus?.status === "error" ? uploadStatus?.status : uploadStatus?.progress + "%"}
          </div>
        )}
      </div>
    </main>
  );
}