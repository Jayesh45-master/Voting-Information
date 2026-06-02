"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Award, CheckCircle2, XCircle, AlertCircle, 
  Phone, ShieldAlert, Search, ArrowRight, RotateCcw, Download, ExternalLink, ShieldCheck 
} from 'lucide-react';

interface GlossaryTerm {
  _id: string;
  term: string;
  termHi: string;
  definition: string;
  definitionHi: string;
  category: string;
}

interface QuizQuestion {
  _id: string;
  question: string;
  questionHi: string;
  options: string[];
  optionsHi: string[];
  correctAnswerIndex: number;
  explanation: string;
  explanationHi: string;
}

export default function VoterAwareness() {
  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'glossary' | 'rights'>('quiz');
  
  // Glossary state
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadingGlossary, setLoadingGlossary] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [certificateId, setCertificateId] = useState('');
  
  const certificateRef = useRef<HTMLDivElement>(null);

  const fetchGlossary = () => {
    if (glossary.length === 0) {
      setLoadingGlossary(true);
      fetch('/api/glossary')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setGlossary(data);
        })
        .catch(err => console.error("Failed to fetch glossary", err))
        .finally(() => setLoadingGlossary(false));
    }
  };

  const handleTabChange = (tab: 'quiz' | 'glossary' | 'rights') => {
    setActiveSubTab(tab);
    if (tab === 'glossary') {
      fetchGlossary();
    }
  };

  // Fetch quiz data
  useEffect(() => {
    if (quizQuestions.length === 0) {
      fetch('/api/quiz')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setQuizQuestions(data);
        })
        .catch(err => console.error("Failed to fetch quiz", err))
        .finally(() => setLoadingQuiz(false));
    }
  }, [quizQuestions.length]);

  // Glossary filter logic
  const filteredGlossary = glossary.filter(item => {
    const matchesSearch = 
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) || 
      item.termHi.includes(glossarySearch) || 
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase()) || 
      item.definitionHi.includes(glossarySearch);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Technology', 'Legal', 'General'];

  // Quiz handlers
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      const randomId = "VA-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      setCertificateId(randomId);
    }
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setUserName('');
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
  };

  const handlePrintCertificate = () => {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const percentage = Math.round((score / quizQuestions.length) * 100);

    const printWindow = window.open('', '_blank', 'width=1000,height=720');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Voter Awareness Certificate - ${userName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background: #fff;
      font-family: 'Georgia', 'Times New Roman', serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
    }
    .cert-outer {
      width: 100%;
      max-width: 250mm;
      background: #F6F0E5;
      border: 4px solid #8B6508;
      padding: 8px;
      border-radius: 4px;
      text-align: center;
      color: #3E2723;
    }
    .cert-inner {
      border: 1px solid #8B6508;
      padding: 30px 40px 24px;
      position: relative;
      overflow: hidden;
    }
    /* Watermark chakra */
    .watermark {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.05;
      pointer-events: none;
      width: 260px; height: 260px;
    }
    /* Header */
    .cert-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border-bottom: 2px solid #8B6508;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .cert-medal svg { display: block; }
    .cert-title {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #8B0000;
      text-transform: uppercase;
    }
    .cert-subtitle {
      font-size: 0.85rem;
      font-weight: 700;
      color: #3E2723;
      letter-spacing: 1px;
    }
    /* Body */
    .cert-presented {
      font-size: 0.92rem;
      font-style: italic;
      color: #5D4037;
      margin-bottom: 10px;
    }
    .cert-name {
      font-size: 2.1rem;
      font-weight: 800;
      color: #1A0F0A;
      font-family: 'Georgia', serif;
      border-bottom: 2.5px solid #8B6508;
      display: inline-block;
      padding: 0 2rem 6px;
      margin-bottom: 14px;
      letter-spacing: 1px;
    }
    .cert-body-text {
      font-size: 0.93rem;
      color: #3E2723;
      line-height: 1.55;
      max-width: 520px;
      margin: 0 auto 18px;
    }
    /* Footer */
    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #5D4037;
      gap: 1rem;
    }
    .cert-date { text-align: left; }
    .cert-date .portal-label { font-size: 0.72rem; color: #8B7355; margin-top: 3px; }
    .cert-stamp {
      text-align: center;
      border: 2px dashed #8B0000;
      padding: 5px 10px;
      border-radius: 4px;
      background: rgba(139,0,0,0.03);
      font-size: 0.78rem;
      color: #8B0000;
      font-weight: bold;
      letter-spacing: 1px;
      transform: rotate(-4deg);
    }
    .cert-stamp .stamp-id { font-size: 0.62rem; opacity: 0.8; }
    .cert-signature {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cert-sig-name {
      font-style: italic;
      color: #8B6508;
      font-size: 1.15rem;
      font-family: cursive;
      font-weight: normal;
      margin-bottom: 4px;
    }
    .cert-sig-line {
      border-top: 1px solid #8B6508;
      width: 130px;
      font-size: 0.72rem;
      padding-top: 3px;
      color: #8B7355;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .cert-outer { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="cert-outer">
    <div class="cert-inner">
      <!-- Watermark SVG Chakra -->
      <svg class="watermark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#8B6508" stroke-width="1.8"/>
        <circle cx="50" cy="50" r="10" fill="none" stroke="#8B6508" stroke-width="0.8"/>
        ${Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x2 = (50 + 45 * Math.cos(angle)).toFixed(2);
          const y2 = (50 + 45 * Math.sin(angle)).toFixed(2);
          return `<line x1="50" y1="50" x2="${x2}" y2="${y2}" stroke="#8B6508" stroke-width="0.4"/>`;
        }).join('')}
      </svg>

      <!-- Header -->
      <div class="cert-header">
        <!-- Medal/Award SVG icon replacing Lucide Award -->
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8B6508" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
        <div class="cert-title">Certificate of Appreciation</div>
        <div class="cert-subtitle">VOTER AWARENESS CHAMPION / मतदाता जागरूकता चैंपियन</div>
      </div>

      <!-- Body -->
      <p class="cert-presented">This is proudly presented to</p>
      <div class="cert-name">${userName}</div>
      <div class="cert-body-text">
        for successfully qualifying the <strong>Voter Awareness Challenge</strong> with a score of
        <strong>${score}/${quizQuestions.length} (${percentage}%)</strong>,
        demonstrating a comprehensive understanding of India's electoral processes, rules, and voter responsibilities.
      </div>

      <!-- Footer -->
      <div class="cert-footer">
        <div class="cert-date">
          <div>Date: ${today}</div>
          <div class="portal-label">Electoral Awareness Portal</div>
        </div>
        <div class="cert-stamp">
          <div>VERIFIED</div>
          <div class="stamp-id">ID: ${certificateId}</div>
        </div>
        <div class="cert-signature">
          <div class="cert-sig-name">ECI Assistant</div>
          <div class="cert-sig-line">Authorized Signatory</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px' }}>
      
      {/* Sub tabs navigation */}
      <div className="awareness-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => handleTabChange('quiz')}
          className={`btn awareness-tab-btn ${activeSubTab === 'quiz' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.6rem 1rem' }}
        >
          <Award size={16} />
          <span className="tab-label-full">Voter Quiz &amp; Certificate</span>
          <span className="tab-label-short">Quiz &amp; Cert</span>
        </button>
        <button 
          onClick={() => handleTabChange('glossary')}
          className={`btn awareness-tab-btn ${activeSubTab === 'glossary' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.6rem 1rem' }}
        >
          <BookOpen size={16} />
          <span className="tab-label-full">Electoral Glossary</span>
          <span className="tab-label-short">Glossary</span>
        </button>
        <button 
          onClick={() => handleTabChange('rights')}
          className={`btn awareness-tab-btn ${activeSubTab === 'rights' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', padding: '0.6rem 1rem' }}
        >
          <ShieldCheck size={16} />
          <span className="tab-label-full">Voter Rights &amp; Helplines</span>
          <span className="tab-label-short">Rights</span>
        </button>
      </div>

      {/* QUIZ SECTION */}
      {activeSubTab === 'quiz' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {loadingQuiz && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading Quiz Questions / प्रश्न लोड हो रहे हैं...
            </div>
          )}

          {!loadingQuiz && !quizStarted && !quizFinished && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(239,108,0,0.1)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                <Award size={48} />
              </div>
              <h3 className="en" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>Voter Awareness Challenge</h3>
              <span className="hi" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1.5rem' }}>मतदाता जागरूकता चुनौती</span>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Test your knowledge about the electoral system, rules, and technology in India. Score <strong>80% or more (4 out of 5 correct answers)</strong> to receive a personalized digital &quot;Voter Awareness Champion&quot; Certificate!
              </p>

              <form onSubmit={handleStartQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div className="input-group" style={{ width: '100%', maxWidth: '400px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    Enter Your Name for Certificate / अपना नाम दर्ज करें *
                  </label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="e.g. Amit Sharma" 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', borderRadius: '30px', marginTop: '0.5rem' }}>
                  Start Challenge / क्विज शुरू करें <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {quizStarted && !quizFinished && quizQuestions.length > 0 && (
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              {/* Quiz progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginBottom: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
              </div>

              {/* Question card */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                  {quizQuestions[currentQuestionIndex].question}
                </h4>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {quizQuestions[currentQuestionIndex].questionHi}
                </div>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                  const optionHi = quizQuestions[currentQuestionIndex].optionsHi[idx];
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === quizQuestions[currentQuestionIndex].correctAnswerIndex;
                  
                  let bg = 'rgba(255,255,255,0.03)';
                  let border = '1px solid var(--border-color)';
                  let color = 'var(--text-main)';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      bg = 'rgba(76, 175, 80, 0.15)';
                      border = '1px solid rgb(76, 175, 80)';
                      color = '#2E7D32';
                    } else if (isSelected) {
                      bg = 'rgba(244, 67, 54, 0.15)';
                      border = '1px solid rgb(244, 67, 54)';
                      color = '#C62828';
                    }
                  } else if (isSelected) {
                    bg = 'rgba(239, 108, 0, 0.1)';
                    border = '2px solid var(--primary-color)';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: bg,
                        border: border,
                        color: color,
                        cursor: isAnswerSubmitted ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        fontWeight: isSelected ? 600 : 400
                      }}
                      onMouseEnter={(e) => {
                        if (!isAnswerSubmitted && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isAnswerSubmitted && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem' }}>{option}</div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.2rem' }}>{optionHi}</div>
                        </div>
                        {isAnswerSubmitted && isCorrect && <CheckCircle2 size={20} color="green" />}
                        {isAnswerSubmitted && isSelected && !isCorrect && <XCircle size={20} color="red" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                {!isAnswerSubmitted ? (
                  <button 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 2rem' }}
                  >
                    Submit Answer / उत्तर जमा करें
                  </button>
                ) : (
                  <button 
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>{currentQuestionIndex + 1 === quizQuestions.length ? "Finish Quiz / समाप्त करें" : "Next Question / अगला प्रश्न"}</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {/* Explanation section */}
              {isAnswerSubmitted && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.2rem', 
                  borderRadius: '10px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  animation: 'fadeIn 0.3s ease',
                  display: 'flex',
                  gap: '0.8rem'
                }}>
                  <AlertCircle size={20} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '0.95rem' }}>Explanation / स्पष्टीकरण</h5>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {quizQuestions[currentQuestionIndex].explanation}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {quizQuestions[currentQuestionIndex].explanationHi}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUIZ FINISHED RESULTS & CERTIFICATE */}
          {quizFinished && (
            <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>Quiz Completed! / क्विज समाप्त!</h3>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  You scored: <span style={{ color: score >= 4 ? 'green' : 'var(--secondary-color)', fontSize: '1.5rem' }}>{score} / {quizQuestions.length}</span> ({Math.round((score / quizQuestions.length) * 100)}%)
                </div>
              </div>

              {score >= 4 ? (
                /* Winner / Cert Holder */
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ 
                    color: 'green', 
                    background: 'rgba(76,175,80,0.08)', 
                    padding: '1rem 2rem', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(76,175,80,0.2)', 
                    fontSize: '1rem', 
                    textAlign: 'center', 
                    maxWidth: '500px',
                    lineHeight: 1.5
                  }}>
                    🎉 Congratulations <strong>{userName}</strong>! You passed the challenge and earned the title of <strong>Voter Awareness Champion</strong>!
                  </div>

                  {/* Certificate Preview Card */}
                  <div 
                    ref={certificateRef}
                    className="certificate-preview-card"
                    style={{ 
                      width: '100%', 
                      maxWidth: '680px', 
                      background: '#F6F0E5', 
                      border: '4px solid #8B6508', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)', 
                      textAlign: 'center', 
                      position: 'relative',
                      color: '#3E2723', 
                      fontFamily: "'Georgia', 'Times New Roman', serif"
                    }}
                  >
                    <div style={{
                      border: '1px solid #8B6508',
                      padding: '2.5rem 1.5rem',
                      height: '100%',
                      position: 'relative'
                    }}>
                      {/* Ashoka Chakra background watermark */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0.05,
                        pointerEvents: 'none'
                      }}>
                        <svg width="320" height="320" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#8B6508" strokeWidth="1.8" />
                          <circle cx="50" cy="50" r="10" fill="none" stroke="#8B6508" strokeWidth="0.8" />
                          {Array.from({ length: 24 }).map((_, i) => (
                            <line 
                              key={i} 
                              x1="50" 
                              y1="50" 
                              x2={50 + 45 * Math.cos((i * 15 * Math.PI) / 180)} 
                              y2={50 + 45 * Math.sin((i * 15 * Math.PI) / 180)} 
                              stroke="#8B6508" 
                              strokeWidth="0.4" 
                            />
                          ))}
                        </svg>
                      </div>

                      <div className="cert-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', borderBottom: '2px solid #8B6508', paddingBottom: '1rem', marginBottom: '1.8rem' }}>
                        <Award color="#8B6508" size={40} />
                        <div className="cert-title" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '2px', color: '#8B0000' }}>CERTIFICATE OF APPRECIATION</div>
                        <div className="cert-subtitle" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3E2723', letterSpacing: '1px' }}>VOTER AWARENESS CHAMPION / मतदाता जागरूकता चैंपियन</div>
                      </div>

                      <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#5D4037', marginBottom: '1.2rem' }}>
                        This is proudly presented to
                      </div>

                      <div 
                        className="cert-name"
                        style={{ 
                          fontSize: '2.2rem', 
                          fontWeight: 800, 
                          color: '#1A0F0A', 
                          fontFamily: "'Playfair Display', 'Georgia', serif", 
                          borderBottom: '2.5px solid #8B6508', 
                          display: 'inline-block',
                          padding: '0 2rem 0.5rem',
                          marginBottom: '1.5rem',
                          letterSpacing: '1px'
                        }}
                      >
                        {userName}
                      </div>

                      <div style={{ fontSize: '0.98rem', color: '#3E2723', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto 2rem' }}>
                        for successfully qualifying the <strong>Voter Awareness Challenge</strong> with a score of <strong>{score}/5 ({Math.round((score / quizQuestions.length) * 100)}%)</strong>, demonstrating a comprehensive understanding of India&apos;s electoral processes, rules, and voter responsibilities.
                      </div>

                      <div className="cert-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#5D4037', gap: '1rem' }}>
                        <div className="cert-date" style={{ textAlign: 'left' }}>
                          <div>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8B7355', marginTop: '0.2rem' }}>Electoral Awareness Portal</div>
                        </div>
                        
                        <div className="cert-verified-stamp" style={{ 
                          textAlign: 'center', 
                          border: '2px dashed #8B0000', 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '4px', 
                          background: 'rgba(139,0,0,0.03)', 
                          fontSize: '0.8rem', 
                          color: '#8B0000',
                          fontWeight: 'bold',
                          letterSpacing: '1px',
                          transform: 'rotate(-4deg)',
                          boxShadow: '0 2px 5px rgba(139,0,0,0.05)',
                          alignSelf: 'center'
                        }}>
                          <div style={{ color: '#8B0000', fontWeight: 'bold' }}>VERIFIED</div>
                          <div style={{ fontSize: '0.65rem', color: '#8B0000', opacity: 0.8 }}>ID: {certificateId}</div>
                        </div>

                        <div className="cert-signature-block" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontStyle: 'italic', color: '#8B6508', fontSize: '1.2rem', fontFamily: 'cursive', fontWeight: 'normal', marginBottom: '0.25rem' }}>ECI Assistant</div>
                          <div style={{ borderTop: '1px solid #8B6508', width: '130px', fontSize: '0.75rem', paddingTop: '0.2rem', color: '#8B7355' }}>Authorized Signatory</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={handleRestartQuiz} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RotateCcw size={16} /> Try Again / फिर से खेलें
                    </button>
                    <button className="btn btn-primary" onClick={handlePrintCertificate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Download size={16} /> Print / Save Certificate
                    </button>
                  </div>
                </div>
              ) : (
                /* Loser / Try Again */
                <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                  <div style={{ display: 'inline-flex', padding: '0.8rem', borderRadius: '50%', background: 'rgba(211,47,47,0.1)', color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                    <AlertCircle size={36} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    You scored {score} out of 5. You need at least <strong>4 correct answers (80%)</strong> to receive a digital certificate. Brush up on your electoral terms in the &quot;Electoral Glossary&quot; tab and try again!
                  </p>
                  <button className="btn btn-primary" onClick={handleRestartQuiz} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                    <RotateCcw size={16} /> Retry Quiz / दोबारा प्रयास करें
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GLOSSARY SECTION */}
      {activeSubTab === 'glossary' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                value={glossarySearch} 
                onChange={(e) => setGlossarySearch(e.target.value)} 
                placeholder="Search electoral terms... / शब्द खोजें..." 
                style={{
                  width: '100%',
                  padding: '0.7rem 0.7rem 0.7rem 2.5rem',
                  borderRadius: '30px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            {/* Category selection */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    background: selectedCategory === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                    color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                    border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingGlossary ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading Glossary Terms / लोडिंग चुनाव शब्दावली...
            </div>
          ) : filteredGlossary.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No terms found / कोई परिणाम नहीं मिला।
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
              {filteredGlossary.map((item) => (
                <div 
                  key={item._id} 
                  className="card glass-panel" 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', margin: 0 }}>{item.term}</h4>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        background: item.category === 'Technology' ? 'rgba(13,148,136,0.1)' : item.category === 'Legal' ? 'rgba(211,47,47,0.1)' : 'rgba(239,108,0,0.1)',
                        color: item.category === 'Technology' ? '#0D9488' : item.category === 'Legal' ? '#D32F2F' : '#EF6C00',
                        fontWeight: 'bold'
                      }}>{item.category}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.6rem' }}>
                      {item.termHi}
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.6rem 0' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {item.definition}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', opacity: 0.8, lineHeight: 1.5, marginTop: '0.4rem', margin: 0 }}>
                      {item.definitionHi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RIGHTS & HELPLINES SECTION */}
      {activeSubTab === 'rights' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h3 className="en" style={{ fontSize: '1.6rem', color: 'var(--primary-color)', margin: 0 }}>Know Your Rights & Services</h3>
            <span className="hi" style={{ fontSize: '1.1rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>अपने अधिकार और सेवाओं को जानें</span>
          </div>

          {/* Grid Layout */}
          <div className="rights-grid">
            
            {/* Left: Voter Rights */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--primary-color)' }}>
                <ShieldAlert size={20} />
                <span>Fundamental Voter Rights / मतदाता अधिकार</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>Right to Vote (Article 326)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Every Indian citizen aged 18 or above, unless disqualified by law, is entitled to register and vote.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    कानून द्वारा अयोग्य घोषित न किए जाने पर प्रत्येक भारतीय नागरिक जिसकी आयु 18 वर्ष या उससे अधिक है, मतदान करने का अधिकारी है।
                  </div>
                </div>

                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>Right to Secret Balloting</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Your vote remains completely anonymous. No one can compel a voter to reveal whom they voted for.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    आपका वोट पूरी तरह से गुप्त रहता है। कोई भी मतदाता को यह खुलासा करने के लिए मजबूर नहीं कर सकता कि उसने किसे वोट दिया।
                  </div>
                </div>

                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>Right to NOTA (None of the Above)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    If you do not support any contesting candidate, you have the right to register your rejection via NOTA on the EVM.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    यदि आप किसी भी उम्मीदवार का समर्थन नहीं करते हैं, तो आपको नोटा (NOTA) के माध्यम से अपनी अस्वीकृति दर्ज करने का अधिकार है।
                  </div>
                </div>

                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>Right to Assistance (Rule 49N)</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Illiterate, blind, or physically disabled voters who cannot record their vote on EVMs can bring an assistant above 18 years to aid them.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    नेत्रहीन या शारीरिक रूप से दिव्यांग मतदाता जो मतदान करने में असमर्थ हैं, वे मदद के लिए अपने साथ एक सहायक ला सकते हैं।
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Helplines & Apps */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.2rem', color: 'var(--primary-color)' }}>
                <Phone size={20} />
                <span>Official ECI Services / आधिकारिक हेल्पलाइन व ऐप्स</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Voter Helpline */}
                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(239,108,0,0.1)', color: 'var(--primary-color)', padding: '0.6rem', borderRadius: '50%' }}>
                    <Phone size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>Voter Helpline Number: 1950</div>
                      <a href="tel:1950" className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}>Call</a>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Toll-free national citizen helpline. Call for details about registration, EPIC cards, polling booths, and election schedules.
                    </div>
                  </div>
                </div>

                {/* cVIGIL */}
                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(211,47,47,0.1)', color: '#D32F2F', padding: '0.6rem', borderRadius: '50%' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>cVIGIL Mobile App</div>
                      <a href="https://cvigil.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span>Link</span> <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Allows citizens to report Model Code of Conduct violations (like bribery, distribution of liquor, hate speeches) with photos/videos. ECI takes action within 100 minutes!
                    </div>
                  </div>
                </div>

                {/* Saksham */}
                <div className="card glass-panel" style={{ padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(13,148,136,0.1)', color: '#0D9488', padding: '0.6rem', borderRadius: '50%' }}>
                    <Award size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>Saksham App (For PwD)</div>
                      <a href="https://www.eci.gov.in/pwd-app" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span>Link</span> <ExternalLink size={10} />
                      </a>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      A dedicated app developed by ECI for Persons with Disabilities (PwD) to request pick-up/drop services, wheelchair assistance at the polling station, or register easily.
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
