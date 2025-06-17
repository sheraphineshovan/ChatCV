import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
    type: 'user' | 'assistant';
    content: string;
}

interface UseWebSocketProps {
    sessionId: string;
    onError?: (error: string) => void;
}

export const useWebSocket = ({ sessionId, onError }: UseWebSocketProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const retryCountRef = useRef(0);
    const isConnectingRef = useRef(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxRetries = 3;
    const baseDelay = 5000;
    const lastConnectionAttemptRef = useRef<number>(0);
    const minTimeBetweenAttempts = 10000;
    const isMountedRef = useRef(true);
    const hasResumeDataRef = useRef(false);

    const cleanup = useCallback(() => {
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
            wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        isConnectingRef.current = false;
    }, []);

    const connectWebSocket = useCallback(() => {
        if (!isMountedRef.current) return;

        // Don't attempt to connect if sessionId is undefined or empty
        if (!sessionId) {
            console.log('No session ID provided, skipping WebSocket connection');
            setError('No session ID provided');
            onError?.('No session ID provided');
            return;
        }

        // Check if we're already connecting or connected
        if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connecting or connected, skipping');
            return;
        }

        // Check if enough time has passed since last connection attempt
        const now = Date.now();
        if (now - lastConnectionAttemptRef.current < minTimeBetweenAttempts) {
            console.log('Too soon since last connection attempt, skipping');
            return;
        }
        lastConnectionAttemptRef.current = now;

        console.log(`Attempting to connect WebSocket for session ${sessionId}`);
        isConnectingRef.current = true;
        
        try {
            const ws = new WebSocket(`ws://localhost:8000/api/chat/${sessionId}`);

            ws.onopen = () => {
                if (!isMountedRef.current) {
                    ws.close();
                    return;
                }
                console.log('WebSocket connected successfully');
                setIsConnected(true);
                setError(null);
                retryCountRef.current = 0;
                isConnectingRef.current = false;
            };

            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received WebSocket message:', data);
                    
                    if (data.type === 'assistant') {
                        setMessages(prev => [...prev, { type: 'assistant', content: data.content }]);
                        // Don't treat assistant messages as errors
                        setError(null);
                        
                        // Check if this is a "no resume" message
                        if (data.content.includes('No resume data found')) {
                            hasResumeDataRef.current = false;
                        } else {
                            hasResumeDataRef.current = true;
                        }
                    } else if (data.type === 'error') {
                        console.error('Received error from server:', data.content);
                        setError(data.content);
                        onError?.(data.content);
                    } else if (data.type === 'connection' && data.status === 'connected') {
                        console.log('Received connection confirmation from server');
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                    setError('Error processing server message');
                    onError?.('Error processing server message');
                }
            };

            ws.onerror = (event) => {
                if (!isMountedRef.current) return;
                console.error('WebSocket error:', event);
                setError('Connection error occurred');
                onError?.('Connection error occurred');
                isConnectingRef.current = false;
            };

            ws.onclose = (event) => {
                if (!isMountedRef.current) return;
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                wsRef.current = null;
                isConnectingRef.current = false;

                // Only attempt to reconnect if:
                // 1. We haven't exceeded max retries
                // 2. We have a valid sessionId
                // 3. The component is still mounted
                // 4. We have resume data (or haven't received a "no resume" message)
                const shouldReconnect = retryCountRef.current < maxRetries && 
                                     sessionId && 
                                     isMountedRef.current &&
                                     hasResumeDataRef.current;

                if (shouldReconnect) {
                    const delay = baseDelay * Math.pow(2, retryCountRef.current);
                    retryCountRef.current += 1;
                    console.log(`Attempting to reconnect in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
                    
                    // Clear any existing timeout
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                    }
                    
                    // Set new timeout
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            connectWebSocket();
                        }
                    }, delay);
                } else {
                    console.log('Max retry attempts reached or no session ID or no resume data');
                    if (hasResumeDataRef.current) {
                        setError('Failed to connect after multiple attempts');
                        onError?.('Failed to connect after multiple attempts');
                    }
                }
            };

            wsRef.current = ws;
        } catch (err) {
            if (!isMountedRef.current) return;
            console.error('Error creating WebSocket:', err);
            setError('Failed to create WebSocket connection');
            onError?.('Failed to create WebSocket connection');
            isConnectingRef.current = false;
        }
    }, [sessionId, onError]);

    // Only attempt to connect when sessionId changes and is valid
    useEffect(() => {
        if (sessionId) {
            console.log('Session ID changed, attempting to connect WebSocket');
            connectWebSocket();
        }

        return () => {
            console.log('Cleaning up WebSocket connection');
            isMountedRef.current = false;
            cleanup();
        };
    }, [sessionId, connectWebSocket, cleanup]);

    const sendMessage = useCallback((content: string) => {
        if (!sessionId) {
            console.log('No session ID available for sending message');
            setError('No session ID available');
            onError?.('No session ID available');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('Sending message:', content);
            wsRef.current.send(JSON.stringify({ content }));
            setMessages(prev => [...prev, { type: 'user', content }]);
        } else {
            console.log('WebSocket not connected, cannot send message');
            setError('Not connected to server');
            onError?.('Not connected to server');
        }
    }, [sessionId, onError]);

    return {
        messages,
        sendMessage,
        isConnected,
        error,
        retryCount: retryCountRef.current
    };
};