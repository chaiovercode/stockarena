export interface AgentArgument {
  point: string;
  evidence: string;
  confidence: number;
}

export interface Source {
  type: string;
  name: string;
  url: string | null;
}

export interface AgentAnalysis {
  agent_type: 'bull' | 'bear' | 'moderator';
  summary: string;
  arguments: AgentArgument[];
  recommendation?: string;
  confidence_score: number;
  sources?: Source[];
  timestamp: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  ticker: string;
  company_name: string | null;
  current_price: number;
  price_change_percent: number;
  volume: number;
  market_cap: number | null;
  pe_ratio: number | null;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  sector: string | null;
  industry: string | null;
  historical_prices: HistoricalPrice[];
  // Shareholding pattern
  promoter_holding: number | null;
  fii_holding: number | null;
  dii_holding: number | null;
  public_holding: number | null;
  // Key statistics
  beta: number | null;
  dividend_yield: number | null;
  book_value: number | null;
  eps: number | null;
  pb_ratio: number | null;
  debt_to_equity: number | null;
  roe: number | null;
  // Analyst recommendations
  analyst_buy: number;
  analyst_hold: number;
  analyst_sell: number;
  target_price: number | null;
  // Quarterly financials
  quarterly_revenue: number | null;
  quarterly_profit: number | null;
  revenue_growth: number | null;
  profit_growth: number | null;
}

export interface NewsItem {
  title: string;
  snippet: string;
  source: string;
  url: string;
  date: string;
}

export type DebatePhase =
  | 'idle'
  | 'connecting'
  | 'fetching'
  | 'bull_analyzing'
  | 'bear_analyzing'
  | 'moderating'
  | 'complete'
  | 'error';

export type TimeHorizon = 'short_term' | 'medium_term' | 'long_term';

export const TIME_HORIZON_OPTIONS = [
  { value: 'short_term' as TimeHorizon, label: 'Short-term', description: '1-5 days' },
  { value: 'medium_term' as TimeHorizon, label: 'Medium-term', description: '1-3 months' },
  { value: 'long_term' as TimeHorizon, label: 'Long-term', description: '1+ year' },
];

export interface DebateState {
  sessionId: string;
  ticker: string;
  phase: DebatePhase;
  currentRound: number;
  maxRounds: number;
  stockData: StockData | null;
  newsItems: NewsItem[];
  bullAnalysis: AgentAnalysis | null;
  bearAnalysis: AgentAnalysis | null;
  moderatorAnalysis: AgentAnalysis | null;
  error: string | null;
}

export interface StreamUpdate {
  type:
    | 'started'
    | 'data_fetched'
    | 'agent_start'
    | 'agent_response'
    | 'token'
    | 'round_complete'
    | 'error'
    | 'complete'
    | 'node_start'
    | 'pong';
  agent?: string;
  content?: string;
  analysis?: AgentAnalysis;
  stock_data?: StockData;
  news_items?: NewsItem[];
  error?: string;
  round_number?: number;
  message?: string;
  ticker?: string;
  max_rounds?: number;
  time_horizon?: TimeHorizon;
  node?: string;
}
