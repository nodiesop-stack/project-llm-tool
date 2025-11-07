import React from 'react';
import ReactMarkdown from 'react-markdown';

function Message({ message }) {
  const { sender, text, model } = message;

  // Lấy 2 chữ cái đầu của model làm avatar
  // (ví dụ: 'Gemini' -> 'GE', 'System' -> 'SY', 'user' -> 'US')
  let avatarText = 'US';
  if (sender === 'bot') {
    avatarText = model ? model.substring(0, 2).toUpperCase() : 'BOT';
    if (model === 'System') avatarText = 'SY';
  }

  // Xác định class cho tin nhắn user hay bot
  const messageTypeClass = sender === 'user' ? 'user-message' : 'bot-message';

  return (
    <div className={`message ${messageTypeClass}`} data-model={model}>
      {/* Avatar */}
      <div className="avatar">
        {avatarText}
      </div>

      {/* Nội dung tin nhắn (Bong bóng) */}
      <div className="message-content">
        <div className="message-bubble">
          {/* Nhãn (Gemini, Ollama, v.v.) chỉ hiển thị cho bot */}
          <span className="bot-message-label">{model}:</span>
          
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default Message;