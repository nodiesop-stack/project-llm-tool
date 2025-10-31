from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Import CẢ BA hàm streaming
from llm_services import (
    get_openai_streaming_response, 
    get_ollama_streaming_response,
    get_gemini_streaming_response
)

app = FastAPI()

# --- CẤU HÌNH CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODEL DỮ LIỆU ---
class ProcessRequest(BaseModel):
    text: str
    task: str
    language: str 
    model: str # 'openai', 'ollama', hoặc 'gemini'

# --- PROMPTS ĐA NGÔN NGỮ ---
TASK_INSTRUCTIONS = {
    "en": {
        "summarize": "Summarize the following text concisely:",
        "translate_french": "Translate the following text to French:",
        "explain_eili5": "Explain the following concept as if you were talking to a 5-year-old child:",
        "extract_keywords": "List the most important keywords from the following text, separated by commas:",
        "generate_python": "Write a Python code snippet based on the following request:"
    },
    "vi": {
        "summarize": "Tóm tắt văn bản sau đây một cách ngắn gọn và súc tích:",
        "translate_french": "Dịch văn bản sau đây sang tiếng Pháp:",
        "explain_eili5": "Giải thích nội dung sau đây như thể bạn đang nói với một đứa trẻ 5 tuổi:",
        "extract_keywords": "Liệt kê các từ khóa (keywords) quan trọng nhất từ văn bản sau, cách nhau bằng dấu phẩy:",
        "generate_python": "Viết một đoạn code Python dựa trên yêu cầu sau đây:"
    }
}

# --- API ENDPOINT ---
@app.post("/api/process-stream")
async def process_text_stream(request: ProcessRequest):
    instruction = TASK_INSTRUCTIONS.get(request.language, TASK_INSTRUCTIONS["en"]).get(request.task)
    
    if not instruction:
        async def error_generator():
            yield "Lỗi: Tác vụ (task) không hợp lệ"
        return StreamingResponse(error_generator(), media_type="text/event-stream")
            
    # --- BỘ CHUYỂN MẠCH MODEL ---
    if request.model == 'ollama':
        response_generator = get_ollama_streaming_response(request.text, instruction)
    elif request.model == 'openai':
        response_generator = get_openai_streaming_response(request.text, instruction)
    elif request.model == 'gemini':
        response_generator = get_gemini_streaming_response(request.text, instruction)
    else:
        async def error_generator():
            yield "Lỗi: Model không hợp lệ"
        return StreamingResponse(error_generator(), media_type="text/event-stream")
    
    return StreamingResponse(response_generator, media_type="text/event-stream")

@app.get("/")
def read_root():
    return {"message": "LLM Tool Backend is running (3 Models: OpenAI + Ollama + Gemini)!"}