
export type StockAnalysisResponse = {
  text: string;
  symbol: string;
};

// Function to clean the analysis text by replacing <br> tags with newlines
const cleanAnalysisText = (text: string): string => {
  return text.replace(/<br\s*\/?>/gi, '\n');
};

// Define the API endpoint
const API_BASE_URL = import.meta.env.PROD
  ? 'https://egiiqbgumgltatfljbcs.supabase.co/functions/v1/stock-analysis-proxy'
  : '/api/stock-analysis';

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    console.log('Fetching stock analysis for:', { symbol, exchange });
    console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');
    console.log('Using API URL:', API_BASE_URL);
    
    // Further sanitize and format the values to prevent issues
    const sanitizedSymbol = symbol.trim().replace(/[^\w.-]/g, '');
    const sanitizedExchange = exchange.trim().replace(/[^\w.-]/g, '');
    
    console.log('Using sanitized symbol:', sanitizedSymbol);
    
    const payload = JSON.stringify({
      symbol: sanitizedSymbol,
      exchange: sanitizedExchange
    });
    
    console.log('Sending payload:', payload);
    
    // Try direct connection to n8n webhook first (bypass proxy for testing)
    const directApiUrl = "https://raichen.app.n8n.cloud/webhook/stock-chart-analysis";

    // First attempt with direct connection
    try {
      console.log('Trying direct API connection to:', directApiUrl);
      const directResponse = await fetch(directApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: payload,
        signal: AbortSignal.timeout(30000)
      });
      
      console.log('Direct API response status:', directResponse.status);
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        console.log("Direct API Response:", data);
        
        if (data && data.text) {
          return {
            text: cleanAnalysisText(data.text),
            symbol: sanitizedSymbol
          };
        }
      } else {
        console.log('Direct connection failed, trying proxy...');
      }
    } catch (directError) {
      console.error('Error with direct API connection:', directError);
      console.log('Falling back to proxy...');
    }
    
    // Configure request with optimal settings for cross-origin requests
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: payload,
      // Increase timeout to 60 seconds to give the API more time to respond
      signal: AbortSignal.timeout(60000)
    });

    console.log('Proxy response status:', response.status);
    
    // More robust error handling
    if (!response.ok) {
      console.error('Non-OK response received:', response.status);
      return provideMockAnalysis(sanitizedSymbol);
    }

    // Try to parse the response as JSON
    try {
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data && data.text) {
        return {
          text: cleanAnalysisText(data.text),
          symbol: sanitizedSymbol
        };
      } else {
        console.error('Invalid response format:', data);
        return provideMockAnalysis(sanitizedSymbol);
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return provideMockAnalysis(sanitizedSymbol);
    }
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    return provideMockAnalysis(symbol);
  }
};

// Provide mock analysis data for better user experience when the API fails
const provideMockAnalysis = (symbol: string): StockAnalysisResponse => {
  return {
    text: `# Mock Analysis for ${symbol}\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. Please try again later.\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes`,
    symbol: symbol
  };
};
