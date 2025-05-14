
export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

export const fetchStockAnalysis = async (symbol: string): Promise<StockAnalysisResponse> => {
  // Using the provided webhook URL
  const WEBHOOK_URL = 'https://kashrollin.app.n8n.cloud/webhook/stock-chart-analysis';

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
