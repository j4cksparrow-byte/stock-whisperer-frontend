import { useState } from 'react';
import StockSearch from './StockSearch';
import { fetchStockAnalysis } from '@/services/stockService';

interface StockAnalysisProps {
  onAnalysisComplete?: (symbol: string) => void;
}

const StockAnalysis = ({ onAnalysisComplete }: StockAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleStockSelect = async (symbol: string, exchange: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await fetchStockAnalysis(symbol, exchange);
      setAnalysis(result.text);
      onAnalysisComplete?.(symbol);
    } catch (err) {
      console.error('Error analyzing stock:', err);
      setError('Failed to analyze stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Analysis</h2>
      
      <div className="mb-6">
        <StockSearch 
          onSelect={handleStockSelect}
          placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-finance-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Results</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAnalysis;
