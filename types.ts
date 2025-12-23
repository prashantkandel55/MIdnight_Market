
export interface PricePoint {
  time: string;
  price: number;
}

export interface DetailedHistoryPoint {
  timestamp: number;
  timeLabel: string;
  price: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  sparklineData: number[];
  image: string;
  rank: number;
  blockchain?: string; // e.g., 'solana', 'ethereum', 'base', 'bsc'
  contractAddress?: string;
}

export enum TimeFrame {
  H1 = '1h',
  H24 = '1',
  D7 = '7',
  D30 = '30',
  Y1 = '365'
}

export type MarketMode = 'bluechips' | 'memecoins';
export type Blockchain = 'solana' | 'ethereum' | 'base' | 'bsc' | 'all';
