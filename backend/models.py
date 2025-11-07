# /backend/models.py
from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    """
    Cấu trúc data frontend gửi lên
    """
    prompt: str
    models: List[str] # Phải khớp với tên ở frontend: 'Gemini', 'Ollama', 'DeepSeek', 'compare'

class ChatResponse(BaseModel):
    """
    Cấu trúc data backend trả về
    """
    model: str
    text: str
    error: bool = False