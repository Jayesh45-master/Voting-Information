import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { NewsArticle } from '@/lib/models';

interface NewsItem {
  _id: string;
  headline: string;
  headlineHi: string;
  source: string;
  date: string;
  link: string;
}

function parseRSS(xml: string) {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const linkRegex = /<link>([\s\S]*?)<\/link>/;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/;

  let match;
  let idCounter = 1;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(titleRegex);
    const linkMatch = itemContent.match(linkRegex);
    const pubDateMatch = itemContent.match(pubDateRegex);
    const sourceMatch = itemContent.match(sourceRegex);

    if (titleMatch && linkMatch) {
      const fullTitle = titleMatch[1].trim()
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      
      const link = linkMatch[1].trim();
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
      let source = sourceMatch ? sourceMatch[1].trim() : '';
      
      let headline = fullTitle;
      const lastDash = fullTitle.lastIndexOf(' - ');
      if (lastDash !== -1) {
        headline = fullTitle.substring(0, lastDash).trim();
        if (!source) {
          source = fullTitle.substring(lastDash + 3).trim();
        }
      }
      
      if (!source) {
        source = 'Election News';
      }

      items.push({
        _id: `rss-${idCounter++}`,
        headline: headline,
        headlineHi: `[लाइव अपडेट] ${headline}`,
        source: source,
        date: new Date(pubDate).toISOString(),
        link: link
      });
    }
  }
  return items;
}

export async function GET() {
  try {
    // Attempt to fetch live news from Google News RSS feed
    const res = await fetch('https://news.google.com/rss/search?q=elections+india&hl=en-IN&gl=IN&ceid=IN:en', {
      next: { revalidate: 600 } // Cache results for 10 minutes
    });

    if (res.ok) {
      const xmlText = await res.text();
      const parsedNews = parseRSS(xmlText);
      if (parsedNews.length > 0) {
        return NextResponse.json(parsedNews, { status: 200 });
      }
    }
  } catch (error) {
    console.error('Failed to fetch live RSS news. Falling back to database...', error);
  }

  // Fallback to seeded MongoDB news articles if fetch fails
  try {
    await dbConnect();
    const news = await NewsArticle.find({}).sort({ date: -1 });
    return NextResponse.json(news, { status: 200 });
  } catch (dbError) {
    console.error('Database fallback error fetching news:', dbError);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
