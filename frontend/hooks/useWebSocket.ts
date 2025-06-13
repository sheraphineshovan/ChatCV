import { useEffect, useRef, useState } from 'react';

const useWebSocket = (sessionId: string) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/chat/${sessionId}`);

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event: MessageEvent) => {
            const newMessage = event.data;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        ws.onerror = (event: Event) => {
            setError('WebSocket error');
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        socketRef.current = ws;

        return () => {
            ws.close();
        };
    }, [sessionId]);

    const sendMessage = (message: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.send(message);
        }
    };

    return { messages, sendMessage, error, isConnected };
};

export default useWebSocket;