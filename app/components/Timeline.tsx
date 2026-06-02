"use client";

import { useEffect, useState } from 'react';

type Event = {
  _id: string;
  title: string;
  titleHi: string;
  date: string;
  description: string;
  descriptionHi: string;
  isImportant: boolean;
};

export default function Timeline() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch('/api/timeline');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching timeline', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading timeline...</div>;
  if (events.length === 0) return null;

  return (
    <div className="timeline">
      {events.map((event) => {
        const dateObj = new Date(event.date);
        const dateString = dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        });

        return (
          <div key={event._id} className={`timeline-item ${event.isImportant ? 'important' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="timeline-date">{dateString}</span>
              <div className="bilingual-text" style={{ marginBottom: 0 }}>
                <h3 className="en" style={{ marginBottom: '0.25rem' }}>{event.title}</h3>
                <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
                <div className="hi" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{event.titleHi}</div>
              </div>
              <div className="bilingual-text" style={{ marginTop: '1rem', marginBottom: 0 }}>
                <p className="en">{event.description}</p>
                <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
                <p className="hi">{event.descriptionHi}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
