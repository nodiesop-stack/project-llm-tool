import React from 'react';

function SuggestionBar({ suggestions, onSuggestionClick }) {
    if (!suggestions || suggestions.length === 0) {
        return null;
    }

  return (
    <div className="suggestion-bar">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.action}
          onClick={() => onSuggestionClick(suggestion.action)}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}

export default SuggestionBar;