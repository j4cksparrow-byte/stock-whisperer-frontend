
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStockAnalysis } from "@/services/stockService";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StockAnalysis = () => {
  const [tickerSymbol, setTickerSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [chartImageUrl, setChartImageUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTickerSymbol(e.target.value.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tickerSymbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock ticker symbol",
        variant: "destructive",
      });
      return;
    }

    // Reset states
    setIsLoading(true);
    setAnalysisText("");
    setChartImageUrl("");
    setErrorMessage("");

    try {
      const data = await fetchStockAnalysis(tickerSymbol);
      setAnalysisText(data.analysisText);
      setChartImageUrl(data.chartImageUrl);
      
      toast({
        title: "Success",
        description: `Analysis for ${tickerSymbol} loaded successfully`,
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
          <CardDescription>Enter a ticker symbol to analyze stock performance and insights</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="AAPL, MSFT, GOOGL..."
                value={tickerSymbol}
                onChange={handleInputChange}
                className="bg-white border-2 focus:border-finance-accent text-lg uppercase tracking-wider pl-3"
                disabled={isLoading}
                maxLength={10}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-finance-primary hover:bg-finance-secondary text-white min-w-[140px] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  Fetching...
                </>
              ) : (
                "Fetch Analysis"
              )}
            </Button>
          </form>

          {/* Loading state */}
          {isLoading && (
            <div className="bg-finance-muted p-8 rounded-lg text-center animate-pulse-subtle my-4">
              <Loader size={40} className="mx-auto text-finance-primary animate-spin mb-4" />
              <p className="text-lg text-finance-primary font-medium">Fetching data...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing {tickerSymbol}...</p>
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
          {!isLoading && !errorMessage && analysisText && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Analysis text */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <h3 className="text-xl font-semibold text-finance-primary mb-3 border-b pb-2">
                  Analysis for {tickerSymbol}
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{analysisText}</p>
                </div>
              </div>
              
              {/* Chart image */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                {chartImageUrl && (
                  <div className="border rounded-lg overflow-hidden shadow-sm bg-white p-1">
                    <img 
                      src={chartImageUrl} 
                      alt={`${tickerSymbol} Stock Chart`} 
                      className="w-full h-auto rounded" 
                    />
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {tickerSymbol} Performance Chart
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAnalysis;
