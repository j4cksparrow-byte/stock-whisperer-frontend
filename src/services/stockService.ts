
export type StockAnalysisResponse = {
  analysisText: string;
  chartImageUrl: string;
};

export const fetchStockAnalysis = async (symbol: string): Promise<StockAnalysisResponse> => {
  // Replace this with your actual webhook URL in production
  const WEBHOOK_URL = 'YOUR_N8N_PRODUCTION_WEBHOOK_URL';

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbol }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch analysis');
  }

  return response.json();
};
