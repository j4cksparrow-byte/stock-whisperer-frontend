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
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        symbol,
        exchange 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(errorText || 'Failed to fetch analysis');
    }

    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Invalid response type:', contentType, 'Response:', text);
      throw new Error('Invalid response format from server');
    }

    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error('Error in fetchStockAnalysis:', error);
    throw error;
  }
};
