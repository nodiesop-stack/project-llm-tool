# /backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio

# Import các Pydantic model và các hàm service
from models import ChatRequest, ChatResponse
import llm_services as llm

# Khởi tạo app FastAPI
app = FastAPI()

# --- Cấu hình CORS ---
# Đây là bước BẮT BUỘC để React frontend (ví dụ: localhost:5173)
# có thể gọi API backend (ví dụ: localhost:8000)
origins = [
    "http://localhost:5173",  # Port mặc định của Vite
    "http://localhost:3000",  # Port mặc định của Create React App
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả methods (POST, GET, v.v.)
    allow_headers=["*"],  # Cho phép tất cả headers
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với NLP API!"}

@app.post("/api/chat", response_model=List[ChatResponse])
async def handle_chat(request: ChatRequest):
    """
    Endpoint chính xử lý chat, nhận prompt và một DANH SÁCH các model
    """
    prompt = request.prompt
    models_to_query = request.models # Đây là một danh sách, ví dụ: ["Gemini", "GPT"]
    responses = []
    
    tasks = []
    model_names_in_order = [] # Để đảm bảo thứ tự phản hồi

    for model_name in models_to_query:
        if model_name == "Gemini":
            tasks.append(llm.get_gemini_response(prompt))
            model_names_in_order.append("Gemini")
        elif model_name == "DeepSeek":
            tasks.append(llm.get_deepseek_response(prompt))
            model_names_in_order.append("DeepSeek")
        elif model_name == "Ollama":
            tasks.append(llm.get_ollama_response(prompt))
            model_names_in_order.append("Ollama")
        elif model_name == "GPT":
            tasks.append(llm.get_gpt_response(prompt)) # <-- Thêm GPT
            model_names_in_order.append("GPT")
    
    # Nếu không có model hợp lệ nào
    if not tasks:
        raise HTTPException(status_code=400, detail="Không có model hợp lệ nào được chọn.")

    # Chạy tất cả các tác vụ song song
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Thu thập kết quả
    for i, res in enumerate(results):
        model = model_names_in_order[i]
        if isinstance(res, Exception):
            responses.append(ChatResponse(model=model, text=str(res), error=True))
        else:
            responses.append(ChatResponse(model=model, text=res, error=False))

    return responses

# Mở terminal trong thư mục /backend
# Chạy lệnh:
# uvicorn main:app --reload
#
# Server sẽ chạy tại: http://127.0.0.1:8000