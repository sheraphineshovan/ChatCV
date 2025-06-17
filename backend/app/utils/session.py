from datetime import datetime
from typing import Dict, Any, List, Optional
import json
import os
from app.config import settings

class SessionManager:
    def __init__(self):
        self.sessions_dir = settings.SESSIONS_DIR
        os.makedirs(self.sessions_dir, exist_ok=True)

    def create_session(self, session_id: str) -> None:
        """Create a new session directory."""
        session_dir = os.path.join(self.sessions_dir, session_id)
        os.makedirs(session_dir, exist_ok=True)
        # Initialize empty chat history
        self.save_chat_history(session_id, [])

    def add_to_chat_history(self, session_id: str, message: Dict[str, Any]) -> None:
        """Add a message to the chat history."""
        history = self.get_chat_history(session_id)
        history.append(message)
        self.save_chat_history(session_id, history)

    def get_chat_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Get the chat history for a session."""
        history_file = os.path.join(self.sessions_dir, session_id, "chat_history.json")
        if not os.path.exists(history_file):
            return []
        try:
            with open(history_file, 'r') as f:
                return json.load(f)
        except:
            return []

    def save_chat_history(self, session_id: str, history: List[Dict[str, Any]]) -> None:
        """Save the chat history for a session."""
        history_file = os.path.join(self.sessions_dir, session_id, "chat_history.json")
        with open(history_file, 'w') as f:
            json.dump(history, f)

    def save_role_criteria(self, session_id: str, role_criteria: Dict[str, Any]) -> None:
        """Save role criteria for a session."""
        criteria_file = os.path.join(self.sessions_dir, session_id, "role_criteria.json")
        with open(criteria_file, 'w') as f:
            json.dump(role_criteria, f)

    def get_role_criteria(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get role criteria for a session."""
        criteria_file = os.path.join(self.sessions_dir, session_id, "role_criteria.json")
        if not os.path.exists(criteria_file):
            return None
        try:
            with open(criteria_file, 'r') as f:
                return json.load(f)
        except:
            return None

    def delete_session(self, session_id: str) -> None:
        """Delete a session and all its data."""
        session_dir = os.path.join(self.sessions_dir, session_id)
        if os.path.exists(session_dir):
            import shutil
            shutil.rmtree(session_dir)

session_manager = SessionManager()

def get_chat_history(session_id: str) -> List[Dict[str, Any]]:
    """Get chat history for a session."""
    return session_manager.get_chat_history(session_id)

def save_chat_history(session_id: str, message: Dict[str, Any]) -> None:
    """Save a message to chat history."""
    session_manager.add_to_chat_history(session_id, message)