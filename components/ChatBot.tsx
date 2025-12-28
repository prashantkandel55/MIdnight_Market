
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
  timestamp: string;
}

interface SentimentItem {
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const HAS_API_KEY = !!process.env.API_KEY;

const SentimentPulse: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const [items, setItems] = useState<SentimentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [overall, setOverall] = useState<string | null>(null);

  const analyzePulse = async () => {
    setLoading(true);
    
    // Fallback Mock Data if API Key is missing
    if (!HAS_API_KEY) {
      setTimeout(() => {
        setItems([
          { headline: "Institutional accumulation detected in major L1 assets.", sentiment: 'positive' },
          { headline: "Macro volatility expected ahead of regional economic data.", sentiment: 'neutral' },
          { headline: "Liquidity drain observed in high-risk memecoin sectors.", sentiment: 'negative' },
          { headline: "Cross-chain bridge volume hits 30-day high.", sentiment: 'positive' },
          { headline: "Exchange reserves continue to trend downwards.", sentiment: 'positive' }
        ]);
        setOverall('Bullish');
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Perform a sentiment analysis on the top 5 most impactful cryptocurrency news headlines from the last 4 hours. Return the headlines and their sentiment (positive, negative, or neutral).",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallSentiment: { type: Type.STRING, description: "A one word summary of overall market mood (Bullish, Bearish, or Neutral)" },
              analyses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] }
                  },
                  required: ['headline', 'sentiment']
                }
              }
            },
            required: ['overallSentiment', 'analyses']
          }
        },
      });

      const data = JSON.parse(response.text || '{}');
      setItems(data.analyses || []);
      setOverall(data.overallSentiment || 'Neutral');
    } catch (error: any) {
      console.error("Pulse analysis failed:", error);
      // Failover to mock on error
      setItems([
        { headline: "Error fetching live pulse. Using cached surveillance data.", sentiment: 'neutral' },
        { headline: "Market volatility remains high across primary sectors.", sentiment: 'neutral' }
      ]);
      setOverall('Unstable');
    } finally {
      setLoading(false);
    }
  };

  const textMuted = theme === 'dark' ? 'text-white/20' : 'text-slate-400';
  const textMain = theme === 'dark' ? 'text-white/60' : 'text-slate-700';
  const borderClass = theme === 'dark' ? 'border-white/5' : 'border-slate-100';

  return (
    <div className={`p-4 border-b ${borderClass} bg-emerald-500/[0.02] backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Market_Pulse</span>
          {overall && (
            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border transition-all duration-500 ${
              overall.toLowerCase() === 'bullish' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
              overall.toLowerCase() === 'bearish' ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
              'bg-white/10 border-white/20 text-white/40'
            }`}>
              {overall}
            </span>
          )}
        </div>
        <button 
          onClick={analyzePulse}
          disabled={loading}
          className={`text-[8px] font-black uppercase tracking-widest transition-all ${loading ? 'opacity-30' : 'text-emerald-500/60 hover:text-emerald-500 hover:scale-105 active:scale-95'}`}
        >
          {loading ? '[ ANALYZING... ]' : '[ REFRESH_PULSE ]'}
        </button>
      </div>

      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 scrollbar-hide">
        {items.length === 0 && !loading && (
          <p className={`text-[9px] italic ${textMuted} text-center py-2`}>No pulse data. Trigger analysis to start.</p>
        )}
        {loading && (
          <div className="space-y-2 animate-pulse">
            <div className={`h-2 rounded w-full ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
            <div className={`h-2 rounded w-3/4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
          </div>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 group animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full transition-shadow duration-300 ${
              item.sentiment === 'positive' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' :
              item.sentiment === 'negative' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' :
              'bg-slate-400'
            }`}></div>
            <div className="flex-grow">
              <p className={`text-[10px] font-medium leading-tight ${textMain} line-clamp-1 group-hover:line-clamp-none transition-all duration-300 cursor-default`}>{item.headline}</p>
            </div>
            <span className={`text-[7px] font-black uppercase tracking-tighter ${
              item.sentiment === 'positive' ? 'text-emerald-500/60' :
              item.sentiment === 'negative' ? 'text-red-500/60' :
              'text-slate-400/60'
            }`}>
              {item.sentiment}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatBot: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Current market analysis?",
    "Next Bitcoin move?",
    "Trending memecoins?",
    "Institutional sentiment?"
  ]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchDynamicSuggestions();
    }
  }, [isOpen]);

  const fetchDynamicSuggestions = async () => {
    if (!HAS_API_KEY) {
      // Default high-quality static suggestions
      setSuggestions([
        "Explain current liquidity flows",
        "Top AI-narrative tokens?",
        "Bitcoin halving impact?",
        "Assess Ethereum network health"
      ]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate 4 short, interesting, and timely questions a crypto trader would ask about current market activity today. Return them as a JSON array of strings.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['suggestions']
          }
        },
      });
      const data = JSON.parse(response.text || '{}');
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error("Failed to fetch suggestions", e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getSimulatedResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    if (input.includes('bitcoin') || input.includes('btc')) {
      return "Bitcoin is currently testing major psychological resistance levels. On-chain data suggests institutional wallets are in a 'holding' phase, while retail sentiment remains cautiously optimistic. Watch the 200-day moving average for trend confirmation.";
    }
    if (input.includes('ethereum') || input.includes('eth')) {
      return "Ethereum's network activity has seen a slight uptick in L2 gas consumption. Deflationary pressures are mounting as burn rates exceed issuance. The current focus is on upcoming network upgrades aimed at scalability.";
    }
    if (input.includes('memecoin') || input.includes('meme')) {
      return "The memecoin sector is currently high-volatility with significant rotation observed into AI-themed assets. While liquidity is thin, social dominance for top-tier memes remains strong. High risk, high reward dynamics are dominant here.";
    }
    if (input.includes('analysis') || input.includes('market')) {
      return "Broad market structure remains in a consolidation phase. Dominance levels are shifting as capital rotates into specific sector narratives. Macro indicators point towards a period of volatility as traders await clarity on global fiscal policies.";
    }
    return "The terminal is operating in simulated intelligence mode. Current data streams indicate localized volatility and increasing accumulation in blue-chip assets. Interrogate specific tickers for deeper surveillance.";
  }

  const sendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    if (!HAS_API_KEY) {
      setTimeout(() => {
        const modelMessage: Message = {
          role: 'model',
          text: getSimulatedResponse(textToSend),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, modelMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: textToSend,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are the 'Midnight Market' terminal assistant. Provide expert, concise cryptocurrency and market analysis. Use a professional, slightly cyber-noir tone. Keep responses structured and punchy. If you use Google Search, ensure you provide accurate, recent information.",
        },
      });

      const modelText = response.text || "Protocol timeout. Signal lost.";
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = grounding
        .map(chunk => chunk.web)
        .filter((web): web is { title: string; uri: string } => !!web?.uri);

      const modelMessage: Message = {
        role: 'model',
        text: modelText,
        sources: sources.length > 0 ? sources : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: getSimulatedResponse(textToSend) + " (Note: Live uplink failed, using simulated data).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const panelBg = theme === 'dark' ? 'bg-[#0a0a0a]/98 border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]' : 'bg-white/98 border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]';
  const textMain = theme === 'dark' ? 'text-white/80' : 'text-slate-900';
  const textMuted = theme === 'dark' ? 'text-white/30' : 'text-slate-400';
  const inputBg = theme === 'dark' ? 'bg-white/[0.03] border-white/10 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-slate-400';

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 group overflow-hidden ${
          isOpen 
            ? 'bg-emerald-500 border-emerald-400 text-black rotate-90' 
            : theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="relative z-10">
          {isOpen ? (
            <span className="text-xl font-bold flex items-center justify-center w-6 h-6 leading-none">×</span>
          ) : (
            <div className="relative">
               <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            </div>
          )}
        </div>
      </button>

      <div 
        className={`fixed bottom-28 right-8 z-50 w-[420px] h-[700px] flex flex-col rounded-[2.5rem] border transition-all duration-500 transform origin-bottom-right backdrop-blur-3xl overflow-hidden ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
        } ${panelBg}`}
      >
        <div className={`p-6 border-b flex items-center justify-between transition-colors ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full ${HAS_API_KEY ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
              <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${HAS_API_KEY ? 'bg-emerald-500 animate-ping' : 'bg-orange-500'} opacity-50`}></div>
            </div>
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${textMain}`}>Midnight_Assistant</h4>
              <p className={`text-[8px] font-black tracking-[0.1em] uppercase ${textMuted}`}>{HAS_API_KEY ? 'SECURE_UPLINK_ACTIVE' : 'SIMULATED_MODE_ACTIVE'}</p>
            </div>
          </div>
          <button 
            onClick={fetchDynamicSuggestions}
            disabled={loadingSuggestions}
            className={`text-[8px] font-black uppercase tracking-widest text-emerald-500/40 hover:text-emerald-500 transition-colors ${loadingSuggestions ? 'animate-spin' : ''}`}
          >
            {loadingSuggestions ? '○' : '↺'}
          </button>
        </div>

        <SentimentPulse theme={theme} />

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide bg-transparent">
          {messages.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-700`}>
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/[0.02] border border-white/5 text-white/10' : 'bg-slate-50 border border-slate-100 text-slate-200'}`}>
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
              </div>
              <div className="space-y-1">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${textMain}`}>System Idle</p>
                <p className={`text-[9px] font-medium italic ${textMuted} px-12`}>Awaiting market interrogation. Feed the signal to begin analysis.</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500`} style={{ animationDelay: `${Math.min(i * 100, 300)}ms` }}>
              <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[11px] leading-relaxed font-medium transition-all ${
                msg.role === 'user' 
                  ? theme === 'dark' ? 'bg-emerald-500 text-black shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-white shadow-xl'
                  : theme === 'dark' ? 'bg-white/[0.04] border border-white/10 text-white/90 shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm'
              } ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                {msg.text}
              </div>
              <span className={`text-[8px] mt-2 font-black mono uppercase tracking-widest ${textMuted}`}>{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-emerald-500 p-2 animate-in fade-in slide-in-from-left-2">
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-duration:0.6s] [animation-delay:-0.3s]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-duration:0.6s] [animation-delay:-0.15s]"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-duration:0.6s]"></div>
               <span className="text-[8px] font-black uppercase tracking-[0.2em] ml-1 opacity-50">Processing_Stream</span>
            </div>
          )}
        </div>

        <div className={`p-6 pt-2 border-t transition-colors ${theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/30'}`}>
          {/* Suggestions Layer */}
          <div className="mb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => sendMessage(suggestion)}
                disabled={isTyping}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-tight border transition-all duration-300 hover:scale-105 active:scale-95 text-left disabled:opacity-50 ${
                  theme === 'dark' 
                    ? 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white/80 hover:border-white/20' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-3 p-2 rounded-[1.25rem] border transition-all shadow-sm ${inputBg}`}>
            <input 
              type="text"
              placeholder="Inquire market status..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className={`flex-grow bg-transparent px-4 py-2 text-xs font-medium focus:outline-none placeholder:opacity-40 tracking-tight ${textMain}`}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className={`p-2.5 rounded-xl transition-all shadow-lg active:scale-90 disabled:opacity-30 ${
                theme === 'dark' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
          <p className={`mt-3 text-[7px] font-black uppercase tracking-[0.4em] text-center opacity-30 ${textMuted}`}>
            {HAS_API_KEY ? 'Encrypted Session' : 'Local Sandbox Active'}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
