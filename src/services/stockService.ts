
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
    console.log('Environment:', window.location.hostname);
    
    // Further sanitize and format the values to prevent issues
    const sanitizedSymbol = symbol.trim().replace(/[^\w.-]/g, '');
    const sanitizedExchange = exchange.trim().replace(/[^\w.-]/g, '');
    
    const payload = JSON.stringify({
      symbol: sanitizedSymbol,
      exchange: sanitizedExchange
    });
    
    console.log('Sending payload:', payload);
    
    // Configure request with optimal settings for production environments
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add origin header for CORS
        'Origin': window.location.origin,
      },
      body: payload,
      // Reduce timeout for production to fail faster on SSL issues
      signal: AbortSignal.timeout(15000),
      // Add mode and credentials for better CORS handling
      mode: 'cors',
      credentials: 'omit'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
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
    
    // Enhanced error handling for different types of failures
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network/SSL error occurred. This often happens with certificate issues in production.');
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.error('Production environment detected. SSL certificate may be invalid.');
      }
    } else if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('Request timed out after 15 seconds. The API may be experiencing high load.');
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Request was aborted. This may be due to network connectivity issues.');
    }
    
    // Always provide a fallback for any error
    return provideMockAnalysis(symbol);
  }
};

// Provide mock analysis data for better user experience when the API fails
const provideMockAnalysis = (symbol: string): StockAnalysisResponse => {
  return {
    url: "https://placeholder-chart.com/error",
    text: `# Mock Analysis for ${symbol}\n\n## API Connection Issues\n\nWe're currently experiencing connectivity issues with our analysis service. This could be due to:\n\n- SSL certificate validation errors in production\n- Network connectivity problems\n- Service temporarily unavailable\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes\n\nThis is mock data provided for demonstration purposes.`,
    symbol: symbol
  };
};
