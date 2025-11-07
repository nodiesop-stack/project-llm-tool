# /backend/llm_services.py
import os
import httpx
import google.generativeai as genai
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
load_dotenv()

# --- Cấu hình API ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3") # Mặc định là llama3 nếu không set
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # <-- Lấy key mới

# Cấu hình Gemini
genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-flash-latest')

# Cấu hình DeepSeek (dùng client của OpenAI)
deepseek_client = AsyncOpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com/v1"
)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
# Khởi tạo HTTP client (dùng chung)
http_client = httpx.AsyncClient(timeout=30.0)


# --- Các hàm gọi API ---

async def get_gemini_response(prompt: str) -> str:
    """Gọi API Gemini"""
    try:
        response = await gemini_model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"Lỗi Gemini: {e}")
        return f"Lỗi khi gọi Gemini: {str(e)}"

async def get_deepseek_response(prompt: str) -> str:
    """Gọi API DeepSeek"""
    try:
        chat_completion = await deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}]
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Lỗi DeepSeek: {e}")
        return f"Lỗi khi gọi DeepSeek: {str(e)}"

async def get_ollama_response(prompt: str) -> str:
    """Gọi API Ollama (local)"""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False # Tắt stream để nhận kết quả 1 lần
        }
        response = await http_client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
        response.raise_for_status() # Báo lỗi nếu status code là 4xx hoặc 5xx
        
        # Phân tích response của Ollama
        json_response = response.json()
        return json_response.get("response", "Không nhận được phản hồi từ Ollama.")
        
    except httpx.ConnectError as e:
        print(f"Lỗi Ollama: Không thể kết nối. Ollama server đã chạy chưa? {e}")
        return f"Lỗi: Không thể kết nối đến Ollama server tại {OLLAMA_BASE_URL}. Hãy đảm bảo Ollama đang chạy."
    except Exception as e:
        print(f"Lỗi Ollama: {e}")
        return f"Lỗi khi gọi Ollama: {str(e)}"

async def get_gpt_response(prompt: str) -> str:
    """Gọi API OpenAI (GPT)"""
    try:
        chat_completion = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo", # Bạn có thể đổi sang "gpt-4" nếu muốn
            messages=[{"role": "user", "content": prompt}]
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        # Xử lý lỗi xác thực (API key sai hoặc hết tiền)
        if "401" in str(e):
            return "Lỗi khi gọi OpenAI (GPT): Sai API Key hoặc hết tín dụng (401)."
        print(f"Lỗi OpenAI: {e}")
        return f"Lỗi khi gọi OpenAI (GPT): {str(e)}"