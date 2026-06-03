"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import * as analytics from '../../lib/analytics';

export default function AssistantWidget({ setActiveTab }: { setActiveTab?: (tab: 'overview' | 'live' | 'states' | 'awareness') => void }) {
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
    analytics.event('select_language', {
      category: 'Chatbot',
      label: lang,
    });
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

    // Track user message sent to the chatbot
    analytics.event('send_chat_message', {
      category: 'Chatbot',
      label: language,
    });

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
          onClick={() => {
            setIsOpen(true);
            analytics.event('open_chatbot', {
              category: 'Chatbot',
            });
          }}
          aria-label="Open election assistant"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-header-title">
              <span className="chat-online-indicator" />
              <span>{language === 'hi' ? 'चुनाव सहायक' : 'Election Assistant'}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={20} />
            </button>
          </div>
          
          {!language ? (
            <div className="chat-body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1.5rem', background: 'var(--chat-bg-assistant)' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(239,108,0,0.08)', color: 'var(--primary-color)' }}>
                <MessageSquare size={36} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>Choose Language</h4>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>अपनी भाषा का चयन करें</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', maxWidth: '240px' }}>
                <button className="btn btn-outline" style={{ padding: '0.7rem', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => handleLanguageSelect('en')}>English</button>
                <button className="btn btn-outline" style={{ padding: '0.7rem', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => handleLanguageSelect('hi')}>हिन्दी (Hindi)</button>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-body">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`} style={{ whiteSpace: 'pre-line' }}>
                    {(() => {
                      const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;

                      while ((match = regex.exec(msg.content)) !== null) {
                        const matchIndex = match.index;
                        if (matchIndex > lastIndex) {
                          parts.push(msg.content.substring(lastIndex, matchIndex));
                        }

                        const text = match[1];
                        const url = match[2];

                        if (url.startsWith('tab:')) {
                          const tabName = url.substring(4) as 'overview' | 'live' | 'states' | 'awareness';
                          parts.push(
                            <button
                              key={matchIndex}
                              onClick={() => {
                                if (setActiveTab) {
                                  setActiveTab(tabName);
                                  document.getElementById('feature-tabs-section')?.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-color)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                fontWeight: 'bold',
                                display: 'inline'
                              }}
                            >
                              {text}
                            </button>
                          );
                        } else {
                          parts.push(
                            <a
                              key={matchIndex}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--primary-color)',
                                textDecoration: 'underline',
                                fontWeight: 'bold'
                              }}
                            >
                              {text}
                            </a>
                          );
                        }

                        lastIndex = regex.lastIndex;
                      }

                      if (lastIndex < msg.content.length) {
                        parts.push(msg.content.substring(lastIndex));
                      }

                      return parts.length > 0 ? parts : msg.content;
                    })()}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message assistant" style={{ padding: '0.5rem 0.8rem' }}>
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
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
