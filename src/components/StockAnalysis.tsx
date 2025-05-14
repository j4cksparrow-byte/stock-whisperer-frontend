
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStockAnalysis } from "@/services/stockService";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';

// Top 50 popular stock symbols
const POPULAR_STOCKS = [
  "AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "META", "NVDA", "NFLX", "JPM", "V", 
  "WMT", "BAC", "PG", "DIS", "PYPL", "INTC", "VZ", "CSCO", "ADBE", "CRM",
  "KO", "PEP", "T", "CMCSA", "XOM", "PFE", "ABT", "MRK", "CVX", "NKE",
  "AVGO", "QCOM", "TXN", "COST", "UNH", "HD", "MCD", "IBM", "AMD", "GS",
  "MS", "SBUX", "BA", "GE", "CAT", "MMM", "JNJ", "CVS", "ORCL", "WFC"
];

interface StockAnalysisProps {
  onAnalysisComplete?: (symbol: string) => void;
}

const StockAnalysis = ({ onAnalysisComplete }: StockAnalysisProps) => {
  const [tickerSymbol, setTickerSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [chartImageUrl, setChartImageUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const { toast } = useToast();

  const handleSymbolChange = (value: string) => {
    setTickerSymbol(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tickerSymbol.trim()) {
      toast({
        title: "Error",
        description: "Please select a stock symbol",
        variant: "destructive",
      });
      return;
    }

    // Reset states
    setIsLoading(true);
    setAnalysisText("");
    setChartImageUrl("");
    setErrorMessage("");
    setSymbol("");

    try {
      console.log("Fetching stock analysis for:", tickerSymbol);
      const data = await fetchStockAnalysis(tickerSymbol);
      console.log(data);
      setAnalysisText(data.text);
      setChartImageUrl(data.url);
      setSymbol(data.symbol);
      
      // Notify parent component of the new symbol
      if (onAnalysisComplete) {
        onAnalysisComplete(data.symbol);
      }
      
      toast({
        title: "Success",
        description: `Analysis for ${data.symbol} loaded successfully`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch analysis';
      setErrorMessage(errorMsg);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      console.error("Error fetching stock analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white shadow-lg border-t-4 border-t-finance-primary">
        <CardHeader className="bg-gradient-to-r from-finance-muted to-white">
          <CardTitle className="text-3xl font-bold text-finance-primary">Stock Analysis Dashboard</CardTitle>
          <CardDescription>Select a stock symbol to analyze performance and insights</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ticker-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Stock Symbol
              </label>
              <Select value={tickerSymbol} onValueChange={handleSymbolChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a stock symbol" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_STOCKS.map((stock) => (
                    <SelectItem key={stock} value={stock}>{stock}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-finance-primary hover:bg-finance-secondary text-white transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </form>

          {/* Loading state */}
          {isLoading && (
            <div className="bg-finance-muted p-8 rounded-lg text-center animate-pulse-subtle my-4">
              <Loader size={40} className="mx-auto text-finance-primary animate-spin mb-4" />
              <p className="text-lg text-finance-primary font-medium">Analyzing stock data...</p>
              <p className="text-sm text-gray-500 mt-2">This might take a moment...</p>
            </div>
          )}

          {/* Error message */}
          {errorMessage && !isLoading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded my-4">
              <div className="flex">
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis results */}
          {!isLoading && !errorMessage && chartImageUrl && analysisText && (
            <div className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold text-finance-primary border-b pb-2">
                Technical Analysis for <span className= "font-bold">{symbol} </span>
              </h2>
              
              {/* Chart image */}
              {chartImageUrl && (
                <div className="border rounded-lg overflow-hidden shadow-sm bg-white p-2">
                  <img 
                    src={chartImageUrl} 
                    alt={`${symbol} Stock Chart`} 
                    className="w-full max-w-[600px] h-auto rounded mx-auto" 
                  />
                </div>
              )}
              
              {/* Analysis text with markdown rendering */}
              {analysisText && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="prose max-w-none">  
                    
                    <ReactMarkdown>{analysisText}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAnalysis;
