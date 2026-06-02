"use client";

import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: 'var(--primary-color)', 
      color: '#FFFFFF', 
      padding: '3rem 0', 
      textAlign: 'center', 
      borderTop: '5px solid var(--secondary-color)',
      transition: 'background 0.3s ease',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldAlert size={20} style={{ color: 'var(--secondary-color)' }} />
          <strong style={{ fontSize: '1.1rem' }}>Official Voter Information Portal</strong>
        </div>
        <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          This website is a demonstration portal built for educational purposes. All live news is aggregated from public feeds and counting Tallies are simulated.
        </p>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>
          &copy; {new Date().getFullYear()} Official Voter Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
