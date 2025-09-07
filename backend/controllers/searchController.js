const axios = require('axios');

class SearchController {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Search for stock symbols with auto-complete
  async searchSymbols(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.length < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter is required and must be at least 1 character'
        });
      }

      console.log(`🔍 Searching symbols for: ${query}`);

      // Check cache first
      const cacheKey = `search_${query.toLowerCase()}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📋 Returning cached results');
        return res.json({
          status: 'success',
          query,
          results: cached.data,
          source: 'cache'
        });
      }

      // Fetch from Alpha Vantage or use fallback
      let searchResults;
      try {
        searchResults = await this.fetchSymbolSearch(query);
      } catch (error) {
        console.log('⚠️ Alpha Vantage search failed, using fallback');
        searchResults = this.generateFallbackSearchResults(query);
      }

      // Cache results
      this.cache.set(cacheKey, {
        data: searchResults,
        timestamp: Date.now()
      });

      res.json({
        status: 'success',
        query,
        results: searchResults,
        source: 'live'
      });

    } catch (error) {
      console.error('❌ Search error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to search symbols',
        error: error.message
      });
    }
  }

  // Fetch from Alpha Vantage API
  async fetchSymbolSearch(query) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data['Error Message']) {
      throw new Error('API Error: ' + response.data['Error Message']);
    }
    
    if (response.data['Note']) {
      throw new Error('API Rate Limit: ' + response.data['Note']);
    }
    
    const matches = response.data['bestMatches'] || [];
    return matches.slice(0, 10).map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      marketOpen: match['5. marketOpen'],
      marketClose: match['6. marketClose'],
      timezone: match['7. timezone'],
      currency: match['8. currency']
    }));
  }

  // Fallback search results when API fails
  generateFallbackSearchResults(query) {
    const popularStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' },
      { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'Equity', region: 'United States' },
      { symbol: 'INTC', name: 'Intel Corporation', type: 'Equity', region: 'United States' }
    ];

    const lowerQuery = query.toLowerCase();
    return popularStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }

  // Get trending symbols
  async getTrendingSymbols(req, res) {
    try {
      console.log('📈 Fetching trending symbols...');

      // Check cache first
      const cached = this.cache.get('trending');
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📋 Returning cached trending results');
        return res.json({
          status: 'success',
          trending: cached.data,
          source: 'cache',
          timestamp: cached.timestamp
        });
      }

      // Generate trending symbols (you can enhance this with real API data)
      const trendingSymbols = [
        { symbol: 'AAPL', name: 'Apple Inc.', change: '+2.15%', volume: '52.3M' },
        { symbol: 'TSLA', name: 'Tesla Inc.', change: '+5.67%', volume: '89.1M' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', change: '+1.23%', volume: '31.7M' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', change: '+0.89%', volume: '28.4M' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', change: '-1.45%', volume: '45.2M' },
        { symbol: 'META', name: 'Meta Platforms Inc.', change: '+3.21%', volume: '25.8M' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', change: '+7.89%', volume: '67.3M' },
        { symbol: 'NFLX', name: 'Netflix Inc.', change: '+2.45%', volume: '18.5M' }
      ];

      // Cache trending results
      this.cache.set('trending', {
        data: trendingSymbols,
        timestamp: Date.now()
      });

      res.json({
        status: 'success',
        trending: trendingSymbols,
        source: 'generated',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Trending symbols error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch trending symbols',
        error: error.message
      });
    }
  }
}

// Export a single instance (singleton pattern)
module.exports = new SearchController();
