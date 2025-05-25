
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
    
    // Configure request with settings to handle SSL issues in production
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      body: payload,
      // Reduce timeout to 15 seconds for better user experience
      signal: AbortSignal.timeout(15000),
      // Add mode and credentials for better CORS handling
      mode: 'cors',
      credentials: 'omit'
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
    
    // Special handling for different types of network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error occurred. This could be due to SSL certificate issues or CORS in production.');
    } else if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('Request timed out after 15 seconds. The API may be experiencing high load.');
    } else if (error.message && error.message.includes('ERR_CERT_AUTHORITY_INVALID')) {
      console.error('SSL certificate error detected.');
    }
    
    // Always provide a fallback for any error
    return provideMockAnalysis(symbol);
  }
};

// Provide mock analysis data for better user experience when the API fails
const provideMockAnalysis = (symbol: string): StockAnalysisResponse => {
  return {
    url: "https://placeholder-chart.com/error",
    text: `# Mock Analysis for ${symbol}\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. This may be due to SSL certificate issues in the production environment.\n\n### What You Can Do\n\n- Try refreshing the page\n- The live TradingView chart above still provides real-time data\n- Check back later when the API service is restored`,
    symbol: symbol
  };
};
