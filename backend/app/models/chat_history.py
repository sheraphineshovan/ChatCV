from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    user_message: str
    ai_response: str
    timestamp: str

class ChatHistory(BaseModel):
    session_id: str
    messages: List[ChatMessage] = []
    
    def add_message(self, user_message: str, ai_response: str, timestamp: str):
        self.messages.append(ChatMessage(user_message=user_message, ai_response=ai_response, timestamp=timestamp))