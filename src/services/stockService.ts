export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

export const fetchStockAnalysis = async (symbol: string, exchange: string = 'NASDAQ'): Promise<StockAnalysisResponse> => {
  // Use the proxy endpoint instead of direct webhook URL
  const response = await fetch('/api/stock-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      symbol,
      exchange 
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch analysis');
  }
  console.log("Response:", response.text);
  return response.json();
};
