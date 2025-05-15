import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStockAnalysis } from "@/services/stockService";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      const data = await fetchStockAnalysis(selectedCompany.symbol, selectedCompany.exchange);
      console.log(data);
      setAnalysisText(data.text);
      setChartImageUrl(data.url);
      
      // Notify parent component of the new symbol
      if (onAnalysisComplete) {
        onAnalysisComplete(selectedCompany.symbol);
      }
      
      toast({
        title: "Success",
        description: `Analysis for ${selectedCompany.exchange}:${selectedCompany.symbol} loaded successfully`,
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
          <CardDescription>Search and analyze any publicly traded company</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="company-search" className="block text-sm font-medium text-gray-700 mb-1">
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
            <div className="mt-6 flex flex-col items-center justify-center py-8">
              <Loader className="w-12 h-12 text-finance-primary animate-spin mb-4" />
              <p className="text-gray-600">Analyzing stock data...</p>
            </div>
          )}

          {/* Error state */}
          {errorMessage && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && !errorMessage && chartImageUrl && analysisText && selectedCompany && (
            <div className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold text-finance-primary border-b pb-2">
                Technical Analysis for <span className="font-bold">{selectedCompany.exchange}:{selectedCompany.symbol}</span>
              </h2>
              
              {/* Chart image */}
              {chartImageUrl && (
                <div className="border rounded-lg overflow-hidden shadow-sm bg-white p-2">
                  <img 
                    src={chartImageUrl} 
                    alt={`${selectedCompany.symbol} Stock Chart`} 
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
