"use client";

import { useEffect, useState } from 'react';
import { Calendar, MapPin, BarChart2, CheckCircle2, ExternalLink } from 'lucide-react';
import * as analytics from '../../lib/analytics';

type StateElectionData = {
  _id: string;
  stateName: string;
  stateNameHi: string;
  year: number;
  dateRange: string;
  dateRangeHi: string;
  totalSeats: number;
  status: 'Completed' | 'Upcoming';
  phases: number;
  infoUrl: string;
};

type ElectionResultData = {
  _id: string;
  stateName: string;
  partyName: string;
  partyNameHi: string;
  seatsWon: number;
  voteShare: string;
  color: string;
};

export default function StateElectionsDashboard() {
  const [elections, setElections] = useState<StateElectionData[]>([]);
  const [results, setResults] = useState<ElectionResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');
  const [selectedResultState, setSelectedResultState] = useState<string>('West Bengal');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/state-elections');
        if (res.ok) {
          const data = await res.json();
          setElections(data.stateElections || []);
          setResults(data.electionResults || []);
        }
      } catch (error) {
        console.error('Error fetching state elections data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading Election Schedules... / चुनाव कार्यक्रम लोड हो रहे हैं...
      </div>
    );
  }

  const upcomingElections = elections.filter(el => el.status === 'Upcoming');
  const completedElections = elections.filter(el => el.status === 'Completed');
  
  // Filter results for the currently selected state in the results tab
  const activeResults = results.filter(r => r.stateName === selectedResultState);
  const selectedStateObj = elections.find(e => e.stateName === selectedResultState);

  return (
    <div className="card elections-dashboard-card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Header and bilingual title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 className="en" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>State Assembly Elections</h3>
        <span className="hi" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>राज्य विधानसभा चुनाव</span>
      </div>

      {/* Tabs selector */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => {
            setActiveTab('upcoming');
            analytics.event('view_dashboard_tab', { category: 'Dashboard', label: 'upcoming' });
          }}
          style={{
            flex: 1,
            padding: '1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'upcoming' ? '3px solid var(--secondary-color)' : 'none',
            fontWeight: activeTab === 'upcoming' ? 'bold' : 'normal',
            color: activeTab === 'upcoming' ? 'var(--primary-color)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Calendar size={18} />
          <div>
            <div className="en">Upcoming (2027)</div>
            <div className="hi" style={{ fontSize: '0.75rem', fontWeight: activeTab === 'upcoming' ? 600 : 400 }}>आगामी चुनाव (2027)</div>
          </div>
        </button>
        <button 
          onClick={() => {
            setActiveTab('recent');
            analytics.event('view_dashboard_tab', { category: 'Dashboard', label: 'recent' });
          }}
          style={{
            flex: 1,
            padding: '1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'recent' ? '3px solid var(--secondary-color)' : 'none',
            fontWeight: activeTab === 'recent' ? 'bold' : 'normal',
            color: activeTab === 'recent' ? 'var(--primary-color)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <BarChart2 size={18} />
          <div>
            <div className="en">Recent Results (2026)</div>
            <div className="hi" style={{ fontSize: '0.75rem', fontWeight: activeTab === 'recent' ? 600 : 400 }}>हाल के परिणाम (2026)</div>
          </div>
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'upcoming' ? (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {upcomingElections.map((item) => (
              <div key={item._id} className="state-schedule-card" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                {/* Visual Accent Tag */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '5px',
                  height: '100%',
                  background: 'var(--primary-color)'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--primary-color)' }}>{item.stateName}</h4>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.stateNameHi}</span>
                  </div>
                  <span style={{
                    background: 'rgba(0,51,102,0.1)',
                    color: 'var(--primary-color)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {item.totalSeats} SEATS
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Calendar size={16} style={{ color: 'var(--secondary-color)' }} />
                    <div>
                      <strong>{item.dateRange}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dateRangeHi}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={16} />
                    <span>Phases / चरण: {item.phases}</span>
                  </div>
                </div>

                <a 
                  href={item.infoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem'
                  }}
                >
                  ECI Guidelines / दिशानिर्देश <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {/* Selector for 2026 Completed States */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
            {completedElections.map(el => (
              <button
                key={el._id}
                onClick={() => {
                  setSelectedResultState(el.stateName);
                  analytics.event('select_state_results', { category: 'Dashboard', label: el.stateName });
                }}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  border: '1px solid var(--primary-color)',
                  background: selectedResultState === el.stateName ? 'var(--primary-color)' : 'transparent',
                  color: selectedResultState === el.stateName ? 'var(--white)' : 'var(--primary-color)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  fontSize: '0.9rem'
                }}
              >
                {el.stateName} ({el.year})
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Visual Breakdown Panel */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.5rem'
            }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary-color)' }}>
                  {selectedResultState} Assembly Results
                </h4>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {selectedStateObj?.stateNameHi} विधानसभा परिणाम ({selectedStateObj?.year})
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {activeResults.map(party => {
                  const percentage = selectedStateObj ? (party.seatsWon / selectedStateObj.totalSeats) * 100 : 0;
                  return (
                    <div key={party._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-main)' }}>
                          {party.partyName} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', fontWeight: 400 }}>{party.partyNameHi}</span>
                        </span>
                        <span style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1rem', color: 'var(--primary-color)', fontWeight: 800 }}>{party.seatsWon}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 400 }}>{party.voteShare} votes</span>
                        </span>
                      </div>
                      
                      {/* Custom styled HTML progress bar */}
                      <div style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        marginTop: '0.2rem'
                      }}>
                        <div style={{
                          width: `${Math.max(percentage, 2)}%`,
                          height: '100%',
                          background: party.color,
                          borderRadius: '5px',
                          transition: 'width 1s cubic-bezier(0.1, 0.8, 0.3, 1)'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Metadata Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(46,125,50,0.05)',
                border: '1px solid rgba(46,125,50,0.2)',
                borderRadius: '10px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <CheckCircle2 color="green" size={28} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <div>
                  <h5 style={{ margin: 0, color: 'green', fontSize: '1.1rem', fontWeight: 700 }}>Government Formed / सरकार गठन</h5>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {selectedResultState === 'West Bengal' && "BJP formed the government with Suvendu Adhikari sworn in as Chief Minister."}
                    {selectedResultState === 'Tamil Nadu' && "DMK alliance (SPA) retained power with M.K. Stalin as Chief Minister."}
                    {selectedResultState === 'Kerala' && "LDF retained legislative majority under Pinarayi Vijayan as Chief Minister."}
                    {selectedResultState === 'Assam' && "BJP-led NDA alliance formed government returning to power in the state."}
                    {selectedResultState === 'Puducherry' && "AINRC + BJP coalition successfully formed government."}
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '1.5rem'
              }}>
                <h5 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  Election Metrics / चुनाव आँकड़े
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-muted)' }}>
                  <li>Total Constituency Seats: <strong>{selectedStateObj?.totalSeats}</strong></li>
                  <li>Polling Phases: <strong>{selectedStateObj?.phases} phase(s)</strong></li>
                  <li>Official Notification: <strong>ECI Press Release ({selectedStateObj?.year})</strong></li>
                  <li>Voter Turnout: <strong>~78.4% Average</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
