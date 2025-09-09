// Core Analysis Types
export interface StockAnalysisRequest {
  symbol: string;
  exchange: string;
  duration: AnalysisDuration;
  mode: AnalysisMode;
  customWeights?: AnalysisWeights;
  indicators?: TechnicalIndicators;
  fundamentals?: FundamentalFilters;
  sentiment?: SentimentFilters;
}

export interface StockAnalysisResponse {
  symbol: string;
  companyName: string;
  analysisTimestamp: string;
  duration: AnalysisDuration;
  mode: AnalysisMode;
  recommendation: Recommendation;
  aiSummary?: string;
  keyFactors: string[];
  risks: string[];
  nextCatalysts: string[];
  currentPrice: string;
  priceContext: string;
  detailedAnalysis?: DetailedAnalysis;
  riskAnalysis?: RiskAnalysis;
  priceTargets?: PriceTargets;
}

// Analysis Configuration
export type AnalysisDuration = '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';
export type AnalysisMode = 'smart' | 'pro';
export type RecommendationAction = 'BUY' | 'HOLD' | 'SELL';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AnalysisWeights {
  fundamental: number;
  technical: number;
  sentiment: number;
}

export interface TechnicalIndicators {
  smaWindows: number[];
  emaWindows: number[];
  rsiLength: number;
  rsiThresholds: {
    oversold: number;
    overbought: number;
  };
  macdSettings: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
  priceAction: {
    supportResistance: boolean;
    swingHighsLows: boolean;
    candlestickPatterns: boolean;
    trendlines: boolean;
  };
}

export interface FundamentalFilters {
  peRange: {
    min: number;
    max: number;
  };
  pegRange: {
    min: number;
    max: number;
  };
  dividendMin: number;
  marketCapFloor: number;
  debtToEquityMax: number;
}

export interface SentimentFilters {
  newsWindow: '24h' | '3d' | '7d';
  sources: string[];
  socialMedia: boolean;
  analystOpinions: boolean;
}

// Analysis Results
export interface Recommendation {
  action: RecommendationAction;
  confidence: ConfidenceLevel;
  score: number;
  overallScore?: number;
}

export interface DetailedAnalysis {
  fundamental: AnalysisComponent;
  technical: AnalysisComponent;
  sentiment: AnalysisComponent;
}

export interface AnalysisComponent {
  score: number;
  weight: number;
  metrics?: FundamentalMetrics;
  indicators?: TechnicalMetrics;
  breakdown?: SentimentBreakdown;
}

export interface FundamentalMetrics {
  peRatio: number;
  pegRatio: number;
  debtToEquity: number;
  roe: number;
  revenueGrowth: number;
  profitMargin: number;
  currentRatio: number;
  quickRatio: number;
  marketCap: number;
  dividendYield: number;
}

export interface TechnicalMetrics {
  rsi: number;
  macd: string;
  movingAverages: string;
  supportLevel: string;
  resistanceLevel: string;
  volumeTrend: string;
  volatility: number;
  trendStrength: number;
}

export interface SentimentBreakdown {
  newsSentiment: number;
  analystSentiment: number;
  socialSentiment: number;
  insiderSentiment: number;
  optionsFlow: number;
}

export interface RiskAnalysis {
  beta: number;
  volatility: string;
  maxDrawdown: string;
  sharpeRatio: number;
  var95: string;
  correlation: number;
}

export interface PriceTargets {
  bullCase: string;
  baseCase: string;
  bearCase: string;
  timeHorizon: string;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  high52Week: number;
  low52Week: number;
  timestamp: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// News and Sentiment Types
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary: string;
  sentiment: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SentimentData {
  overall: number;
  news: number;
  social: number;
  analyst: number;
  insider: number;
  timestamp: string;
}

// Company Information
export interface CompanyInfo {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  employees: number;
  website: string;
  description: string;
  ceo: string;
  founded: number;
  headquarters: string;
}

// Search and Discovery
export interface SearchResult {
  symbol: string;
  companyName: string;
  exchange: string;
  marketCap: string;
  sector: string;
  matchScore: number;
}

export interface SearchResponse {
  query: string;
  suggestions: SearchResult[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpen: string;
  nextClose: string;
  timezone: string;
  lastUpdate: string;
}

// Error Types
export interface AnalysisError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Cache Types
export interface AnalysisCache {
  symbol: string;
  exchange: string;
  duration: AnalysisDuration;
  mode: AnalysisMode;
  analysis: StockAnalysisResponse;
  createdAt: string;
  expiresAt: string;
}

// User Preferences
export interface UserPreferences {
  defaultMode: AnalysisMode;
  defaultDuration: AnalysisDuration;
  defaultWeights: AnalysisWeights;
  favoriteStocks: string[];
  alerts: AlertSettings[];
  theme: 'light' | 'dark' | 'auto';
}

export interface AlertSettings {
  id: string;
  symbol: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notificationType: 'email' | 'push' | 'both';
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  includeNews: boolean;
  includeDetails: boolean;
}

export interface ExportData {
  analysis: StockAnalysisResponse;
  charts?: string[];
  news?: NewsItem[];
  timestamp: string;
  format: string;
} 