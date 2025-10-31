import os
from openai import OpenAI
from dotenv import load_dotenv
import ollama 
import google.generativeai as genai

# Tải biến môi trường
load_dotenv()

# --- CẤU HÌNH CLIENT OPENAI ---
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    print(f"Lỗi khi khởi tạo OpenAI client: {e}")
    client = None

# --- CẤU HÌNH CLIENT GEMINI ---
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel('gemini-flash-latest')
except Exception as e:
    print(f"Lỗi khi khởi tạo Gemini client: {e}")
    gemini_model = None

# --- HÀM GỌI OPENAI ---
def get_openai_streaming_response(user_text: str, instruction: str):
    if not client:
        yield "Lỗi: OpenAI client chưa được khởi tạo. Kiểm tra API key."
        return
    full_prompt = f"{instruction}\n\nĐây là văn bản: \"{user_text}\""
    try:
        stream = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": full_prompt}
            ],
            stream=True,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except Exception as e:
        print(f"Lỗi khi gọi API OpenAI: {e}")
        yield f"Đã xảy ra lỗi: {e}"


# --- HÀM GỌI OLLAMA ---
def get_ollama_streaming_response(user_text: str, instruction: str):
    full_prompt = f"{instruction}\n\nĐây là văn bản: \"{user_text}\""
    try:
        stream = ollama.chat(
            model='llama3:8b',
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý hữu ích."},
                {"role": "user", "content": full_prompt}
            ],
            stream=True,
        )
        for chunk in stream:
            if chunk['message']['content'] is not None:
                yield chunk['message']['content']
    except Exception as e:
        print(f"Lỗi khi gọi API Ollama: {e}")
        yield f"Đã xảy ra lỗi: {e}. (Bạn đã cài Ollama và chạy 'ollama pull llama3:8b' chưa?)"

# --- HÀM GỌI GEMINI ---
def get_gemini_streaming_response(user_text: str, instruction: str):
    if not gemini_model:
        yield "Lỗi: Gemini client chưa được khởi tạo. Kiểm tra API key."
        return

    full_prompt = f"{instruction}\n\nĐây là văn bản: \"{user_text}\""
    
    try:
        response_stream = gemini_model.generate_content(
            full_prompt,
            stream=True
        )
        
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Lỗi khi gọi API Gemini: {e}")
        yield f"Đã xảy ra lỗi: {e}. (API Key của Gemini đúng chưa?)"