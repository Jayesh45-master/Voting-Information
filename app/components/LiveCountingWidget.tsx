"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, List, ShieldAlert, RefreshCw } from 'lucide-react';

type PartySim = {
  name: string;
  abbreviation: string;
  color: string;
  seats: number;
  finalTarget: number;
};

type CandidateSim = {
  name: string;
  nameHi: string;
  party: string;
  color: string;
  votes: number;
  finalVotes: number;
};

type ConstituencySim = {
  name: string;
  nameHi: string;
  candidates: CandidateSim[];
};

const TICKER_MESSAGES = [
  "Counting starts for postal ballots across all 403 constituencies.",
  "Early trends show BJP leading in Varanasi and Noida.",
  "SP candidates take early lead in Lucknow and Azamgarh constituencies.",
  "Round 3: BSP candidate leading in Gorakhpur Urban rural segments by 800 votes.",
  "Round 5: Pankaj Singh (BJP) wins Noida seat by a margin of 66,000 votes.",
  "SP candidates make strong gains in rural constituencies of central UP.",
  "Round 8: Congress wins Amethi seat after close contest with BJP.",
  "Round 12: Brajesh Pathak (BJP) leading in Lucknow Cantt by 3,400 votes.",
  "Yogi Adityanath (BJP) secures landslide victory in Gorakhpur Urban constituency.",
  "Round 15: BSP leading in 25 seats, holding strong in eastern districts.",
  "Round 18: SP alliance crosses 100-seat mark in leading trends.",
  "Round 22: BJP alliance crosses 180-seat mark in leading trends.",
  "Final rounds: SP wins Lucknow Central after intense counting session.",
  "All rounds completed. Results officially declared by returning officers."
];

export default function LiveCountingWidget() {
  const [simulationActive, setSimulationActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  
  // Constituency candidates state
  const [selectedConstituency, setSelectedConstituency] = useState<string>("Gorakhpur Urban");
  const [constituencies, setConstituencies] = useState<ConstituencySim[]>([
    {
      name: "Gorakhpur Urban",
      nameHi: "गोरखपुर शहरी",
      candidates: [
        { name: "Yogi Adityanath", nameHi: "योगी आदित्यनाथ", party: "BJP", color: "#EF6C00", votes: 0, finalVotes: 124000 },
        { name: "Subhawati Shukla", nameHi: "सुभावती शुक्ला", party: "SP", color: "#2E7D32", votes: 0, finalVotes: 45000 },
        { name: "Khwaja Shamsuddin", nameHi: "ख्वाजा शम्सुद्दीन", party: "BSP", color: "#1565C0", votes: 0, finalVotes: 18000 }
      ]
    },
    {
      name: "Noida",
      nameHi: "नोएडा",
      candidates: [
        { name: "Pankaj Singh", nameHi: "पंकज सिंह", party: "BJP", color: "#EF6C00", votes: 0, finalVotes: 108000 },
        { name: "Sunil Choudhary", nameHi: "सुनील चौधरी", party: "SP", color: "#2E7D32", votes: 0, finalVotes: 42000 },
        { name: "Kripa Ram Sharma", nameHi: "कृपा राम शर्मा", party: "BSP", color: "#1565C0", votes: 0, finalVotes: 15000 }
      ]
    },
    {
      name: "Lucknow Cantonment",
      nameHi: "लखनऊ छावनी",
      candidates: [
        { name: "Brajesh Pathak", nameHi: "ब्रजेश पाठक", party: "BJP", color: "#EF6C00", votes: 0, finalVotes: 86000 },
        { name: "Pooja Shukla", nameHi: "पूजा शुक्ला", party: "SP", color: "#2E7D32", votes: 0, finalVotes: 78000 },
        { name: "Dilip Kumar", nameHi: "दिलीप कुमार", party: "BSP", color: "#1565C0", votes: 0, finalVotes: 12000 }
      ]
    }
  ]);

  const [parties, setParties] = useState<PartySim[]>([
    { name: "Bharatiya Janata Party", abbreviation: "BJP", color: "#EF6C00", seats: 0, finalTarget: 215 },
    { name: "Samajwadi Party", abbreviation: "SP", color: "#2E7D32", seats: 0, finalTarget: 145 },
    { name: "Bahujan Samaj Party", abbreviation: "BSP", color: "#1565C0", seats: 0, finalTarget: 25 },
    { name: "Indian National Congress", abbreviation: "INC", color: "#00BCD4", seats: 0, finalTarget: 12 },
    { name: "Others", abbreviation: "OTH", color: "#78909C", seats: 0, finalTarget: 6 }
  ]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLogMessage = (msg: string) => {
    setLog(prev => {
      if (prev.includes(msg)) return prev;
      return [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
    });
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(prevProgress => {
          const nextProgress = prevProgress + 5;
          if (nextProgress >= 100) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // Finish results exactly at targets
            setParties(prev => prev.map(p => ({ ...p, seats: p.finalTarget })));
            
            // Finish candidates exactly at targets
            setConstituencies(prevConsts => 
              prevConsts.map(c => ({
                ...c,
                candidates: c.candidates.map(cand => ({ ...cand, votes: cand.finalVotes }))
              }))
            );

            addLogMessage(TICKER_MESSAGES[TICKER_MESSAGES.length - 1]);
            return 100;
          }

          // Distribute intermediate seats based on progress percentage
          setParties(prev => 
            prev.map(p => {
              const currentTarget = Math.round((p.finalTarget * nextProgress) / 100);
              return { ...p, seats: currentTarget };
            })
          );

          // Distribute candidate votes based on progress percentage
          setConstituencies(prevConsts => 
            prevConsts.map(c => ({
              ...c,
              candidates: c.candidates.map(cand => {
                const currentVotes = Math.round((cand.finalVotes * nextProgress) / 100);
                return { ...cand, votes: currentVotes };
              })
            }))
          );

          // Push corresponding logs
          const logIndex = Math.min(Math.floor((nextProgress / 100) * TICKER_MESSAGES.length), TICKER_MESSAGES.length - 2);
          if (TICKER_MESSAGES[logIndex]) {
            addLogMessage(TICKER_MESSAGES[logIndex]);
          }

          return nextProgress;
        });
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const handlePlayPause = () => {
    if (progress >= 100) {
      handleReset();
      setTimeout(() => setIsPlaying(true), 200);
    } else {
      setIsPlaying(!isPlaying);
      if (!isPlaying && log.length === 0) {
        addLogMessage(TICKER_MESSAGES[0]);
      }
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setLog([]);
    setParties(prev => prev.map(p => ({ ...p, seats: 0 })));
    setConstituencies(prevConsts => 
      prevConsts.map(c => ({
        ...c,
        candidates: c.candidates.map(cand => ({ ...cand, votes: 0 }))
      }))
    );
  };

  const handleFastForward = () => {
    setIsPlaying(false);
    setProgress(100);
    setParties(prev => prev.map(p => ({ ...p, seats: p.finalTarget })));
    setConstituencies(prevConsts => 
      prevConsts.map(c => ({
        ...c,
        candidates: c.candidates.map(cand => ({ ...cand, votes: cand.finalVotes }))
      }))
    );
    setLog([
      `[${new Date().toLocaleTimeString()}] Counting started.`,
      `[${new Date().toLocaleTimeString()}] Rapid counting enabled.`,
      `[${new Date().toLocaleTimeString()}] ${TICKER_MESSAGES[TICKER_MESSAGES.length - 1]}`
    ]);
  };

  const activeConstituency = constituencies.find(c => c.name === selectedConstituency) || constituencies[0];

  const totalSeats = 403;
  const leadSeats = parties.reduce((sum, p) => sum + p.seats, 0);

  // If simulation is not active, display ECI direct election status page
  if (!simulationActive) {
    return (
      <div className="card live-counting-card glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,108,0,0.1)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
            <span style={{ width: '8px', height: '8px', background: '#EF6C00', borderRadius: '50%', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.85rem', color: '#EF6C00', fontWeight: 700 }}>ECI STATUS PORTAL</span>
          </div>
          <h3 className="en" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>Active Direct Elections</h3>
          <span className="hi" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>सक्रिय प्रत्यक्ष चुनाव</span>
        </div>

        <div className="glass-panel" style={{
          background: 'rgba(0,0,0,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '650px',
          margin: '0 auto 2.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <ShieldAlert size={48} style={{ color: 'var(--secondary-color)' }} />
          </div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: '0 0 0.8rem' }}>No Direct State Elections Underway Today</h4>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            As of <strong>June 2, 2026</strong>, no direct legislative assembly elections are actively polling in India.
            <br />
            Rajya Sabha elections are scheduled for June 18, 2026 (indirect vote). General direct citizen assembly elections will resume with <strong>Uttar Pradesh, Punjab, Goa, Uttarakhand, and Manipur</strong> in early 2027.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setSimulationActive(true)}
          style={{
            borderRadius: '30px',
            padding: '0.8rem 2.2rem',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(239,108,0,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={18} className="animate-pulse" /> Launch UP 2027 Simulator Mode / सिम्युलेटर शुरू करें
        </button>
      </div>
    );
  }

  return (
    <div className="card live-counting-card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.4s ease' }}>
      {/* Header and Controls */}
      <div className="sim-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              background: '#D32F2F',
              borderRadius: '50%',
              display: 'inline-block',
              animation: isPlaying ? 'pulseGlow 1s infinite alternate' : 'none'
            }}></span>
            <h3 className="en" style={{ fontSize: '1.5rem', color: 'var(--primary-color)', margin: 0 }}>Active Counting Ticker (UP 2027 Demo)</h3>
          </div>
          <span className="hi" style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>उत्तर प्रदेश विधानसभा - निर्वाचन क्षेत्र मतगणना</span>
        </div>

        <div className="sim-controls" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="sim-btn sim-btn-action"
            onClick={handlePlayPause}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.5rem 1rem', borderRadius: '20px', border: '2px solid var(--primary-color)',
              background: isPlaying ? 'var(--primary-color)' : 'transparent',
              color: isPlaying ? '#fff' : 'var(--primary-color)',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap'
            }}
          >
            {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
          </button>
          <button
            className="sim-btn sim-btn-action"
            onClick={handleReset}
            title="Reset"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.5rem 0.9rem', borderRadius: '20px', border: '2px solid var(--primary-color)',
              background: 'transparent', color: 'var(--primary-color)',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            className="sim-btn sim-btn-action"
            onClick={handleFastForward}
            title="Fast Forward"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.5rem 0.9rem', borderRadius: '20px', border: '2px solid var(--primary-color)',
              background: 'transparent', color: 'var(--primary-color)',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap'
            }}
          >
            <FastForward size={14} /> Skip
          </button>
          <button
            className="sim-btn sim-btn-exit"
            onClick={() => { handleReset(); setSimulationActive(false); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.5rem 1rem', borderRadius: '20px', border: '2px solid #78909C',
              background: '#78909C', color: '#fff',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap'
            }}
          >
            Exit Sim
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          <span>Overall State Counting Progress / राज्य मतगणना प्रगति</span>
          <span>{progress}% ({leadSeats}/{totalSeats} Seats Declared)</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--secondary-color)', transition: 'width 0.4s ease' }}></div>
        </div>
      </div>

      {/* Main Grid: Constituency Candidates and State Tally */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Constituency Candidate Matchups */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          {/* Constituency Selector Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Constituency Matchup</span>
              <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>{activeConstituency.name}</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeConstituency.nameHi}</span>
            </div>
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'var(--white)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {constituencies.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Candidates Standings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {activeConstituency.candidates.map((cand) => {
              const maxVotes = Math.max(...activeConstituency.candidates.map(c => c.votes));
              const isLeading = cand.votes > 0 && cand.votes === maxVotes;
              const hasWon = progress === 100 && isLeading;

              return (
                <div key={cand.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', background: cand.color, borderRadius: '50%' }}></div>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>{cand.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cand.nameHi} ({cand.party})</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{cand.votes.toLocaleString()}</strong>
                      {hasWon ? (
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'green', fontWeight: 800 }}>WON / विजयी</span>
                      ) : isLeading ? (
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--secondary-color)', fontWeight: 800 }}>LEADING / आगे</span>
                      ) : cand.votes > 0 ? (
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>TRAILING / पीछे</span>
                      ) : null}
                    </div>
                  </div>
                  {/* Progress Bar for candidate votes share relative to finalVotes */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${cand.finalVotes > 0 ? (cand.votes / cand.finalVotes) * 100 : 0}%`,
                      height: '100%',
                      background: cand.color,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Party Tallies & Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Party Tally Card */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <h5 style={{ margin: '0 0 0.8rem', color: 'var(--primary-color)', fontSize: '1.05rem', fontWeight: 700 }}>
              State Assembly Seat Tally / पार्टीवार स्थिति
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {parties.map(party => {
                const percentage = (party.seats / totalSeats) * 100;
                return (
                  <div key={party.abbreviation} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem' }}>
                    <span style={{ width: '35px', fontWeight: 700, color: 'var(--text-main)' }}>{party.abbreviation}</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(percentage, 1)}%`, height: '100%', background: party.color }}></div>
                    </div>
                    <span style={{ width: '25px', fontWeight: 800, color: 'var(--primary-color)', textAlign: 'right' }}>{party.seats}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logging Console */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            background: 'rgba(0,0,0,0.02)',
            height: '140px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: 'var(--primary-color)', 
              color: 'white', 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem' 
            }}>
              <List size={14} />
              <span>ECI Ticker Logs / मतगणना लॉग</span>
            </div>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '0.6rem', 
              fontSize: '0.75rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              lineHeight: 1.3
            }}>
              {log.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
                  Press Play to begin logs...
                </div>
              ) : (
                log.map((entry, index) => (
                  <div key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '0.3rem', color: 'var(--text-main)' }}>
                    {entry}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
