
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

const API_BASE_URL = import.meta.env.PROD
  ? 'https://corsproxy.io/?https://kashrollin.app.n8n.cloud/webhook/stock-chart-analysis'
  : '/api/stock-analysis';

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  try {
    console.log('Using API URL:', API_BASE_URL);
    
    // Use URL search params for more reliable data transmission
    const url = new URL(API_BASE_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify({ 
        symbol,
        exchange 
      }),
    });

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
      
      // If all else fails, create a mock response for better user experience
      return {
        url: "https://placeholder-chart.com/error",
        text: "Unable to fetch stock analysis. The API returned an invalid format. Please try again later.",
        symbol: symbol
      };
    }
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    throw error;
  }
};
