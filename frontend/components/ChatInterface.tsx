"use client";
import React, { useState, useRef, useEffect, UIEvent } from 'react';

interface Message {
    type: 'user' | 'assistant' | 'error';
    content: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    connected: boolean;
}

const PAGE_SIZE = 20;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, connected }) => {
    const [input, setInput] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isAtTop, setIsAtTop] = useState(false);

    // Scroll to bottom when new messages arrive (unless user is scrolling up)
    useEffect(() => {
        if (!isAtTop) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isAtTop]);

    // Reset visibleCount when new messages arrive
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [messages.length]);

    // Infinite scroll: load more messages when scrolled to top
    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const top = e.currentTarget.scrollTop;
        setIsAtTop(top === 0);
        if (top === 0 && visibleCount < groupMessages(messages).length) {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, groupMessages(messages).length));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && connected && !isProcessing) {
            setIsProcessing(true);
            try {
                await onSendMessage(input.trim());
                setInput('');
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Group consecutive assistant messages into a single bubble
    function groupMessages(messages: Message[]) {
        if (messages.length === 0) return [];
        const grouped: { type: Message['type']; content: string }[] = [];
        let buffer = '';
        let lastType = messages[0].type;
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.type === 'assistant') {
                if (lastType === 'assistant') {
                    buffer += (buffer ? ' ' : '') + msg.content;
                } else {
                    if (buffer) grouped.push({ type: lastType, content: buffer });
                    buffer = msg.content;
                    lastType = 'assistant';
                }
            } else if (msg.type === 'error') {
                if (buffer) grouped.push({ type: lastType, content: buffer });
                grouped.push({ type: 'error', content: msg.content });
                buffer = '';
                lastType = 'user';
            } else {
                if (lastType === 'user') {
                    buffer += (buffer ? '\n' : '') + msg.content;
                } else {
                    if (buffer) grouped.push({ type: lastType, content: buffer });
                    buffer = msg.content;
                    lastType = 'user';
                }
            }
        }
        if (buffer) grouped.push({ type: lastType, content: buffer });
        return grouped;
    }

    // Group first, then paginate for infinite scroll
    const groupedMessages = groupMessages(messages);
    const visibleGroupedMessages = groupedMessages.slice(-visibleCount);

    return (
        <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 h-[600px] flex flex-col glassmorphism transition-all duration-300">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-200/40 via-purple-100/40 to-indigo-200/40 rounded-t-3xl flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight drop-shadow">Chat with Your Resume</h2>
                    <div className="flex items-center mt-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-2 border-2 border-white`}></div>
                        <span className="text-xs font-semibold text-gray-600">
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
                <div className="hidden md:block">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="url(#paint0_linear)" fillOpacity="0.7"/>
                        <defs>
                            <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#6366F1"/>
                                <stop offset="1" stopColor="#A5B4FC"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-white/40 via-blue-50/30 to-purple-50/30 rounded-b-3xl custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {groupedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-center text-lg font-medium">
                            {connected 
                                ? "Ask me anything about your resume!"
                                : "Please upload your resume to start chatting"}
                        </p>
                    </div>
                ) : (
                    <>
                        {visibleCount < groupedMessages.length && (
                            <div className="flex justify-center mb-2">
                                <button
                                    className="px-4 py-1 rounded-full bg-white/70 text-blue-700 text-xs shadow border border-blue-200 hover:bg-blue-100/80 transition"
                                    onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, groupedMessages.length))}
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                        {visibleGroupedMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex w-full ${
                                    message.type === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {message.type !== 'user' && (
                                    <div className="flex-shrink-0 mr-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-400 flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z" /></svg>
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl p-5 shadow-lg whitespace-pre-wrap text-base font-medium transition-all duration-200 ${
                                        message.type === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-br-3xl rounded-tr-3xl'
                                            : message.type === 'error'
                                            ? 'bg-red-50/80 text-red-700 border border-red-200'
                                            : 'bg-white/80 text-gray-800 border border-gray-100/60 rounded-bl-3xl rounded-tl-3xl'
                                    }`}
                                >
                                    {message.content}
                                </div>
                                {message.type === 'user' && (
                                    <div className="flex-shrink-0 ml-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/20 bg-white/60 rounded-b-3xl">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={connected ? "Type your message..." : "Please upload your resume first"}
                        className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 text-base shadow-sm"
                        disabled={!connected || isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={!connected || !input.trim() || isProcessing}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all text-base shadow-lg ${
                            connected && input.trim() && !isProcessing
                                ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface; 