
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStockAnalysis } from "@/services/stockService";
import { Loader, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import { Company } from "@/data/companies";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TradingViewChart from "./TradingViewChart";

interface StockAnalysisProps {
  company: Company | null;
  triggerAnalysis: boolean;
  onAnalysisComplete?: (symbol: string) => void;
}

const StockAnalysis = ({ company, triggerAnalysis, onAnalysisComplete }: StockAnalysisProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (company && triggerAnalysis) {
      performAnalysis();
    }
  }, [company, triggerAnalysis]);

  const performAnalysis = async () => {
    if (!company) return;

    // Reset states
    setIsLoading(true);
    setAnalysisText("");
    setErrorMessage("");
    setIsMockData(false);
    setLoadingMessage("Connecting to analysis service...");

    // Set up progressive loading messages
    const loadingMessages = [
      "Connecting to analysis service...",
      "Fetching market data...",
      "Processing technical indicators...",
      "This is taking longer than expected...",
      "Still working on your analysis...",
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length - 1) {
        messageIndex++;
        setLoadingMessage(loadingMessages[messageIndex]);
      }
    }, 10000); // Update every 10 seconds

    try {
      console.log("Fetching stock analysis for:", company);
      
      const sanitizedSymbol = company.symbol.replace(/[^\w.-]/g, '');
      console.log("Using sanitized symbol:", sanitizedSymbol);
      
      const data = await fetchStockAnalysis(sanitizedSymbol, company.exchange);
      console.log("Response received:", data);
      
      if (data.url.includes("placeholder-chart.com/error")) {
        setErrorMessage("");
        setAnalysisText(data.text);
        setIsMockData(true);
        
        toast({
          title: "Service Temporarily Unavailable",
          description: "Showing fallback information. You can try again or check the live chart.",
          variant: "destructive",
        });
      } else {
        setAnalysisText(data.text);
        setIsMockData(false);
        setRetryCount(0); // Reset retry count on success
        
        toast({
          title: "Analysis Complete",
          description: `Analysis for ${company.exchange}:${sanitizedSymbol} loaded successfully`,
        });
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(sanitizedSymbol);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch analysis';
      setErrorMessage(errorMsg);
      setIsMockData(true);
      
      toast({
        title: "Analysis Failed",
        description: "The service is currently unavailable. You can try again or view the live chart.",
        variant: "destructive",
      });
      
      console.error("Error fetching stock analysis:", error);
    } finally {
      setIsLoading(false);
      clearInterval(messageInterval);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    performAnalysis();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          📈 Detailed Stock Analysis
        </h3>
        <p className="text-gray-400 mt-2">
          Comprehensive technical analysis and market insights
        </p>
      </div>

      {/* Retry button */}
      {(isMockData || errorMessage) && company && (
        <div className="text-center">
          <Button 
            onClick={handleRetry}
            disabled={isLoading}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Analysis
          </Button>
        </div>
      )}

          {/* Loading state */}
          {isLoading && (
            <div className="mt-6 flex flex-col items-center justify-center py-8">
              <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-gray-400 text-center">{loadingMessage}</p>
              {retryCount > 0 && (
                <p className="text-gray-500 text-sm mt-2">Retry attempt: {retryCount}</p>
              )}
            </div>
          )}

          {/* Error state */}
          {errorMessage && (
            <div className="mt-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Mock data notice */}
          {!isLoading && isMockData && (
            <Alert className="mt-6 bg-amber-900/30 border-amber-500">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle>Service Notice</AlertTitle>
              <AlertDescription>
                Our analysis service is temporarily unavailable. The information below is a fallback message. The live chart above shows real market data.
              </AlertDescription>
            </Alert>
          )}

      {/* Results */}
      {!isLoading && !errorMessage && analysisText && company && (
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-gray-200 border-b border-gray-700 pb-2">
            Technical Analysis for <span className="font-bold">{company.exchange}:{company.symbol}</span>
          </h4>
          
          {/* Live TradingView Chart */}
          <div className="border border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gray-800/50 p-2">
            <TradingViewChart 
              symbol={company.symbol} 
              exchange={company.exchange}
              height={350} 
            />
          </div>
          
          {/* Analysis text with markdown rendering */}
          {analysisText && (
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-700">
              <div className="prose prose-invert max-w-none">  
                <ReactMarkdown>{analysisText}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockAnalysis;
