"use client";
import React, { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

type ChatMessage = {
    text: string;
    from: "User" | "AI";
};

interface ChatBoxProps {
    sessionId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ sessionId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const { sendMessage, messages: wsMessages } = useWebSocket(`ws://localhost:8000/chat/${sessionId}`);

    useEffect(() => {
        if (wsMessages.length > 0) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: wsMessages[wsMessages.length - 1], from: "AI" },
            ]);
        }
    }, [wsMessages]);

    const handleSend = () => {
        if (input.trim()) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: input, from: "User" },
            ]);
            sendMessage(input);
            setInput("");
        }
    };

    return (
        <div className="chatbox">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.from === "User" ? "user-message" : "ai-message"}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="input"
            />
            <button onClick={handleSend} className="send-button">
                Send
            </button>
        </div>
    );
};

export default ChatBox;