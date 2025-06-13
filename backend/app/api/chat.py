from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from typing import List
from app.models.chat_history import ChatHistory
from app.utils.session import get_chat_history, save_chat_history
from app.services.rag_chain import conversational_rag_chain

router = APIRouter()

@router.websocket("/chat/{session_id}")
async def websocket_chat_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    chat_history: List[ChatHistory] = get_chat_history(session_id)

    try:
        while True:
            data = await websocket.receive_text()
            user_query = data

            response_stream = conversational_rag_chain.stream({"input": user_query, "chat_history": chat_history})

            async for chunk in response_stream:
                if 'answer' in chunk:
                    await websocket.send_text(chunk['answer'])

            save_chat_history(session_id, user_query, chunk['answer'])

    except WebSocketDisconnect:
        print(f"Client {session_id} disconnected")
    except Exception as e:
        print(f"Error in WebSocket connection for {session_id}: {e}")
        await websocket.close(code=1011)