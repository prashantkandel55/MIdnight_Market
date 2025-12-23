
import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, YAxis, XAxis, Tooltip, AreaChart, Area, ReferenceArea } from 'recharts';
import { Asset, TimeFrame, DetailedHistoryPoint } from '../types';

interface AssetDetailProps {
  asset: Asset;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onClose, theme = 'dark' }) => {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>(TimeFrame.D7);
  const [history, setHistory] = useState<DetailedHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [left, setLeft] = useState<string | 'dataMin'>('dataMin');
  const [right, setRight] = useState<string | 'dataMax'>('dataMax');

  const fetchHistory = useCallback(async (days: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${asset.id}/market_chart?vs_currency=usd&days=${days}`
      );
      if (!response.ok) throw new Error('API Rate Limit');
      const data = await response.json();
      
      const mappedHistory: DetailedHistoryPoint[] = data.prices.map((p: [number, number]) => {
        const date = new Date(p[0]);
        return {
          timestamp: p[0],
          timeLabel: days === '1' 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          price: p[1]
        };
      });
      
      setHistory(mappedHistory);
      setLeft('dataMin');
      setRight('dataMax');
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  }, [asset.id]);

  useEffect(() => {
    fetchHistory(activeTimeframe);
  }, [activeTimeframe, fetchHistory]);

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === null) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }
    let [newLeft, newRight] = [refAreaLeft!, refAreaRight!];
    if (newLeft > newRight) [newLeft, newRight] = [newRight, newLeft];
    setLeft(newLeft);
    setRight(newRight);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const isPositive = asset.priceChange24h >= 0;
  const themeColor = isPositive ? '#10b981' : '#ef4444';

  const formatCurrency = (val: number) => {
    if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    return val.toLocaleString();
  };

  const timeframeLabels: Record<string, string> = {
    [TimeFrame.H24]: '24H', [TimeFrame.D7]: '7D', [TimeFrame.D30]: '30D', [TimeFrame.Y1]: '1Y'
  };

  const containerBg = theme === 'dark' ? 'bg-[#020202]' : 'bg-[#F8F9FA]';
  const headerBg = theme === 'dark' ? 'bg-black/40 border-white/[0.05]' : 'bg-white/80 border-slate-200 shadow-sm';
  const btnClasses = theme === 'dark' ? 'bg-white/[0.03] text-white/40 border-white/[0.05] hover:border-white/20 hover:text-white' : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-900';
  const tfBtnActive = theme === 'dark' ? 'bg-white text-black shadow-white/10' : 'bg-slate-900 text-white shadow-black/10';
  const tfBtnInactive = theme === 'dark' ? 'text-white/20 hover:text-white/50' : 'text-slate-400 hover:text-slate-900';
  const heroTextMuted = theme === 'dark' ? 'text-white/30' : 'text-slate-400';
  const heroTextAccent = theme === 'dark' ? 'text-white/60' : 'text-slate-600';
  const priceColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const pricePrefix = theme === 'dark' ? 'text-white/10' : 'text-slate-200';
  const footerBg = theme === 'dark' ? 'bg-white/[0.01] border-white/[0.05]' : 'bg-white border-slate-200';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors ${containerBg}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] blur-[140px] rounded-full opacity-10 transition-colors duration-1000 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      </div>

      <header className={`px-8 py-6 flex justify-between items-center border-b relative z-10 backdrop-blur-xl transition-all duration-300 ${headerBg}`}>
        <button 
          onClick={onClose}
          className={`group flex items-center gap-3 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all duration-200 active:scale-95 ${btnClasses}`}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Return
        </button>
        
        <div className={`flex gap-1.5 p-1 rounded-full border transition-colors ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-slate-100 border-slate-200'}`}>
          {[TimeFrame.H24, TimeFrame.D7, TimeFrame.D30, TimeFrame.Y1].map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-5 py-2 rounded-full text-[10px] font-black tracking-tighter transition-all duration-200 active:scale-95 ${
                activeTimeframe === tf ? tfBtnActive : tfBtnInactive
              }`}
            >
              {timeframeLabels[tf]}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8 relative z-10">
        <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`w-10 h-10 p-2 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <img src={asset.image} alt={asset.name} className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] leading-none mb-1 ${heroTextMuted}`}>{asset.name}</h2>
              <p className={`text-xs font-bold tracking-widest mono ${heroTextAccent}`}>{asset.symbol}</p>
            </div>
          </div>
          
          <div className={`text-7xl md:text-9xl font-black tracking-tighter mb-4 mono ${priceColor}`}>
            <span className={`text-2xl md:text-4xl mr-1 font-light ${pricePrefix}`}>$</span>
            {asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black tracking-widest uppercase transition-colors ${
            isPositive ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'
          }`}>
            <span>{isPositive ? 'Bullish' : 'Bearish'}</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
            <span className="mono">{isPositive ? '+' : ''}{asset.priceChange24h.toFixed(2)}%</span>
          </div>
        </div>

        <div className="w-full h-[40vh] max-w-6xl relative group cursor-crosshair animate-in fade-in duration-700 delay-150">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className={`w-10 h-0.5 relative overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'}`}>
                <div className={`absolute inset-0 animate-scan ${theme === 'dark' ? 'bg-white/60' : 'bg-slate-900/40'}`}></div>
              </div>
            </div>
          )}
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={history}
              onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
              onMouseMove={(e) => refAreaLeft && e && setRefAreaRight(e.activeLabel)}
              onMouseUp={zoom}
            >
              <defs>
                <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity={0.15}/>
                  <stop offset="100%" stopColor={themeColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <XAxis dataKey="timestamp" hide domain={[left, right]} type="number" />
              <Tooltip 
                isAnimationActive={false}
                content={({ active, payload }) => active && payload && (
                  <div className={`backdrop-blur-xl border p-4 rounded-2xl shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#0a0a0a]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>{payload[0].payload.timeLabel}</p>
                    <p className={`text-xl font-black mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                )} 
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={themeColor} 
                strokeWidth={2}
                fill="url(#detailGradient)" 
                isAnimationActive={!loading}
                animationDuration={600}
              />
              {refAreaLeft && refAreaRight && (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} fill={theme === 'dark' ? "white" : "black"} fillOpacity={0.05} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </main>

      <footer className={`px-12 py-10 border-t grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10 backdrop-blur-sm transition-all duration-300 ${footerBg}`}>
        {[
          { label: 'Cap', value: `$${formatCurrency(asset.marketCap)}` },
          { label: 'Vol', value: `$${formatCurrency(asset.volume24h)}` },
          { label: 'Rank', value: `#${asset.rank}` },
          { label: 'Sync', value: 'V3_READY', status: true }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-tight mono ${theme === 'dark' ? 'text-white/80' : 'text-slate-900'}`}>{stat.value}</span>
              {stat.status && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
};

export default AssetDetail;
