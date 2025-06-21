import { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  hasApiKey: boolean;
}

export function ApiKeyInput({ onApiKeySet, hasApiKey }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setApiKey('');
    }
  };

  const handleClear = () => {
    onApiKeySet('');
    setApiKey('');
  };

  if (hasApiKey) {
    return (
      <div className="bg-surface rounded-2xl p-6 shadow-elevation" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-differential rounded-full"></div>
            <div>
              <span className="text-body text-text-primary font-medium">
                🔗 API Connected
              </span>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary bg-surface shadow-subtle hover:shadow-elevation rounded-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            🔄 Change Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-elevation" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🔑</span>
          <h3 className="text-body font-medium text-text-primary">
            API Key Required
          </h3>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key (sk-...)"
            className="w-full px-3 py-3 text-body bg-surface border-0 border-b border-separator focus:border-accent focus:outline-none pr-16 transition-apple duration-apple"
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-caption text-text-secondary hover:text-text-primary bg-surface shadow-subtle hover:shadow-elevation rounded-lg hover:-translate-y-1 transition-all duration-300"
          >
            {isVisible ? '👁️' : '🙈'}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!apiKey.trim()}
          className="w-full px-4 py-3 text-body bg-action text-white rounded-xl hover:bg-action/90 disabled:bg-text-secondary/50 disabled:cursor-not-allowed font-medium shadow-elevation hover:shadow-elevation-hover transform hover:-translate-y-0.5 transition-all duration-300"
        >
          🚀 Connect & Activate AI
        </button>
      </form>
      
    </div>
  );
}