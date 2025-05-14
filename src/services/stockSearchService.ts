interface StockSuggestion {
  symbol: string;
  name: string;
  exchange: string;
}

class StockSearchError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StockSearchError';
  }
}

class StockSearchService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static nasdaqSymbols: StockSuggestion[] = [];
  private static lastFetchTime: number = 0;

  static async searchStocks(query: string): Promise<StockSuggestion[]> {
    if (!query || query.trim().length === 0) {
      throw new StockSearchError('Search query cannot be empty', 'EMPTY_QUERY');
    }

    if (query.length < 2) {
      throw new StockSearchError('Search query must be at least 2 characters', 'QUERY_TOO_SHORT');
    }

    try {
      // Use our proxy endpoint
      const response = await fetch(
        `/yahoo-finance/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new StockSearchError(
          errorData.message || `Failed to fetch stock suggestions (${response.status})`,
          `HTTP_${response.status}`
        );
      }
      
      const data = await response.json();
      
      if (!data.quotes || !Array.isArray(data.quotes)) {
        throw new StockSearchError('Invalid response format from Yahoo Finance', 'INVALID_RESPONSE');
      }
      
      // Transform Yahoo Finance response to our format
      return data.quotes.map((quote: any) => ({
        symbol: quote.symbol || '',
        name: quote.shortname || quote.longname || quote.symbol || 'Unknown',
        exchange: quote.exchange || 'NASDAQ'
      })).filter((suggestion: StockSuggestion) => suggestion.symbol); // Filter out any invalid entries
    } catch (error) {
      if (error instanceof StockSearchError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new StockSearchError('Network error - please check your connection', 'NETWORK_ERROR');
      }
      
      console.error('Error fetching stock suggestions:', error);
      throw new StockSearchError(
        'An unexpected error occurred while searching stocks',
        'UNKNOWN_ERROR'
      );
    }
  }
}

export { StockSearchService, StockSearchError };
export type { StockSuggestion }; 