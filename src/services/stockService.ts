
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

const API_BASE_URL = import.meta.env.PROD
  ? 'https://kashrollin.app.n8n.cloud/webhook/stock-chart-analysis'
  : '/api/stock-analysis';

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    console.log('Fetching stock analysis for:', { symbol, exchange });
    console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');
    console.log('Using API URL:', API_BASE_URL);
    
    // Create payload with properly sanitized values
    const payload = JSON.stringify({
      symbol: symbol.trim(),
      exchange: exchange.trim()
    });
    
    console.log('Sending payload:', payload);
    
    // Set up request with appropriate CORS headers
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      body: payload,
      // Add credentials to ensure cookies are sent
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      // Check for specific error patterns
      if (errorText.includes('regex') || errorText.includes('invalid character')) {
        console.warn('Detected regex or special character issue. Providing mock data.');
        return provideMockAnalysis(symbol);
      }
      
      throw new Error(errorText || 'Failed to fetch analysis');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Invalid response type:', contentType, 'Response:', text);
      
      // Try to parse the text as JSON in case the content type header is incorrect
      try {
        const extractedJson = extractJsonFromText(text);
        if (extractedJson) {
          console.log("Extracted JSON from non-JSON response:", extractedJson);
          return extractedJson;
        }
      } catch (parseError) {
        console.error("Failed to extract JSON from response:", parseError);
      }
      
      throw new Error('Invalid response format from server');
    }

    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    // Always provide a fallback for any error
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
    text: `# Mock Analysis for ${symbol}\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. Please try again later.`,
    symbol: symbol
  };
};
