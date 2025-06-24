
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

// Function to clean the analysis text by replacing <br> tags with newlines
const cleanAnalysisText = (text: string): string => {
  return text.replace(/<br\s*\/?>/gi, '\n');
};

// API configuration
const API_BASE_URL = import.meta.env.PROD
  ? 'https://egiiqbgumgltatfljbcs.supabase.co/functions/v1/stock-analysis-proxy'
  : '/api/stock-analysis';

// Direct API URL as fallback - updated with new endpoint
const DIRECT_API_URL = 'https://kingaakash.app.n8n.cloud/webhook/stock-chart-analysis';

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    console.log('Fetching stock analysis for:', { symbol, exchange });
    console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');
    console.log('Using API URL:', API_BASE_URL);
    
    const sanitizedSymbol = symbol.trim().replace(/[^\w.-]/g, '');
    const sanitizedExchange = exchange.trim().replace(/[^\w.-]/g, '');
    
    const payload = JSON.stringify({
      symbol: sanitizedSymbol,
      exchange: sanitizedExchange
    });
    
    console.log('Sending payload:', payload);
    
    // Try primary API with increased timeout to 60 seconds
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: payload,
      signal: AbortSignal.timeout(60000)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    
    // Check if response has url property and it's not an error URL
    // Fix: Check if url exists before calling includes()
    if (!data.url || (data.url && data.url.includes("placeholder-chart.com/error"))) {
      console.warn('Received error response from API, trying direct API call');
      return await tryDirectApiCall(sanitizedSymbol, sanitizedExchange);
    }
    
    return {
      url: data.url || "https://placeholder-chart.com/default",
      text: cleanAnalysisText(data.text || ""),
      symbol: data.symbol || sanitizedSymbol
    };
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    
    // Handle SSL certificate errors specifically
    if (error instanceof TypeError && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('ERR_CERT_AUTHORITY_INVALID') ||
      error.message.includes('SSL')
    )) {
      console.error('SSL/Network error detected. Attempting direct API call as fallback.');
      
      try {
        return await tryDirectApiCall(symbol, exchange);
      } catch (directError) {
        console.error('Direct API call also failed:', directError);
        return provideMockAnalysis(symbol);
      }
    }
    
    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('Request timed out. Providing mock analysis.');
      return provideMockAnalysis(symbol);
    }
    
    // For any other error, provide mock analysis
    return provideMockAnalysis(symbol);
  }
};

// Try a direct API call as a fallback mechanism with increased timeout to 60 seconds
const tryDirectApiCall = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  console.log('Attempting direct API call to:', DIRECT_API_URL);
  
  try {
    const directResponse = await fetch(DIRECT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'StockAnalysisClient/1.0'
      },
      body: JSON.stringify({ symbol, exchange }),
      signal: AbortSignal.timeout(60000)
    });
    
    console.log('Direct API response status:', directResponse.status);
    
    if (!directResponse.ok) {
      throw new Error(`Direct API call failed with status ${directResponse.status}`);
    }
    
    const directData = await directResponse.json();
    console.log('Direct API response data:', directData);
    
    // Handle response that may not have url property
    return {
      url: directData.url || "https://placeholder-chart.com/analysis",
      text: cleanAnalysisText(directData.text || ""),
      symbol: directData.symbol || symbol
    };
  } catch (error) {
    console.error('Error in direct API call:', error);
    throw error;
  }
};

// Provide mock analysis data for better user experience when APIs fail
const provideMockAnalysis = (symbol: string): StockAnalysisResponse => {
  console.log('Providing mock analysis for symbol:', symbol);
  
  return {
    url: "https://placeholder-chart.com/error",
    text: `# Technical Analysis for ${symbol}\n\n## Connection Issue\n\nWe're currently experiencing connectivity issues with our analysis service. This could be due to:\n\n- SSL certificate validation problems\n- Network connectivity issues\n- Temporary service unavailability\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes\n- Contact support if the issue persists\n\n*This is mock data provided for demonstration purposes.*`,
    symbol: symbol
  };
};
