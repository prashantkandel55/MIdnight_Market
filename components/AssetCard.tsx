
import React from 'react';
import { Asset } from '../types';
import Sparkline from './Sparkline';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
  theme?: 'dark' | 'light';
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, theme = 'dark' }) => {
  const isPositive = asset.priceChange24h >= 0;
  const strokeColor = isPositive ? '#10b981' : '#ef4444';

  const cardBg = theme === 'dark' 
    ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.12]" 
    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-lg hover:shadow-black/[0.02]";

  const textMuted = theme === 'dark' ? 'text-white/20' : 'text-slate-300';
  const labelMuted = theme === 'dark' ? 'text-white/30 group-hover:text-white/60' : 'text-slate-400 group-hover:text-slate-600';
  const pricePrefix = theme === 'dark' ? 'text-white/20' : 'text-slate-300';
  const iconBg = theme === 'dark' ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-black/[0.02] border-slate-100';

  // Format price carefully for low-value memecoins
  const displayPrice = asset.currentPrice < 0.01 
    ? asset.currentPrice.toFixed(8) 
    : asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div 
      onClick={() => onClick(asset)}
      className={`group relative border rounded-[2rem] p-8 cursor-pointer transition-all duration-300 ease-out flex flex-col aspect-square overflow-hidden hover:scale-[1.03] active:scale-[0.98] ${cardBg}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Background Glow */}
      <div 
        className={`absolute -bottom-10 -right-10 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} 
      />

      <div className="flex justify-between items-start z-10">
        <div className={`p-2.5 rounded-2xl border transition-all duration-500 group-hover:rotate-12 ${iconBg}`}>
          <img 
            src={asset.image} 
            alt={asset.name} 
            className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all duration-500" 
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${asset.symbol}&background=random&color=fff`; }}
            loading="lazy"
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          {asset.blockchain && (
             <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/30 group-hover:text-emerald-500/80 group-hover:border-emerald-500/20 transition-all">
               {asset.blockchain}
             </span>
          )}
          <div className={`text-[10px] font-black tracking-tighter transition-colors duration-200 mono ${textMuted}`}>
            {asset.rank === 999 ? 'UNRANKED' : `#${asset.rank}`}
          </div>
        </div>
      </div>

      <div className="mt-auto mb-4 z-10">
        <div className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5 transition-colors duration-200 ${labelMuted}`}>
          {asset.symbol}
        </div>
        <div className="text-2xl font-black tracking-tighter flex items-baseline gap-1">
          <span className={`text-sm font-light ${pricePrefix}`}>$</span>
          <span className="mono">{displayPrice}</span>
        </div>
        <div className={`text-[11px] font-black mt-1.5 flex items-center gap-1.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          <span className="text-[9px] opacity-40">{isPositive ? '▲' : '▼'}</span>
          <span className="mono">{Math.abs(asset.priceChange24h).toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="w-full mt-2 h-14 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
        {asset.sparklineData && asset.sparklineData.length > 0 && (
          <Sparkline data={asset.sparklineData} color={strokeColor} />
        )}
      </div>
    </div>
  );
};

export default AssetCard;
