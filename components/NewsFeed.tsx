
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  timestamp: string;
}

interface CacheData {
  items: NewsItem[];
  expiry: number;
}

const CACHE_KEY = 'midnight_market_news_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const NewsFeed: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNews = async (force = false) => {
    // 1. Check Cache if not forcing
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CacheData = JSON.parse(cached);
          if (Date.now() < parsed.expiry) {
            setNews(parsed.items);
            setLoading(false);
            setIsCached(true);
            return;
          }
        } catch (e) {
          console.warn("News cache corrupted, clearing...");
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }

    // 2. Perform fresh fetch
    setLoading(true);
    setError(false);
    setIsCached(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "List the 8 most important and latest cryptocurrency news stories from the last 12 hours. For each, provide a short headline (max 8 words) and a very brief summary (max 15 words). Focus on market impact. Be extremely concise for a ticker format.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const lines = text.split('\n').filter(l => l.trim().length > 10);
      
      const newsItems: NewsItem[] = [];
      const now = new Date();

      for (let i = 0; i < Math.min(lines.length, 8); i++) {
        const url = chunks[i]?.web?.uri || chunks[0]?.web?.uri || "#";
        newsItems.push({
          headline: lines[i].replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').split(':')[0] || "Market Intel",
          summary: lines[i].includes(':') ? lines[i].split(':').slice(1).join(':').trim() : lines[i],
          url: url,
          timestamp: new Date(now.getTime() - i * 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      if (newsItems.length > 0) {
        setNews(newsItems);
        // 3. Update Cache
        const cacheData: CacheData = {
          items: newsItems,
          expiry: Date.now() + CACHE_TTL
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } else {
        throw new Error("Empty intel response");
      }
    } catch (err) {
      console.error("News fetch failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-refresh interval (5 mins) still checks TTL inside fetchNews
    const interval = setInterval(() => fetchNews(), 300000); 
    return () => clearInterval(interval);
  }, []);

  const headerLabel = theme === 'dark' ? 'text-white/30' : 'text-slate-400';
  const statusLabel = theme === 'dark' ? 'text-white/10' : 'text-slate-300';
  const btnColor = theme === 'dark' ? 'text-white/20 hover:text-emerald-500/60' : 'text-slate-400 hover:text-slate-900';
  const cardBg = theme === 'dark' ? 'bg-white/[0.015] hover:bg-white/[0.04] border-white/[0.05] hover:border-white/10' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm';
  const headlineColor = theme === 'dark' ? 'text-white/80 group-hover:text-white' : 'text-slate-900 group-hover:text-black';
  const summaryColor = theme === 'dark' ? 'text-white/20 group-hover:text-white/40' : 'text-slate-400 group-hover:text-slate-600';

  return (
    <div className="w-full mb-12 animate-in fade-in slide-in-from-top-2 duration-1000">
      {/* Ticker Header */}
      <div className="flex items-center gap-4 mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-emerald-500'} animate-ping opacity-75`}></div>
          </div>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.6em] ${headerLabel}`}>Live_Intel_Stream</h3>
        </div>
        <div className={`h-[1px] flex-grow ${theme === 'dark' ? 'bg-white/[0.05]' : 'bg-slate-200'}`}></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isCached && <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border border-current opacity-30 ${statusLabel}`}>CACHED</span>}
            <span className={`text-[8px] font-black uppercase tracking-widest mono hidden md:block ${statusLabel}`}>Status: {loading ? 'SYNCING_V3' : 'READY_SECURE'}</span>
          </div>
          <button 
            onClick={() => fetchNews(true)}
            disabled={loading}
            className={`text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-30 ${btnColor}`}
          >
            {loading ? 'Processing...' : 'Force_Sync'}
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide-custom snap-x"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {loading && news.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className={`min-w-[300px] h-28 border rounded-2xl p-5 flex flex-col justify-between ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-slate-200'}`}>
              <div className={`w-full h-2 rounded animate-pulse ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
              <div className={`w-2/3 h-2 rounded animate-pulse mt-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
              <div className={`w-1/4 h-2 rounded animate-pulse mt-auto ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
            </div>
          ))
        ) : (
          news.map((item, idx) => (
            <a 
              key={idx} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`min-w-[340px] max-w-[340px] border p-5 rounded-2xl transition-all duration-300 group flex flex-col justify-between snap-start ${cardBg}`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest mono">{item.timestamp}</span>
                  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Read</span>
                    <span className="text-xs">→</span>
                  </div>
                </div>
                <h4 className={`text-[12px] font-bold leading-snug line-clamp-2 transition-colors ${headlineColor}`}>
                  {item.headline}
                </h4>
              </div>
              <p className={`text-[10px] line-clamp-1 mt-3 font-medium italic transition-colors ${summaryColor}`}>
                {item.summary}
              </p>
            </a>
          ))
        )}
      </div>

      <style>{`
        .scrollbar-hide-custom::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide-custom {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {error && !loading && (
        <div className="mt-4 text-center">
          <p className="text-[9px] font-black text-red-500/40 uppercase tracking-[0.4em]">Signal Interference — Using Previous Intel</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
