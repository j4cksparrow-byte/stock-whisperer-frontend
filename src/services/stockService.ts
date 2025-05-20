
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

// Function to clean the analysis text by replacing <br> tags with newlines
const cleanAnalysisText = (text: string): string => {
  return text.replace(/<br\s*\/?>/gi, '\n');
};

// API configuration - Use kashrollin.app.n8n.cloud as the endpoint
const API_BASE_URL = import.meta.env.PROD
  ? 'https://egiiqbgumgltatfljbcs.supabase.co/functions/v1/stock-analysis-proxy'
  : '/api/stock-analysis';

// Direct API URL as fallback if the proxy fails
const DIRECT_API_URL = 'https://kashrollin.app.n8n.cloud/webhook/stock-chart-analysis';

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
        'User-Agent': 'StockAnalysisClient/1.0'
      },
      body: payload,
      // Don't send credentials in production as it may trigger preflight complexity
      credentials: import.meta.env.PROD ? 'omit' : 'include',
      // Increase timeout to 45 seconds to give the API more time to respond
      signal: AbortSignal.timeout(45000)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      console.warn('Primary API request failed. Attempting direct API call as fallback.');
      
      // Try direct API call as fallback
      return await tryDirectApiCall(sanitizedSymbol, sanitizedExchange);
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
      
      // Try direct API call as fallback if parsing failed
      return await tryDirectApiCall(sanitizedSymbol, sanitizedExchange);
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
      
      // Try direct API call as fallback
      try {
        return await tryDirectApiCall(symbol, exchange);
      } catch (directError) {
        console.error('Direct API call also failed:', directError);
      }
    } else if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('Request timed out. Trying direct API call as fallback.');
      
      try {
        return await tryDirectApiCall(symbol, exchange);
      } catch (directError) {
        console.error('Direct API call also failed:', directError);
      }
    }
    
    // Always provide a fallback for any error
    return provideMockAnalysis(symbol);
  }
};

// Try a direct API call as a fallback mechanism
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
      // Increase timeout but not too much
      signal: AbortSignal.timeout(30000)
    });
    
    console.log('Direct API response status:', directResponse.status);
    
    if (!directResponse.ok) {
      throw new Error(`Direct API call failed with status ${directResponse.status}`);
    }
    
    const directData = await directResponse.json();
    console.log('Direct API response data:', directData);
    
    return {
      ...directData,
      text: cleanAnalysisText(directData.text)
    };
  } catch (error) {
    console.error('Error in direct API call:', error);
    throw error; // Let the calling function handle this error
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
