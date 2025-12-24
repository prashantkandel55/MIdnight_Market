
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Asset, MarketMode, Blockchain } from './types';
import AssetCard from './components/AssetCard';
import AssetDetail from './components/AssetDetail';
import NewsFeed from './components/NewsFeed';
import ChatBot from './components/ChatBot';

type SortKey = 'market_cap' | 'price_change' | 'volume' | 'name';
type SortOrder = 'desc' | 'asc';
type Theme = 'dark' | 'light';

// Updated Logo component to use your PNG file
const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`${className} relative group`}>
    {/* Subtle glow effect behind the PNG */}
    <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
    <img 
      src="./favicon.png" 
      alt="Midnight Markets Logo" 
      className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]"
      onError={(e) => {
        // Fallback if the png is missing
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
);

const BackgroundAnimation: React.FC<{ theme: Theme; mode: MarketMode }> = ({ theme, mode }) => {
  const isDark = theme === 'dark';
  const isMemecoin = mode === 'memecoins';
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-transparent">
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none z-50" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className={`absolute inset-0 z-0`}>
        <div className={`absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px] transition-all duration-1000 animate-drift-slow ${isMemecoin ? 'bg-fuchsia-500/10' : 'bg-emerald-500/10'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[140px] transition-all duration-1000 animate-drift-medium ${isMemecoin ? 'bg-cyan-500/10' : 'bg-violet-600/10'}`} />
        <div className={`absolute top-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] transition-all duration-1000 animate-drift-fast ${isDark ? 'bg-white/[0.02]' : 'bg-slate-300/30'}`} />
      </div>
      
      <div className={`absolute inset-0 transition-colors duration-1000 pointer-events-none z-30 ${isDark ? 'bg-radial-vignette-dark' : 'bg-radial-vignette-light'}`} />
    </div>
  );
};

const AssetCardSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  const bgClass = theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-slate-200';
  const shimmerClass = theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-100';
  
  return (
    <div className={`aspect-square border rounded-2xl p-6 flex flex-col gap-4 animate-pulse ${bgClass}`}>
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-xl ${shimmerClass}`}></div>
        <div className={`w-8 h-3 rounded ${shimmerClass}`}></div>
      </div>
      <div className="mt-auto space-y-3">
        <div className="space-y-2">
          <div className={`w-12 h-2 rounded ${shimmerClass}`}></div>
          <div className={`w-24 h-6 rounded ${shimmerClass}`}></div>
        </div>
        <div className={`w-16 h-3 rounded ${shimmerClass}`}></div>
        <div className={`w-full h-10 rounded ${shimmerClass} mt-2`}></div>
      </div>
    </div>
  );
};

const LiveClock: React.FC<{ theme: Theme }> = ({ theme }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const date = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="fixed top-12 right-12 z-50 pointer-events-none hidden lg:flex flex-col items-end">
      <div className={`flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase transition-colors pointer-events-auto cursor-default ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>
        <span>[</span>
        <span className={theme === 'dark' ? 'text-white/40' : 'text-slate-600'}>{day}</span>
        <span className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></span>
        <span>{date}</span>
        <span className={`${theme === 'dark' ? 'text-white/60' : 'text-slate-900'} mono`}>{time}</span>
        <span>]</span>
      </div>
    </div>
  );
};

const ThemeToggle: React.FC<{ theme: Theme, onToggle: () => void }> = ({ theme, onToggle }) => {
  return (
    <div className="fixed top-12 left-12 z-50 hidden lg:flex">
      <button 
        onClick={onToggle}
        className={`flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase transition-all active:scale-95 hover:opacity-100 ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}
      >
        <span>[</span>
        <span>PROTOCOL:</span>
        <span className={theme === 'dark' ? 'text-white/60' : 'text-slate-900 font-black'}>{theme === 'dark' ? 'MIDNIGHT' : 'DAYLIGHT'}</span>
        <span>]</span>
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('market_cap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [theme, setTheme] = useState<Theme>('dark');
  const [marketMode, setMarketMode] = useState<MarketMode>('bluechips');
  const [blockchain, setBlockchain] = useState<Blockchain>('all');

  const fetchBluechips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`
      );
      if (!response.ok) throw new Error('Liquidity feed dropped.');
      const data = await response.json();
      setAssets(data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        currentPrice: coin.current_price,
        priceChange24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        sparklineData: coin.sparkline_in_7d.price,
        image: coin.image,
        rank: coin.market_cap_rank
      })));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemecoins = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (query && query.trim().length > 0) {
        endpoint = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
      } else {
        endpoint = 'https://api.dexscreener.com/token-profiles/latest/v1';
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Dex communication failed");
      const data = await response.json();

      let pairResults = [];
      if (query && query.trim().length > 0) {
        pairResults = data.pairs || [];
      } else {
        const addresses = Array.isArray(data) 
          ? data.slice(0, 50).map((p: any) => p.tokenAddress).join(',')
          : '';
        
        if (!addresses) {
          setAssets([]);
          setLoading(false);
          return;
        }

        const pairsResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
        if (!pairsResponse.ok) throw new Error("Pair data uplink failed");
        const pairData = await pairsResponse.json();
        pairResults = pairData.pairs || [];
      }

      const mappedAssets: Asset[] = [];
      const seenTokens = new Set<string>();

      const filteredPairs = blockchain === 'all' 
        ? pairResults 
        : pairResults.filter((p: any) => p.chainId === (blockchain === 'bsc' ? 'bsc' : blockchain));

      const sortedPairs = filteredPairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));

      sortedPairs.forEach((pair: any) => {
        const tokenAddress = pair.baseToken.address;
        if (!seenTokens.has(tokenAddress)) {
          seenTokens.add(tokenAddress);
          mappedAssets.push({
            id: tokenAddress,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            currentPrice: parseFloat(pair.priceUsd || '0'),
            priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
            marketCap: parseFloat(pair.fdv || '0'),
            volume24h: parseFloat(pair.volume?.h24 || '0'),
            sparklineData: [], 
            image: `https://dd.dexscreener.com/ds-data/tokens/${pair.chainId}/${tokenAddress}.png`,
            rank: 999,
            blockchain: pair.chainId,
            contractAddress: tokenAddress
          });
        }
      });

      setAssets(mappedAssets);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(err);
      setError("Dex Uplink Interrupted");
    } finally {
      setLoading(false);
    }
  }, [blockchain]);

  useEffect(() => {
    if (marketMode === 'bluechips') {
      fetchBluechips();
    } else {
      if (searchQuery.trim().length > 0) {
        const timer = setTimeout(() => fetchMemecoins(searchQuery), 600);
        return () => clearTimeout(timer);
      } else {
        fetchMemecoins();
      }
    }
  }, [marketMode, blockchain, searchQuery, fetchBluechips, fetchMemecoins]);

  const processedAssets = useMemo(() => {
    let result = [...assets];
    if (marketMode === 'bluechips' && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      result = assets.filter(a => a.name.toLowerCase().includes(query) || a.symbol.toLowerCase().includes(query));
    }
    result.sort((a, b) => {
      let comp = 0;
      if (sortKey === 'market_cap') comp = b.marketCap - a.marketCap;
      else if (sortKey === 'price_change') comp = b.priceChange24h - a.priceChange24h;
      else if (sortKey === 'volume') comp = b.volume24h - a.volume24h;
      else if (sortKey === 'name') comp = a.name.localeCompare(b.name);
      return sortOrder === 'desc' ? comp : -comp;
    });
    return result;
  }, [assets, searchQuery, sortKey, sortOrder, marketMode]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const containerClasses = theme === 'dark' 
    ? "min-h-screen flex flex-col bg-[#020202] text-white selection:bg-white selection:text-black transition-colors duration-1000 ease-out relative z-10" 
    : "min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 selection:bg-black selection:text-white transition-colors duration-1000 ease-out relative z-10";

  const headerBg = theme === 'dark' ? "bg-[#020202]/40 border-white/[0.03]" : "bg-white/40 border-slate-200";

  return (
    <div className={theme === 'dark' ? 'bg-black' : 'bg-slate-50'}>
      <BackgroundAnimation theme={theme} mode={marketMode} />
      
      <div className={containerClasses}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <LiveClock theme={theme} />

        <header className={`p-12 pb-12 flex flex-col items-center sticky top-0 backdrop-blur-3xl z-40 border-b transition-all duration-500 ${headerBg}`}>
          <div className="text-center mb-10 flex flex-col items-center gap-4">
            <Logo className="w-24 h-24 mb-2 animate-in fade-in zoom-in-50 duration-1000" />
            <h1 className="text-4xl font-black uppercase tracking-[1em] leading-none mb-2 animate-in fade-in slide-in-from-top-4 duration-700">Midnight Markets</h1>
            <div className={`text-[10px] uppercase font-black tracking-[0.4em] ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Global Volatility Surveillance Uplink</div>
          </div>

          <div className="w-full max-w-5xl flex flex-col gap-8">
            <div className="flex justify-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 max-w-fit mx-auto">
              {(['bluechips', 'memecoins'] as MarketMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setMarketMode(mode); setBlockchain('all'); setSearchQuery(''); }}
                  className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${
                    marketMode === mode 
                    ? theme === 'dark' ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]" : "bg-slate-900 text-white shadow-lg"
                    : theme === 'dark' ? "bg-white/5 text-white/40 hover:text-white" : "bg-white border-slate-200 text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {marketMode === 'memecoins' && (
              <div className="flex justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                {(['all', 'solana', 'ethereum', 'base', 'bsc'] as Blockchain[]).map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setBlockchain(chain)}
                    className={`px-5 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                      blockchain === chain 
                      ? "text-emerald-500 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                      : theme === 'dark' ? "text-white/20 border-white/5 hover:border-white/20 hover:text-white/50" : "text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {chain === 'all' ? (searchQuery ? 'GLOBAL SEARCH' : 'TRENDING') : chain.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            
            <div className="relative group">
              <input 
                type="text" 
                placeholder={marketMode === 'bluechips' ? "Surveil assets..." : "Deep-search contract or ticker..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-2xl px-10 py-6 text-sm focus:outline-none transition-all duration-500 shadow-2xl border-2 ${
                  theme === 'dark' 
                    ? "bg-white/[0.03] border-white/5 focus:border-white/20 placeholder:text-white/10" 
                    : "bg-white border-slate-100 focus:border-slate-300 placeholder:text-slate-300"
                }`}
              />
            </div>
            
            <div className="flex justify-center gap-2">
              {[
                { id: 'market_cap', label: 'Cap' },
                { id: 'price_change', label: 'Delta' },
                { id: 'volume', label: 'Liq' }
              ].map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => {
                    if (sortKey === sort.id) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    else { setSortKey(sort.id as SortKey); setSortOrder('desc'); }
                  }}
                  className={`px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-300 border ${
                    sortKey === sort.id 
                      ? theme === 'dark' ? "bg-white text-black border-white" : "bg-slate-900 text-white border-slate-900"
                      : theme === 'dark' ? "bg-white/5 border-white/5 text-white/30" : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {sort.label} {sortKey === sort.id && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-grow p-12 max-w-[1800px] mx-auto w-full relative z-10">
          <NewsFeed theme={theme} />
          {loading && assets.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {Array(18).fill(0).map((_, i) => <AssetCardSkeleton key={i} theme={theme} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {processedAssets.map((asset, idx) => (
                <div key={asset.id} className="animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both" style={{ animationDelay: `${Math.min(idx * 20, 400)}ms` }}>
                  <AssetCard asset={asset} onClick={setSelectedAsset} theme={theme} />
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className={`p-12 border-t flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] ${theme === 'dark' ? 'border-white/[0.03] text-white/20' : 'border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-12">
            <span className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
               MIDNIGHT_MARKETS // {marketMode.toUpperCase()}
            </span>
            <span>UPLINK_ENCRYPTED</span>
            <span className="mono">ACTIVE_SENSORS: {assets.length}</span>
          </div>
          <div className="flex items-center gap-12">
            <span className="mono">T_SYNC: {lastUpdated?.toLocaleTimeString()}</span>
            <span className="opacity-20 hidden md:block">MMXXV_TERMINAL</span>
            <span className="text-emerald-500/40">MADE BY ANCIENTIORR</span>
          </div>
        </footer>

        {selectedAsset && <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} theme={theme} />}
        <ChatBot theme={theme} />

        <style>{`
          @keyframes drift {
            0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
            50% { transform: translate3d(2%, 4%, 0) scale(1.1) rotate(5deg); }
            100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          }
          .animate-drift-slow { animation: drift 40s infinite ease-in-out; will-change: transform; }
          .animate-drift-medium { animation: drift 30s infinite ease-in-out reverse; will-change: transform; }
          .animate-drift-fast { animation: drift 20s infinite ease-in-out; will-change: transform; }
          .bg-radial-vignette-dark { background: radial-gradient(circle at center, transparent 0%, rgba(2,2,2,0.9) 100%); }
          .bg-radial-vignette-light { background: radial-gradient(circle at center, transparent 0%, rgba(248,249,250,0.7) 100%); }
        `}</style>
      </div>
    </div>
  );
};

export default App;
