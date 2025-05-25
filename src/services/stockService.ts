
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

// Function to clean the analysis text by replacing <br> tags with newlines
const cleanAnalysisText = (text: string): string => {
  return text.replace(/<br\s*\/?>/gi, '\n');
};

const API_BASE_URL = 'https://egiiqbgumgltatfljbcs.supabase.co/functions/v1/stock-analysis-proxy';

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    console.log('Fetching stock analysis for:', { symbol, exchange });
    console.log('Using API URL:', API_BASE_URL);
    
    // Further sanitize and format the values to prevent issues
    const sanitizedSymbol = symbol.trim().replace(/[^\w.-]/g, '');
    const sanitizedExchange = exchange.trim().replace(/[^\w.-]/g, '');
    
    const payload = JSON.stringify({
      symbol: sanitizedSymbol,
      exchange: sanitizedExchange
    });
    
    console.log('Sending payload:', payload);
    
    // Configure request with optimal settings for cross-origin requests
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: payload,
      // Increase timeout to 25 seconds to give the API more time to respond
      signal: AbortSignal.timeout(25000)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(errorText || `Failed to fetch analysis (Status: ${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Invalid response type:', contentType, 'Response text:', text);
      throw new Error('Invalid response format from server');
    }

    const data = await response.json();
    console.log("API Response:", data);
    return {
      ...data,
      text: cleanAnalysisText(data.text)
    };
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    
    // Special handling for network errors that might happen in production
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error occurred. This often happens with CORS issues in production.');
    } else if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('Request timed out after 25 seconds. The API may be experiencing high load.');
    }
    
    // Always provide a fallback for any error
    return provideMockAnalysis(symbol);
  }
};

// Provide mock analysis data for better user experience when the API fails
const provideMockAnalysis = (symbol: string): StockAnalysisResponse => {
  return {
    url: "https://placeholder-chart.com/error",
    text: `# Mock Analysis for ${symbol}\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. Please try again later.\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes`,
    symbol: symbol
  };
};
