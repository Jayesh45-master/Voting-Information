"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | null>(null);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    const welcomeMsg = lang === 'en' 
      ? 'Hello! I am the Official Election Assistant. How can I help you today?'
      : 'नमस्ते! मैं आधिकारिक चुनाव सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?';
    setMessages([{ role: 'assistant', content: welcomeMsg }]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !language) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, language }),
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      const errorMsg = language === 'en'
        ? 'Sorry, I am having trouble connecting to the network right now.'
        : 'क्षमा करें, मुझे अभी नेटवर्क से कनेक्ट करने में समस्या हो रही है।';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          className="chat-toggle" 
          onClick={() => setIsOpen(true)}
          aria-label="Open election assistant"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <span>{language === 'hi' ? 'चुनाव सहायक' : 'Election Assistant'}</span>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
          
          {!language ? (
            <div className="chat-body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Select Language<br/><span style={{ fontSize: '1rem' }}>भाषा चुनें</span></h3>
              <button className="btn btn-outline" style={{ marginBottom: '1rem', width: '80%' }} onClick={() => handleLanguageSelect('en')}>English</button>
              <button className="btn btn-outline" style={{ width: '80%' }} onClick={() => handleLanguageSelect('hi')}>हिन्दी</button>
            </div>
          ) : (
            <>
              <div className="chat-body">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message assistant">
                    <span className="animate-pulse">...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="chat-input">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={language === 'hi' ? 'कोई प्रश्न पूछें...' : 'Ask a question...'}
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
