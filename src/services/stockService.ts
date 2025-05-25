
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

// Function to clean the analysis text by replacing <br> tags with newlines
const cleanAnalysisText = (text: string): string => {
  return text.replace(/<br\s*\/?>/gi, '\n');
};

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
        // Explicitly specify origin to help with CORS
        'Origin': window.location.origin,
        // Add a user agent to help identify the request
        'User-Agent': 'StockAnalysisDashboard/1.0'
      },
      body: payload,
      // Don't send credentials in production as it may trigger preflight complexity
      credentials: import.meta.env.PROD ? 'omit' : 'include',
      // Increase timeout to 30 seconds to give the API more time to respond
      signal: AbortSignal.timeout(30000)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // Check for specific error patterns
      if (errorText.includes('regex') || errorText.includes('invalid character')) {
        console.warn('Detected regex or special character issue in response. Providing mock data.');
        return provideMockAnalysis(sanitizedSymbol);
      }
      
      // If we're in development mode and the proxy failed, try direct API call as fallback
      if (!import.meta.env.PROD && (response.status === 502 || response.status === 504)) {
        console.log('Proxy failed. Attempting direct API call as fallback...');
        return await directApiCall(sanitizedSymbol, sanitizedExchange);
      }
      
      throw new Error(errorText || `Failed to fetch analysis (Status: ${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Invalid response type:', contentType, 'Response text:', text);
      
      // Try to parse the text as JSON in case the content type header is incorrect
      try {
        const extractedJson = extractJsonFromText(text);
        if (extractedJson) {
          console.log("Extracted JSON from non-JSON response:", extractedJson);
          return {
            ...extractedJson,
            text: cleanAnalysisText(extractedJson.text)
          };
        }
      } catch (parseError) {
        console.error("Failed to extract JSON from response:", parseError);
      }
      
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
      console.error('Request timed out after 30 seconds. Consider using a more responsive API endpoint.');
    }
    
    // Always provide a fallback for any error
    return provideMockAnalysis(symbol);
  }
};

// Direct API call as a fallback when proxy fails (for development only)
const directApiCall = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    console.log('Making direct API call to:', 'https://raichen.app.n8n.cloud/webhook/stock-chart-analysis');
    
    const response = await fetch('https://raichen.app.n8n.cloud/webhook/stock-chart-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'User-Agent': 'StockAnalysisDashboard/1.0 (Direct API Call)'
      },
      body: JSON.stringify({ symbol, exchange }),
      // Don't include credentials for cross-origin requests to avoid CORS issues
      credentials: 'omit',
      // Increase timeout for direct API call
      signal: AbortSignal.timeout(45000)
    });
    
    if (!response.ok) {
      throw new Error(`Direct API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      text: cleanAnalysisText(data.text)
    };
  } catch (error) {
    console.error('Error in direct API call:', error);
    return provideMockAnalysis(symbol);
  }
};

// Try to extract JSON from a string that might contain JSON
const extractJsonFromText = (text: string): StockAnalysisResponse | null => {
  try {
    // Try to find JSON objects in the response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate that the parsed object has the required properties
      if (parsed.url && parsed.text && parsed.symbol) {
        return parsed as StockAnalysisResponse;
      }
    }
    return null;
  } catch (e) {
    console.error("Failed to extract JSON:", e);
    return null;
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
