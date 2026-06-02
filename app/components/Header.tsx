"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon, Shield } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preferences on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTimeout(() => {
        setDarkMode(true);
      }, 0);
      document.body.classList.add('dark-theme');
      document.body.classList.add('dark'); // fallback support
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <header className="gov-header" style={{
      borderBottom: '3px solid var(--secondary-color)',
      background: 'var(--primary-color)',
      transition: 'background 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem' }}>
          <Shield size={28} style={{ color: 'var(--secondary-color)' }} />
          <div>
            <span style={{ fontWeight: 800 }}>VOTER</span> PORTAL
            <span style={{ fontSize: '0.8rem', display: 'block', opacity: 0.8, fontWeight: 500 }}>मतदाता सूचना पोर्टल</span>
          </div>
        </div>

        <button 
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            padding: '0.6rem',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
