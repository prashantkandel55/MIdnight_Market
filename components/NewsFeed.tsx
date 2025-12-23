
import React, { useState, useEffect, useRef } from 'react';

interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  timestamp: string;
  source: string;
}

interface CacheData {
  items: NewsItem[];
  expiry: number;
}

const CACHE_KEY = 'midnight_market_news_cache_v2';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for direct feed

const NewsFeed: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNews = async (force = false) => {
    // 1. Check Cache
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CacheData = JSON.parse(cached);
          if (Date.now() < parsed.expiry) {
            setNews(parsed.items);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }

    setLoading(true);
    setError(false);
    
    try {
      // Direct fetch to a public aggregator (no API key required for basic usage)
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      if (!response.ok) throw new Error("Public uplink failed");
      
      const data = await response.json();
      
      if (data && data.Data) {
        const mappedItems: NewsItem[] = data.Data.slice(0, 15).map((item: any) => {
          const date = new Date(item.published_on * 1000);
          return {
            headline: item.title,
            summary: item.body.length > 120 ? item.body.substring(0, 117) + '...' : item.body,
            url: item.url,
            source: item.source_info?.name || 'CRYPTO_INTEL',
            timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });

        setNews(mappedItems);
        
        // Update Cache
        const cacheData: CacheData = {
          items: mappedItems,
          expiry: Date.now() + CACHE_TTL
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (err) {
      console.error("Public news fetch failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
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
      <div className="flex items-center gap-4 mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-emerald-500'} animate-ping opacity-75`}></div>
          </div>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.6em] ${headerLabel}`}>Public_Intel_Feed</h3>
        </div>
        <div className={`h-[1px] flex-grow ${theme === 'dark' ? 'bg-white/[0.05]' : 'bg-slate-200'}`}></div>
        <div className="flex items-center gap-6">
          <span className={`text-[8px] font-black uppercase tracking-widest mono hidden md:block ${statusLabel}`}>
            {loading ? 'UPLINKING...' : 'REALTIME_SYNC'}
          </span>
          <button 
            onClick={() => fetchNews(true)}
            disabled={loading}
            className={`text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-30 ${btnColor}`}
          >
            {loading ? 'Processing...' : 'Refresh_Feed'}
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide-custom snap-x"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {loading && news.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className={`min-w-[340px] h-32 border rounded-2xl p-5 flex flex-col justify-between ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-slate-200'}`}>
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
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mono">{item.source}</span>
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest mono">•</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mono">{item.timestamp}</span>
                  </div>
                  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Open</span>
                    <span className="text-xs">↗</span>
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
        .scrollbar-hide-custom::-webkit-scrollbar { display: none; }
        .scrollbar-hide-custom { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {error && !loading && (
        <div className="mt-4 text-center">
          <p className="text-[9px] font-black text-red-500/40 uppercase tracking-[0.4em]">Public Feed Offline — Reconnecting...</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
