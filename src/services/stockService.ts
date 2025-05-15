
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

const getApiBaseUrl = () => {
  // Try different CORS proxies for production to improve reliability
  return import.meta.env.PROD
    ? 'https://api.allorigins.win/raw?url=https://kashrollin.app.n8n.cloud/webhook/stock-chart-analysis'
    : '/api/stock-analysis';
};

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    console.log('Using API URL:', API_BASE_URL);
    
    // Include timeout to avoid long wait times if the service is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      signal: controller.signal,
      body: JSON.stringify({ 
        symbol,
        exchange 
      }),
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(errorText || `Failed to fetch analysis (Status: ${response.status})`);
    }

    // Parse response as text first to check for HTML responses
    const responseText = await response.text();
    console.log("Raw API Response:", responseText.substring(0, 200) + "...");
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log("API Response Data:", data);
      return data;
    } catch (jsonError) {
      console.error("Failed to parse response as JSON:", jsonError);
      
      // If we received HTML, try to extract the actual JSON data
      // This is a fallback for cases where the API wraps JSON in HTML
      if (responseText.includes('{') && responseText.includes('}')) {
        try {
          const jsonMatch = responseText.match(/\{.*\}/s);
          if (jsonMatch) {
            const extractedJson = jsonMatch[0];
            console.log("Extracted JSON from response:", extractedJson);
            return JSON.parse(extractedJson);
          }
        } catch (extractError) {
          console.error("Failed to extract JSON from HTML:", extractError);
        }
      }
      
      // Create mock data for better user experience
      return provideMockAnalysis(symbol);
    }
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    return provideMockAnalysis(symbol);
  }
};

// Provide mock analysis data for better user experience when the API fails
const provideMockAnalysis = (symbol: string): StockAnalysisResponse => {
  return {
    url: "https://placeholder-chart.com/error",
    text: `# Mock Analysis for ${symbol}\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. This could be due to:\n\n1. CORS restrictions in the production environment\n2. Temporary service outage\n3. Network connectivity issues\n\nPlease try again later or use our application in development mode for testing purposes.`,
    symbol: symbol
  };
};
