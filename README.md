# 🚀 Dự án: Công cụ LLM Đa năng

Đây là một ứng dụng web single-page (SPA) cho phép người dùng thực thi nhiều tác vụ ngôn ngữ khác nhau bằng cách sử dụng API của mô hình ngôn ngữ lớn (LLM).

## ✨ Tính năng

* So sánh đa mô hình: Gửi cùng một prompt đến nhiều LLM (GPT, Gemini, DeepSeek, Ollama) và so sánh trực tiếp kết quả.

* Lựa chọn linh hoạt: Cho phép người dùng chọn một hoặc nhiều mô hình để thực thi yêu cầu.

* Đề xuất tác vụ thông minh: Tự động đề xuất các hành động (Tóm tắt, Viết code, v.v.) dựa trên nội dung người dùng nhập vào (hỗ trợ cả tiếng Việt và tiếng Anh).

## 🛠️ Công nghệ sử dụng

* **Frontend:** React (Vite) + Axios
* **Backend:** Python 3.10+ với FastAPI
* **LLM API đa nền tảng:** 
* OpenAI (GPT-3.5-Turbo, GPT-4)
* Google (Gemini)
* DeepSeek
* Ollama
## 📦 Hướng dẫn Cài đặt & Chạy dự án

Bạn sẽ cần chạy 2 terminal song song: một cho Backend và một cho Frontend.

### 1. Backend (FastAPI)

1.  Di chuyển vào thư mục `backend`:
    ```bash
    cd backend
    ```
2.  Tạo môi trường ảo và kích hoạt:
    ```bash
    python -m venv venv
    source venv/bin/activate  # (Hoặc .\venv\Scripts\activate trên Windows)
    ```
3.  Cài đặt các thư viện:
    ```bash
    pip install -r requirements.txt
    ```
4.  Tạo file `.env` từ file mẫu:
    ```bash
    cp .env.example .env
    ```
5.  Mở file `.env` và dán API Key của OpenAI vào:
    ```
    OPENAI_API_KEY="sk-..."
    ```
6.  Chạy máy chủ backend:
    ```bash
    uvicorn main:app --reload
    ```
    * Máy chủ sẽ chạy tại `http://127.0.0.1:8000`

### 2. Frontend (React)

1.  Mở một **Terminal mới**.
2.  Di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```
    ```
4.  Cài đặt các gói node:
    ```bash
    npm install
    ```
5.  Cài đặt axios:
    ```bash
    npm install axios
    ```
7.  Chạy ứng dụng React:
    ```bash
    npm run dev
    ```
    * Ứng dụng sẽ chạy tại `http://localhost:5173`.