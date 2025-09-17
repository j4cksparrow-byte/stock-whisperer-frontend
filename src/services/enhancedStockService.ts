import {
  StockAnalysisRequest,
  StockAnalysisResponse,
  AnalysisWeights,
  TechnicalIndicators,
  FundamentalFilters,
  SentimentFilters,
  MarketData,
  HistoricalData,
  NewsItem,
  CompanyInfo,
  SearchResult,
  SearchResponse,
  MarketStatus,
  APIResponse,
  AnalysisError
} from '@/types/stockAnalysis';

// Mock data for development
const MOCK_COMPANIES: CompanyInfo[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    marketCap: 3000000000000,
    employees: 164000,
    website: 'https://www.apple.com',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables and accessories worldwide.',
    ceo: 'Tim Cook',
    founded: 1976,
    headquarters: 'Cupertino, California'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Software',
    marketCap: 2800000000000,
    employees: 221000,
    website: 'https://www.microsoft.com',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    ceo: 'Satya Nadella',
    founded: 1975,
    headquarters: 'Redmond, Washington'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Internet Services',
    marketCap: 1800000000000,
    employees: 156500,
    website: 'https://www.google.com',
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    ceo: 'Sundar Pichai',
    founded: 1998,
    headquarters: 'Mountain View, California'
  }
];

// Mock analysis response generator
const generateMockAnalysis = (symbol: string, companyName: string): StockAnalysisResponse => {
  const actions = ['BUY', 'HOLD', 'SELL'] as const;
  const confidences = ['LOW', 'MEDIUM', 'HIGH'] as const;
  const action = actions[Math.floor(Math.random() * actions.length)];
  const confidence = confidences[Math.floor(Math.random() * confidences.length)];
  const score = Math.floor(Math.random() * 40) + 60; // 60-100

  return {
    symbol,
    companyName,
    analysisTimestamp: new Date().toISOString(),
    duration: '1M',
    mode: 'smart',
    recommendation: {
      action,
      confidence,
      score
    },
    aiSummary: `${companyName} shows ${action === 'BUY' ? 'strong' : action === 'HOLD' ? 'mixed' : 'weak'} fundamentals with ${confidence.toLowerCase()} confidence. The stock appears to be ${action === 'BUY' ? 'undervalued' : action === 'HOLD' ? 'fairly valued' : 'overvalued'} based on current market conditions.`,
    keyFactors: [
      'Strong quarterly earnings growth',
      'Positive analyst sentiment',
      'Technical indicators showing bullish momentum',
      'Solid balance sheet with low debt'
    ],
    risks: [
      'Market volatility may impact short-term performance',
      'Sector-specific risks should be considered',
      'Economic conditions could affect growth prospects'
    ],
    nextCatalysts: [
      'Upcoming earnings release',
      'Product launch announcements',
      'Market analyst coverage updates'
    ],
    currentPrice: `$${(Math.random() * 200 + 50).toFixed(2)}`,
    priceContext: 'Near 52-week high'
  };
};

// Enhanced Stock Analysis Service
export class EnhancedStockService {
  // Search for stocks
  static async searchStocks(query: string, limit: number = 10): Promise<SearchResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const filteredCompanies = MOCK_COMPANIES.filter(company =>
      company.name.toLowerCase().includes(query.toLowerCase()) ||
      company.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    const suggestions: SearchResult[] = filteredCompanies.map(company => ({
      symbol: company.symbol,
      companyName: company.name,
      exchange: company.exchange,
      marketCap: `${(company.marketCap / 1000000000).toFixed(1)}B`,
      sector: company.sector,
      matchScore: 0.9
    }));

    return {
      query,
      suggestions
    };
  }

  // Get market status
  static async getMarketStatus(): Promise<MarketStatus> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      isOpen: true,
      nextOpen: '2024-01-16T09:30:00Z',
      nextClose: '2024-01-16T16:00:00Z',
      timezone: 'America/New_York',
      lastUpdate: new Date().toISOString()
    };
  }

  // Analyze stock
  static async analyzeStock(request: StockAnalysisRequest): Promise<StockAnalysisResponse> {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const company = MOCK_COMPANIES.find(c => c.symbol === request.symbol);
    if (!company) {
      throw new Error(`Company with symbol ${request.symbol} not found`);
    }

    return generateMockAnalysis(request.symbol, company.name);
  }

  // Get market data
  static async getMarketData(symbol: string): Promise<MarketData> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      symbol,
      price: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.random() * 1000000000000,
      peRatio: Math.random() * 50 + 10,
      dividendYield: Math.random() * 5,
      high52Week: Math.random() * 300 + 100,
      low52Week: Math.random() * 100 + 50,
      timestamp: new Date().toISOString()
    };
  }

  // Get historical data
  static async getHistoricalData(symbol: string, period: string = '1M'): Promise<HistoricalData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const days = period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 365;
    const data: HistoricalData[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: Math.random() * 200 + 50,
        high: Math.random() * 200 + 50,
        low: Math.random() * 200 + 50,
        close: Math.random() * 200 + 50,
        volume: Math.floor(Math.random() * 10000000)
      });
    }

    return data;
  }

  // Get company info
  static async getCompanyInfo(symbol: string): Promise<CompanyInfo> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const company = MOCK_COMPANIES.find(c => c.symbol === symbol);
    if (!company) {
      throw new Error(`Company with symbol ${symbol} not found`);
    }

    return company;
  }

  // Get news and sentiment
  static async getNewsAndSentiment(symbol: string, days: number = 7): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const mockNews: NewsItem[] = [
      {
        title: `${symbol} Reports Strong Quarterly Earnings`,
        link: 'https://example.com/news1',
        pubDate: new Date().toISOString(),
        source: 'Reuters',
        summary: 'Company reports better-than-expected quarterly results.',
        sentiment: 0.8,
        impact: 'positive'
      },
      {
        title: `Analysts Upgrade ${symbol} Price Target`,
        link: 'https://example.com/news2',
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        source: 'Bloomberg',
        summary: 'Multiple analysts raise price targets following positive outlook.',
        sentiment: 0.7,
        impact: 'positive'
      }
    ];

    return mockNews;
  }

  // Get technical indicators
  static async getTechnicalIndicators(symbol: string, period: string = '1M'): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      rsi: Math.random() * 100,
      macd: 'bullish',
      movingAverages: 'above_20_50_200',
      supportLevel: '$150.00',
      resistanceLevel: '$200.00',
      volumeTrend: 'increasing',
      volatility: Math.random() * 50 + 10,
      trendStrength: Math.random() * 100
    };
  }

  // Get fundamental metrics
  static async getFundamentalMetrics(symbol: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      peRatio: Math.random() * 50 + 10,
      pegRatio: Math.random() * 3 + 0.5,
      debtToEquity: Math.random() * 2,
      roe: Math.random() * 50 + 10,
      revenueGrowth: Math.random() * 30 + 5,
      profitMargin: Math.random() * 30 + 5,
      currentRatio: Math.random() * 3 + 1,
      quickRatio: Math.random() * 2 + 0.5,
      marketCap: Math.random() * 1000000000000,
      dividendYield: Math.random() * 5
    };
  }
}

export default EnhancedStockService; 