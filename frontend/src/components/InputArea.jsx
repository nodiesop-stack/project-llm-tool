// /frontend/src/components/InputArea.jsx
import React from 'react';

// Danh sách các model có sẵn
const AVAILABLE_MODELS = [
  { id: 'GPT', label: 'GPT' },
  { id: 'Gemini', label: 'Gemini' },
  { id: 'DeepSeek', label: 'DeepSeek' },
  { id: 'Ollama', label: 'Ollama' },
];

function InputArea({
  userInput,
  onInputChange,
  selectedModels, // <-- Nhận vào object các model đã chọn
  onModelToggle, // <-- Nhận vào hàm để toggle
  onSubmit,
  isLoading,
}) {

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="input-area">
      {/* Vùng chọn model mới */}
      <div className="model-selector">
        <div className="model-selector-label">So sánh các model:</div>
        <div className="model-checkbox-group">
          {AVAILABLE_MODELS.map((model) => (
            <label key={model.id} className="model-checkbox">
              <input
                type="checkbox"
                checked={selectedModels[model.id]}
                onChange={() => onModelToggle(model.id)}
                disabled={isLoading}
              />
              {model.label}
            </label>
          ))}
        </div>
      </div>

      <textarea
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập một đoạn văn bản hoặc yêu cầu..."
        disabled={isLoading}
      />

      <button onClick={onSubmit} disabled={isLoading} title="Gửi yêu cầu">
        {isLoading ? 'Đang...' : 'Gửi'}
      </button>
    </div>
  );
}

export default InputArea;