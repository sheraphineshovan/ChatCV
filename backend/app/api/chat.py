from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import Optional, Dict
import json
from ..services.rag_chain import conversational_rag_chain
from ..config import Settings
import logging
from starlette.websockets import WebSocketState
import asyncio

router = APIRouter()
logger = logging.getLogger(__name__)

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}

@router.websocket("/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    try:
        # Check if there's an existing connection for this session
        if session_id in active_connections:
            existing_ws = active_connections[session_id]
            if existing_ws.client_state == WebSocketState.CONNECTED:
                logger.info(f"Closing existing connection for session {session_id}")
                await existing_ws.close()
            del active_connections[session_id]

        # Accept the WebSocket connection
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for session {session_id}")
        
        # Store the connection
        active_connections[session_id] = websocket

        # Wait for retriever to be initialized (with timeout)
        max_retries = 5
        retry_delay = 1  # seconds
        
        for attempt in range(max_retries):
            if session_id in conversational_rag_chain.retrievers:
                logger.info(f"Retriever found for session {session_id}")
                break
            logger.info(f"Waiting for retriever initialization (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(retry_delay)
        
        # Check if retriever was initialized
        if session_id not in conversational_rag_chain.retrievers:
            logger.warning(f"No retriever found for session {session_id} after {max_retries} attempts")
            await websocket.send_json({
                "type": "error",
                "content": "No resume data found. Please upload a resume first."
            })
            return
        
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "message": "WebSocket connection established"
        })
        
        # Process messages
        while True:
            try:
                if websocket.client_state != WebSocketState.CONNECTED:
                    break
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if "content" not in message:
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({
                            "type": "error",
                            "content": "Invalid message format"
                        })
                    continue
                
                # Stream response from RAG chain
                async for chunk in conversational_rag_chain.astream(session_id, message["content"]):
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({
                            "type": "assistant",
                            "content": chunk
                        })
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for session {session_id}")
                break
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json({
                        "type": "error",
                        "content": "Invalid message format"
                    })
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json({
                        "type": "error",
                        "content": f"Error processing message: {str(e)}"
                    })
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket handler: {str(e)}")
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json({
                    "type": "error",
                    "content": f"Unexpected error: {str(e)}"
                })
        except:
            pass
    finally:
        # Cleanup
        if session_id in active_connections and active_connections[session_id] == websocket:
            del active_connections[session_id]
        logger.info(f"Cleaned up WebSocket connection for session {session_id}")