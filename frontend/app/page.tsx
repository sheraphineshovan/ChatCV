"use client";
import React, { useState } from "react";
import FileUpload from "../components/FileUpload";
import ChatBox from "../components/ChatBox";
import RoleFitScore from "../components/RoleFitScore";

// Generate a random sessionId for demonstration
const getSessionId = () => {
    if (typeof window !== "undefined") {
        let id = window.localStorage.getItem("sessionId");
        if (!id) {
            id = Math.random().toString(36).substring(2, 15);
            window.localStorage.setItem("sessionId", id);
        }
        return id;
    }
    return "";
};

const Page = () => {
    const [sessionId] = useState(getSessionId());

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* <h1 className="text-3xl font-bold mb-4">Upload and Chat with Your Resume</h1> */}
            <FileUpload sessionId={sessionId} />
            <ChatBox sessionId={sessionId} />
            <RoleFitScore sessionId={sessionId} />
        </div>
    );
};

export default Page;