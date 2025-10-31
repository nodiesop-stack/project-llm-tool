import google.generativeai as genai
import os
from dotenv import load_dotenv

# Tải API key từ file .env
load_dotenv()

print("Đang kết nối đến Google AI Studio...")

try:
    # Cấu hình API key
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    print("\n--- DANH SÁCH CÁC MODEL BẠN CÓ THỂ DÙNG (cho generateContent) ---")

    # Lặp qua danh sách models
    count = 0
    for m in genai.list_models():
        # RẤT QUAN TRỌNG: Kiểm tra xem model có hỗ trợ phương thức 'generateContent' không
        if 'generateContent' in m.supported_generation_methods:
            count += 1
            print(f"\nModel {count}:")
            print(f"  **Tên Model (cần copy): {m.name}**")
            print(f"  Mô tả: {m.description}")

    print("\n--------------------------------------------------------------")
    print(f"Tìm thấy {count} model phù hợp.")
    print("Hãy copy một 'Tên Model' (ví dụ: models/gemini-1.5-pro-latest) và dán vào file llm_services.py.")

except Exception as e:
    print("\n!!! ĐÃ XẢY RA LỖI !!!")
    print("Kiểm tra lại GEMINI_API_KEY trong file .env của bạn. Lỗi chi tiết:")
    print(e)