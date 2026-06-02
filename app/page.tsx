"use client";

import { useState } from 'react';
import Timeline from './components/Timeline';
import AssistantWidget from './components/AssistantWidget';
import NewsSection from './components/NewsSection';
import StateElectionsDashboard from './components/StateElectionsDashboard';
import VoterAwareness from './components/VoterAwareness';
import LiveCountingWidget from './components/LiveCountingWidget';
import Link from 'next/link';
import { Home as HomeIcon, Play, Map, UserCheck, ShieldAlert, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'overview' | 'live' | 'states' | 'awareness'>('overview');

  return (
    <main style={{ paddingBottom: '4rem', background: 'var(--background-light)', minHeight: '100vh', transition: 'background 0.3s ease' }}>
      {/* Alert Banner / Marquee */}
      <div className="alert-banner" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: '1.5rem', fontWeight: 800 }}>
          <ShieldAlert size={18} />
          <span>NOTICE / सूचना:</span>
        </div>
        <div className="alert-banner-content" style={{ flex: 1 }}>
          UPCOMING: Voter registration for 2027 state elections will open soon. Keep your documents ready! | आवश्यक सूचना: 2027 राज्य चुनावों के लिए मतदाता पंजीकरण जल्द ही शुरू होगा। अपने दस्तावेज तैयार रखें!
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #1E3A8A 50%, #0D9488 100%)',
        color: 'var(--white)',
        padding: '5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: 'none'
      }}>
        {/* Subtle decorative grid background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: '#FFFFFF', fontSize: '3.4rem', fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.3)', margin: 0 }}>
            Election Information Portal
          </h1>
          <span style={{ fontSize: '2rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', display: 'block', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            आधिकारिक चुनाव जानकारी पोर्टल
          </span>
          <p style={{
            fontSize: '1.2rem',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            opacity: 0.9,
            lineHeight: 1.6,
            color: '#E2E8F0'
          }}>
            Access real-time counting updates, verify your voter registration, track upcoming state schedules, and follow the step-by-step wizard to cast your vote safely and securely.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/how-to-vote" className="btn btn-primary" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(239,108,0,0.4)',
              borderRadius: '30px',
              padding: '0.8rem 1.8rem',
              fontSize: '1rem'
            }}>
              How to Vote / मतदान मार्गदर्शिका <ArrowRight size={18} />
            </Link>
            <button 
              onClick={() => {
                setActiveFeatureTab('states');
                document.getElementById('feature-tabs-section')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="btn btn-outline" 
              style={{
                borderColor: '#FFFFFF',
                color: '#FFFFFF',
                borderRadius: '30px',
                padding: '0.8rem 1.8rem',
                fontSize: '1rem',
                background: 'rgba(255,255,255,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              Election Schedules / चुनाव कार्यक्रम
            </button>
          </div>
        </div>
      </section>

      {/* Main Interactive Feature Dashboard Section */}
      <section id="feature-tabs-section" className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
        {/* Features Navigation Bar */}
        <div className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-around',
          borderRadius: '16px',
          padding: '0.8rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {(() => {
            const tabs: {
              id: 'overview' | 'live' | 'states' | 'awareness';
              label: string;
              labelHi: string;
              icon: typeof HomeIcon;
              isLive?: boolean;
            }[] = [
              { id: 'overview', label: 'Overview & Deadlines', labelHi: 'विवरण और समय सीमा', icon: HomeIcon },
              { id: 'live', label: 'Live Counting Sim', labelHi: 'मतगणना सिम्युलेटर', icon: Play, isLive: true },
              { id: 'states', label: 'State Elections', labelHi: 'राज्य विधानसभा चुनाव', icon: Map },
              { id: 'awareness', label: 'Voter Education & Quiz', labelHi: 'जागरूकता और क्विज', icon: UserCheck }
            ];

            return tabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.8rem 1.4rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'var(--primary-color)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    minWidth: '150px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <IconComp size={20} style={{ color: isActive ? '#FFFFFF' : 'var(--secondary-color)' }} />
                    {tab.isLive && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '8px',
                        height: '8px',
                        background: '#D32F2F',
                        borderRadius: '50%',
                        animation: 'pulseGlow 1s infinite alternate'
                      }}></span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem' }}>{tab.label}</div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', fontWeight: 400 }}>{tab.labelHi}</span>
                  </div>
                </button>
              );
            });
          })()}
        </div>

        {/* Dynamic Feature Target */}
        <div style={{ minHeight: '400px' }}>
          {activeFeatureTab === 'overview' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              {/* Deadlines Timeline Component */}
              <div className="card glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <h3 className="en" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>Important Election Deadlines</h3>
                  <span className="hi" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>महत्वपूर्ण चुनाव समय सीमा</span>
                </div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.5 }}>
                  Ensure you complete your voter registration and follow polling dates to exercise your democratic right. Refer to official timelines below.
                </p>
                <Timeline />
              </div>

              {/* General official notices */}
              <div className="notices-grid" style={{ marginTop: '2.5rem' }}>
                <div className="card notice-card glass-panel">
                  <div className="bilingual-text" style={{ marginBottom: 0 }}>
                    <h3 className="en" style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>EVM & VVPAT Awareness</h3>
                    <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
                    <div className="hi" style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '1rem' }}>ईवीएम और वीवीपैट जागरूकता</div>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Learn about Electronic Voting Machines (EVM) and Voter Verifiable Paper Audit Trail (VVPAT). Your vote is safe and verified.
                  </p>
                </div>
                <div className="card notice-card glass-panel">
                  <div className="bilingual-text" style={{ marginBottom: 0 }}>
                    <h3 className="en" style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>Model Code of Conduct</h3>
                    <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
                    <div className="hi" style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '1rem' }}>आदर्श आचार संहिता</div>
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    The Model Code of Conduct comes into force immediately upon schedule announcement to guarantee free and fair elections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'live' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <LiveCountingWidget />
            </div>
          )}

          {activeFeatureTab === 'states' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <StateElectionsDashboard />
            </div>
          )}

          {activeFeatureTab === 'awareness' && (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <VoterAwareness />
            </div>
          )}
        </div>
      </section>

      {/* Live Election News Section - Fixed in container */}
      <section className="container" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Award size={24} style={{ color: 'var(--secondary-color)' }} />
          <div>
            <h2 className="en" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>Live Election News & Press Releases</h2>
            <span className="hi" style={{ fontSize: '1.1rem', color: 'var(--text-muted)', display: 'block' }}>चुनाव समाचार और प्रेस विज्ञप्तियां</span>
          </div>
        </div>
        <NewsSection />
      </section>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--primary-color)', 
        color: '#FFFFFF', 
        padding: '3rem 0', 
        textAlign: 'center', 
        marginTop: '6rem', 
        borderTop: '5px solid var(--secondary-color)',
        transition: 'background 0.3s ease'
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

      {/* Floating Chat Assistant */}
      <AssistantWidget setActiveTab={setActiveFeatureTab} />
    </main>
  );
}
