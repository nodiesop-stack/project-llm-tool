# 🚀 Dự án: Công cụ LLM Đa năng

Đây là một ứng dụng web single-page (SPA) cho phép người dùng thực thi nhiều tác vụ ngôn ngữ khác nhau bằng cách sử dụng API của mô hình ngôn ngữ lớn (LLM).

## ✨ Tính năng

* Tóm tắt văn bản
* Dịch sang tiếng Pháp
* Giải thích như cho trẻ 5 tuổi
* Trích xuất từ khóa
* Tạo code Python

## 🛠️ Công nghệ sử dụng

* **Frontend:** React (Vite) + Axios
* **Backend:** Python 3.10+ với FastAPI
* **LLM API:** OpenAI (GPT-3.5-Turbo)

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
3.  **Quan trọng**: Chạy lệnh sau để khởi tạo dự án React (chọn `React` -> `JavaScript`):
    ```bash
    npm create vite@latest .
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