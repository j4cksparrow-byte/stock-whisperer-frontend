// TradingView API Service
// This service provides access to TradingView's free market data endpoints

interface TradingViewSymbol {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap?: string;
  exchange: string;
}

interface TradingViewResponse {
  data: Array<{
    s: string; // symbol
    d: Array<number>; // [price, change, changePercent, volume, ...]
    n: string; // name
  }>;
}

class TradingViewService {
  private baseUrl = 'https://scanner.tradingview.com';
  
  // TradingView scanner endpoints for different market categories
  private endpoints = {
    gainers: '/america/scan',
    losers: '/america/scan', 
    mostActive: '/america/scan'
  };

  // Scanner filters for different categories
  private filters = {
    gainers: {
      filter: [
        { left: 'change', operation: 'nempty' },
        { left: 'change', operation: 'greater', right: 0 },
        { left: 'market_cap_basic', operation: 'greater', right: 1000000000 }, // > $1B market cap
        { left: 'volume', operation: 'greater', right: 1000000 } // > 1M volume
      ],
      options: { lang: 'en' },
      sort: { sortBy: 'change', sortOrder: 'desc' },
      range: [0, 20]
    },
    losers: {
      filter: [
        { left: 'change', operation: 'nempty' },
        { left: 'change', operation: 'less', right: 0 },
        { left: 'market_cap_basic', operation: 'greater', right: 1000000000 },
        { left: 'volume', operation: 'greater', right: 1000000 }
      ],
      options: { lang: 'en' },
      sort: { sortBy: 'change', sortOrder: 'asc' },
      range: [0, 20]
    },
    mostActive: {
      filter: [
        { left: 'volume', operation: 'nempty' },
        { left: 'market_cap_basic', operation: 'greater', right: 1000000000 }
      ],
      options: { lang: 'en' },
      sort: { sortBy: 'volume', sortOrder: 'desc' },
      range: [0, 20]
    }
  };

  // Fallback data when API is not available
  private fallbackData = {
    gainers: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35, volume: '45.2M', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 5.67, changePercent: 1.52, volume: '28.7M', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 1.23, changePercent: 0.87, volume: '22.1M', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.20, change: 2.89, changePercent: 1.90, volume: '18.9M', exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.30, change: 8.45, changePercent: 1.77, volume: '15.3M', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.02, change: 12.34, changePercent: 1.32, volume: '32.1M', exchange: 'NASDAQ' },
    ],
    losers: [
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.21, changePercent: -1.27, volume: '38.5M', exchange: 'NASDAQ' },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 425.67, change: -5.43, changePercent: -1.26, volume: '12.8M', exchange: 'NASDAQ' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 98.45, change: -1.89, changePercent: -1.88, volume: '25.6M', exchange: 'NASDAQ' },
      { symbol: 'INTC', name: 'Intel Corporation', price: 42.18, change: -0.67, changePercent: -1.56, volume: '19.2M', exchange: 'NASDAQ' },
      { symbol: 'CRM', name: 'Salesforce Inc.', price: 198.34, change: -2.45, changePercent: -1.22, volume: '8.7M', exchange: 'NYSE' },
      { symbol: 'ADBE', name: 'Adobe Inc.', price: 445.78, change: -4.12, changePercent: -0.92, volume: '11.4M', exchange: 'NASDAQ' },
    ],
    mostActive: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35, volume: '45.2M', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.21, changePercent: -1.27, volume: '38.5M', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.02, change: 12.34, changePercent: 1.32, volume: '32.1M', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 5.67, changePercent: 1.52, volume: '28.7M', exchange: 'NASDAQ' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 98.45, change: -1.89, changePercent: -1.88, volume: '25.6M', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 1.23, changePercent: 0.87, volume: '22.1M', exchange: 'NASDAQ' },
    ]
  };

  async getTrendingStocks(category: 'gainers' | 'losers' | 'mostActive'): Promise<TradingViewSymbol[]> {
    try {
      // Try to fetch from TradingView API
      const response = await fetch(`${this.baseUrl}${this.endpoints[category]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.filters[category])
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TradingViewResponse = await response.json();
      
      // Transform TradingView data to our format
      return data.data.map(item => ({
        symbol: item.s,
        name: item.n,
        price: item.d[0] || 0,
        change: item.d[1] || 0,
        changePercent: item.d[2] || 0,
        volume: this.formatVolume(item.d[3] || 0),
        exchange: this.getExchangeFromSymbol(item.s)
      }));

    } catch (error) {
      console.warn('TradingView API failed, using fallback data:', error);
      // Return fallback data when API fails
      return this.fallbackData[category];
    }
  }

  private formatVolume(volume: number): string {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  private getExchangeFromSymbol(symbol: string): string {
    // Simple mapping - in production, you'd have a more comprehensive mapping
    const nasdaqSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX', 'AMD', 'INTC', 'ADBE'];
    return nasdaqSymbols.includes(symbol) ? 'NASDAQ' : 'NYSE';
  }

  // Get real-time price for a specific symbol
  async getSymbolPrice(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
    try {
      // This would typically use a different endpoint for individual symbol data
      // For now, we'll return null and let the component handle it
      return null;
    } catch (error) {
      console.warn('Failed to fetch symbol price:', error);
      return null;
    }
  }

  // Get market overview data
  async getMarketOverview(): Promise<{
    totalGainers: number;
    totalLosers: number;
    totalUnchanged: number;
    marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  }> {
    try {
      // In a real implementation, this would fetch from a market status API
      const now = new Date();
      const hour = now.getHours();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      let marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours' = 'closed';
      
      if (!isWeekend) {
        if (hour >= 9 && hour < 16) {
          marketStatus = 'open';
        } else if (hour >= 4 && hour < 9) {
          marketStatus = 'pre-market';
        } else if (hour >= 16 && hour < 20) {
          marketStatus = 'after-hours';
        }
      }

      return {
        totalGainers: 1234,
        totalLosers: 567,
        totalUnchanged: 89,
        marketStatus
      };
    } catch (error) {
      console.warn('Failed to fetch market overview:', error);
      return {
        totalGainers: 0,
        totalLosers: 0,
        totalUnchanged: 0,
        marketStatus: 'closed'
      };
    }
  }
}

export default new TradingViewService();
