import React, { useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/process-stream';

// --- Văn bản đa ngôn ngữ (bao gồm 3 model) ---
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
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('gemini'); // Mặc định là Gemini

  const t = langStrings[language];

  const toggleLanguage = () => {
    setLanguage(lang => (lang === 'en' ? 'vi' : 'en'));
  };

  const handleTaskClick = async (task) => {
    if (!text) {
      setError(t.error_no_text);
      setResult('');
      return;
    }

    setIsLoading(true);
    setResult(''); 
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          text: text,
          task: task,
          language: language,
          model: model // Gửi model đang được chọn
        }),
      });

      if (!response.body) throw new Error("Response body is empty.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; 
        
        const chunk = decoder.decode(value, { stream: true });
        setResult((prevResult) => prevResult + chunk);
      }

    } catch (err) {
      console.error('Lỗi khi gọi API stream:', err);
      setError(t.error_connect);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="app-container">
      <div className="app-header">
        <h1>{t.title}</h1>
        <button onClick={toggleLanguage} className="lang-toggle-btn">
          {t.lang_toggle}
        </button>
      </div>
      
      {/* --- DROPDOWN CHỌN MODEL --- */}
      <div>
        <label htmlFor="model-select">{t.model_select_label} </label>
        <select
          id="model-select"
          className="model-selector"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gemini">{t.models.gemini}</option> 
          <option value="openai">{t.models.openai}</option>
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
      />
      
      <div className="button-group">
        {taskKeys.map((taskKey) => (
          <button
            key={taskKey}
            onClick={() => handleTaskClick(taskKey)}
            disabled={isLoading}
          >
            {t.tasks[taskKey]}
          </button>
        ))}
      </div>
      
      {isLoading && <div className="loading">{t.processing}</div>}
      {error && <div className="error">{error}</div>}
      
      {(result || isLoading) && (
        <div className="result-box">
          <h3>{t.result_title}</h3>
          <p>{result}{isLoading && '...'}</p>
        </div>
      )}
    </div>
  );
}

export default App;