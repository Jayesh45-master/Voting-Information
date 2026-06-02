"use client";

import { useEffect, useState } from 'react';

type News = {
  _id: string;
  headline: string;
  headlineHi: string;
  source: string;
  date: string;
  link: string;
};

export default function NewsSection() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          const sortedNews = data.sort((a: News, b: News) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setNews(sortedNews);
        }
      } catch (error) {
        console.error('Error fetching news', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) return null;
  if (news.length === 0) return null;

  return (
    <div className="notices-grid">
      {news.map((item) => {
        const dateObj = new Date(item.date);
        const dateString = dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'short', day: 'numeric' 
        });

        return (
          <a key={item._id} href={item.link} className="notice-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              {item.source} • {dateString}
            </div>
            <div className="bilingual-text" style={{ marginBottom: 0 }}>
              <h3 className="en" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.headline}</h3>
              <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
              <div className="hi" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{item.headlineHi}</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
