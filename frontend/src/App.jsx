import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import SuggestionBar from './components/SuggestionBar';
import InputArea from './components/InputArea';
import './index.css'; // Đã import file CSS mới

// ... (Giữ nguyên các hàm callRealApi, v.v.) ...
// (Lưu ý: Bạn cần dán lại các hàm callRealApi, handleSubmit, v.v. từ trước)

// URL của backend FastAPI
const API_BASE_URL = 'http://127.0.0.1:8000';


// KIỂM TRA HÀM NÀY TRONG App.jsx

const callRealApi = async (prompt, modelsArray) => { // Nhận vào một MẢNG
  console.log(`Calling REAL API for:`, modelsArray);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      prompt: prompt,
      models: modelsArray, // <-- PHẢI LÀ 'models' (SỐ NHIỀU)
    });
    return response.data;
  } catch (error) {
    // ... (logic xử lý lỗi của bạn)
    console.error(`Error calling API:`, error);
    let errorMessage = "Lỗi không xác định";
    if (error.response) {
      errorMessage = error.response.data.detail || JSON.stringify(error.response.data);
    } else if (error.request) {
      errorMessage = "Không thể kết nối đến backend. Backend server (Uvicorn) đã chạy chưa?";
    } else {
      errorMessage = error.message;
    }
    
    return modelsArray.map(modelName => ({
        model: modelName, 
        text: `API Error: ${errorMessage}`, 
        error: true 
    }));
  }
};
function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      model: 'System',
      text: "Chào mừng bạn! Đây là ứng dụng demo . Hãy nhập một đoạn văn bản hoặc một yêu cầu. Hệ thống sẽ phân tích và đề xuất các tác vụ phù hợp.",
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [selectedModels, setSelectedModels] = useState({
    GPT: true,      // Mặc định chọn GPT
    Gemini: true,   // Mặc định chọn Gemini
    DeepSeek: false,
    Ollama: false,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ... (Giữ nguyên useEffect cập nhật suggestions) ...
  useEffect(() => {
    const text = userInput.toLowerCase();

    const suggestionsMap = new Map();

    const textProcessingKeywords = ['tóm tắt', 'ý chính', 'trích xuất', 'từ khóa'];
    if (text.length > 30 || textProcessingKeywords.some(k => text.includes(k))) {
      suggestionsMap.set('Summarize', { action: 'Summarize', label: 'Tóm tắt' });
      suggestionsMap.set('Extract Keywords', { action: 'Extract Keywords', label: 'Trích xuất từ khóa' });
    }

    const codeKeywords = ['code', 'function', 'hàm', 'viết mã', 'lập trình', 'python', 'javascript', 'js', 'py'];
    if (codeKeywords.some(k => text.includes(k))) {
      suggestionsMap.set('Generate Python Code', { action: 'Generate Python Code', label: 'Viết code Python' });
      suggestionsMap.set('Generate JavaScript Code', { action: 'Generate JavaScript Code', label: 'Viết code JavaScript' });
    }

    const explainKeywords = ['là gì', 'explain', 'giải thích', 'định nghĩa', 'thế nào là'];
    if (text.length > 5 && explainKeywords.some(k => text.includes(k))) {
      suggestionsMap.set("Explain Like I'm 5", { action: "Explain Like I'm 5", label: "Giải thích (cho trẻ 5 tuổi)" });
    }

    const translateKeywords = ['dịch', 'translate', 'sang tiếng', 'bằng tiếng'];
    if (translateKeywords.some(k => text.includes(k))) {
      suggestionsMap.set('Translate to French', { action: 'Translate to French', label: 'Dịch sang tiếng Pháp' });
      suggestionsMap.set('Translate to English', { action: 'Translate to English', label: 'Dịch sang tiếng Anh' });
    }

    setSuggestions(Array.from(suggestionsMap.values()));

  }, [userInput]);

  const addMessage = (sender, text, model = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      text,
      model,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };
  const handleModelToggle = (modelId) => {
    setSelectedModels(prevSelectedModels => ({
      ...prevSelectedModels,
      [modelId]: !prevSelectedModels[modelId] // Đảo trạng thái (true/false)
    }));
  };


  const handleSubmit = async () => {
    const prompt = userInput.trim();
    if (prompt === '' || isLoading) return;

    // --- ĐẢM BẢO BẠN CÓ LOGIC NÀY ---
    // 1. Chuyển object state thành mảng tên model
    const modelsToQuery = Object.keys(selectedModels).filter(
      key => selectedModels[key] // Chỉ lấy key (tên model) có giá trị 'true'
    );

    // 2. Kiểm tra nếu không chọn model nào
    if (modelsToQuery.length === 0) {
      alert("Vui lòng chọn ít nhất một mô hình để gửi yêu cầu.");
      return;
    }
    // -------------------------------------

    addMessage('user', prompt);
    setUserInput('');
    setSuggestions([]);
    setIsLoading(true);

    // 3. Đảm bảo bạn gọi API với 'modelsToQuery' (mảng)
    const responses = await callRealApi(prompt, modelsToQuery); // <-- KIỂM TRA DÒNG NÀY

    if (responses) {
        responses.forEach(res => {
            addMessage('bot', res.text, res.model);
        });
    }
    setIsLoading(false);
  };

  const handleSuggestionClick = async (action) => {
    const text = userInput.trim();
    if (text === '' || isLoading) {
      alert("Vui lòng nhập nội dung trước khi chọn tác vụ.");
      return;
    }
    const fullPrompt = `${action}:\n\n"${text}"`;

    const modelsToQuery = Object.keys(selectedModels).filter(
      key => selectedModels[key] // Chỉ lấy key (tên model) có giá trị 'true'
    );

    if (modelsToQuery.length === 0) {
      alert("Vui lòng chọn ít nhất một mô hình để gửi yêu cầu.");
      return;
    }
    // -------------------------------------

    addMessage('user', fullPrompt);
    setUserInput(''); // Xóa text khỏi text area
    setSuggestions([]);
    setIsLoading(true);

    // 3. Gọi API với mảng model chính xác (modelsToQuery)
    const responses = await callRealApi(fullPrompt, modelsToQuery);

    if (responses) {
      responses.forEach(res => {
        addMessage('bot', res.text, res.model);
      });
    }
    setIsLoading(false);
  };


  return (
    <div className="app-container">
      <Sidebar />
      <main className="chat-window">
        <div className="chat-container">
          <MessageList messages={messages} />
          <SuggestionBar
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
          {/* CẬP NHẬT PROPS TRUYỀN VÀO INPUTAREA */}
          <InputArea
            userInput={userInput}
            onInputChange={setUserInput}
            selectedModels={selectedModels}     // <-- Prop mới
            onModelToggle={handleModelToggle}  // <-- Prop mới
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;