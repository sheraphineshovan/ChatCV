from datetime import datetime
from typing import Dict, Any

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session(self, session_id: str) -> None:
        self.sessions[session_id] = {
            "chat_history": [],
            "created_at": datetime.now()
        }

    def add_to_chat_history(self, session_id: str, message: str) -> None:
        if session_id in self.sessions:
            self.sessions[session_id]["chat_history"].append(message)

    def get_chat_history(self, session_id: str) -> list:
        return self.sessions.get(session_id, {}).get("chat_history", [])

    def delete_session(self, session_id: str) -> None:
        if session_id in self.sessions:
            del self.sessions[session_id]

session_manager = SessionManager()

def get_chat_history(session_id: str) -> list:
    return session_manager.get_chat_history(session_id)

def save_chat_history(session_id: str, message: str) -> None:
    session_manager.add_to_chat_history(session_id, message)