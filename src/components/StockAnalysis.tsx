
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStockAnalysis } from "@/services/stockService";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import CompanySearch from "./CompanySearch";
import { Company } from "@/data/companies";

interface StockAnalysisProps {
  onAnalysisComplete?: (symbol: string) => void;
}

const StockAnalysis = ({ onAnalysisComplete }: StockAnalysisProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [chartImageUrl, setChartImageUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a company",
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
      console.log("Fetching stock analysis for:", selectedCompany);
      
      // Sanitize symbol to remove any potential problematic characters
      const sanitizedSymbol = selectedCompany.symbol.replace(/[^\w.-]/g, '');
      console.log("Using sanitized symbol:", sanitizedSymbol);
      
      // Add environment info to help debug issues
      console.log("Environment:", import.meta.env.PROD ? "Production" : "Development");
      
      const data = await fetchStockAnalysis(sanitizedSymbol, selectedCompany.exchange);
      console.log("Response received:", data);
      
      if (data.url.includes("placeholder-chart.com/error")) {
        // This is our error fallback
        setErrorMessage("");  // Clear any previous error
        setAnalysisText(data.text);  // Show the mock analysis as markdown
        
        toast({
          title: "API Connectivity Issue",
          description: "Using mock analysis due to connection issues. Please try again later.",
          variant: "destructive",
        });
        
        // Notify parent component of the new symbol even with mock data
        if (onAnalysisComplete) {
          onAnalysisComplete(sanitizedSymbol);
        }
      } else {
        setAnalysisText(data.text);
        setChartImageUrl(data.url);
        
        // Notify parent component of the new symbol
        if (onAnalysisComplete) {
          onAnalysisComplete(sanitizedSymbol);
        }
        
        toast({
          title: "Success",
          description: `Analysis for ${selectedCompany.exchange}:${sanitizedSymbol} loaded successfully`,
        });
      }
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
      <Card className="glass-card border-t-4 border-t-blue-600">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Stock Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">
            Search and analyze any publicly traded company
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="company-search" className="block text-sm font-medium text-gray-300 mb-1">
                Search Company
              </label>
              <CompanySearch
                onSelect={setSelectedCompany}
                placeholder="Type company name or symbol..."
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !selectedCompany}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
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
            <div className="mt-6 flex flex-col items-center justify-center py-8">
              <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-gray-400">Analyzing stock data...</p>
            </div>
          )}

          {/* Error state */}
          {errorMessage && (
            <div className="mt-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && !errorMessage && chartImageUrl && analysisText && selectedCompany && (
            <div className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 border-b border-gray-700 pb-2">
                Technical Analysis for <span className="font-bold">{selectedCompany.exchange}:{selectedCompany.symbol}</span>
              </h2>
              
              {/* Chart image */}
              {chartImageUrl && (
                <div className="border border-gray-700 rounded-lg overflow-hidden shadow-sm bg-gray-800/50 p-2">
                  <img 
                    src={chartImageUrl} 
                    alt={`${selectedCompany.symbol} Stock Chart`} 
                    className="w-full max-w-[600px] h-auto rounded mx-auto" 
                  />
                </div>
              )}
              
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
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAnalysis;
