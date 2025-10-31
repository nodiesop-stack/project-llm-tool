// Mở file frontend/src/App.jsx và THAY THẾ toàn bộ nội dung

import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/process-stream';

// --- Văn bản đa ngôn ngữ (giữ nguyên) ---
const langStrings = {
  en: {
    title: "Multi-Purpose LLM Tool",
    placeholder: "Enter your text here...",
    tasks: {
      summarize: "Summarize",
      translate_french: "Translate to French",
      explain_eili5: "Explain Like I'm 5",
      extract_keywords: "Extract Keywords",
      generate_python: "Generate Python Code",
    },
    processing: "Processing...",
    result_title: "Result:",
    error_no_text: "Please enter some text first.",
    error_connect: "Failed to connect to server. Is the backend running?",
    lang_toggle: "🇻🇳 Tiếng Việt",
    model_select_label: "Select Model:",
    models: {
      openai: "OpenAI (GPT-3.5)",
      ollama: "Local (Llama 3)",
      gemini: "Gemini (1.5 Flash)" 
    }
  },
  vi: {
    title: "Công cụ LLM Đa năng",
    placeholder: "Nhập văn bản của bạn vào đây...",
    tasks: {
      summarize: "Tóm tắt",
      translate_french: "Dịch sang tiếng Pháp",
      explain_eili5: "Giải thích như trẻ 5 tuổi",
      extract_keywords: "Trích xuất từ khóa",
      generate_python: "Tạo code Python",
    },
    processing: "Đang xử lý...",
    result_title: "Kết quả:",
    error_no_text: "Vui lòng nhập văn bản trước.",
    error_connect: "Không thể kết nối máy chủ. Backend đã chạy chưa?",
    lang_toggle: "🇬🇧 English",
    model_select_label: "Chọn Model:",
    models: {
      openai: "OpenAI (GPT-3.5)",
      ollama: "Miễn phí (Llama 3)",
      gemini: "Miễn phí (Gemini)" 
    }
  }
};

const taskKeys = [
  'summarize', 
  'translate_french', 
  'explain_eili5', 
  'extract_keywords', 
  'generate_python'
];

function App() {
  const [language, setLanguage] = useState('vi');
  const [text, setText] = useState('');
  
  // --- THAY ĐỔI STATE: Từ 'result' (string) sang 'messages' (array) ---
  const [messages, setMessages] = useState([]); // Mảng lưu lịch sử chat
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('gemini'); 

  const t = langStrings[language];
  
  // Dùng để tự động cuộn xuống message mới nhất
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]); // Cuộn khi có message mới hoặc đang tải

  const toggleLanguage = () => {
    setLanguage(lang => (lang === 'en' ? 'vi' : 'en'));
  };

  // --- CẬP NHẬT LOGIC HANDLECLICK ---
  const handleTaskClick = async (task) => {
    if (!text) {
      setError(t.error_no_text);
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Tạo 2 ID duy nhất cho tin nhắn user và tin nhắn bot
    const userMessageId = Date.now();
    const botMessageId = Date.now() + 1;
    
    // Lấy tên tác vụ
    const taskName = t.tasks[task];
    
    // Tạo tin nhắn của user
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      content: `**${taskName}**:\n${text}` // Thêm tên tác vụ vào tin nhắn
    };
    
    // Tạo tin nhắn "rỗng" của bot (để chuẩn bị stream vào)
    const botMessage = {
      id: botMessageId,
      sender: 'bot',
      content: '' // Bắt đầu rỗng
    };
    
    // Thêm cả 2 tin nhắn vào lịch sử chat
    setMessages(prevMessages => [...prevMessages, userMessage, botMessage]);
    
    // Xóa text trong ô input
    setText('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({
          text: text, // Gửi nội dung text gốc
          task: task, // Gửi key của tác vụ (VD: 'summarize')
          language: language,
          model: model 
        }),
      });

      if (!response.body) throw new Error("Response body is empty.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; 
        
        const chunk = decoder.decode(value, { stream: true });
        
        // --- LOGIC STREAM MỚI ---
        // Tìm message của bot theo ID và "bơm" (append) chunk mới vào
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: msg.content + chunk } 
              : msg
          )
        );
      }

    } catch (err) {
      console.error('Lỗi khi gọi API stream:', err);
      // Hiển thị lỗi trong tin nhắn của bot
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, content: `*${t.error_connect}*` } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Chúng ta thay đổi bố cục một chút
    <div className="app-layout">
      
      {/* KHUNG CHAT (kết quả) */}
      <div className="chat-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="avatar">
              {message.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div 
              className="message-content" 
              // Dùng 'dangerouslySetInnerHTML' để render **Bold** (Markdown)
              dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />') 
              }} 
            />
          </div>
        ))}
        
        {/* "Giữ chỗ" khi bot đang gõ */}
        {isLoading && (
          <div className="message bot loading-indicator">
            <div className="avatar">🤖</div>
            <div className="message-content">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        {/* Thẻ div rỗng để tự động cuộn */}
        <div ref={chatEndRef}></div>
      </div>
      
      {/* KHUNG INPUT (nhập liệu) */}
      <div className="input-container">
        {error && <div className="error-banner">{error}</div>}

        <div className="config-bar">
          <label htmlFor="model-select">{t.model_select_label} </label>
          <select
            id="model-select"
            className="model-selector"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gemini">{t.models.gemini}</option> 
            <option value="ollama">{t.models.ollama}</option>
            <option value="openai">{t.models.openai}</option>
          </select>
          <button onClick={toggleLanguage} className="lang-toggle-btn">
            {t.lang_toggle}
          </button>
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          rows={5} // Giảm số hàng
        />
        
        <div className="button-group">
          {taskKeys.map((taskKey) => (
            <button
              key={taskKey}
              onClick={() => handleTaskClick(taskKey)}
              disabled={isLoading || !text} // Tắt nút nếu đang tải hoặc không có text
            >
              {t.tasks[taskKey]}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;