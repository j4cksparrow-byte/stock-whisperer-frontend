
import { StockDashboard } from "@/components/Dashboard/StockDashboard";
import UnifiedStockInput from "@/components/UnifiedStockInput";
import { useState } from "react";
import { Company } from "@/data/companies";
import { stockScoringService } from "@/services/scoringService";
import { AggregateResult } from "@/types/stockTypes";

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AggregateResult | null>(null);

  const handleAnalyze = async (company: Company) => {
    setSelectedCompany(company);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await stockScoringService.scoreStock(company.symbol);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Show dashboard if we have a selected company, otherwise show landing page
  if (selectedCompany) {
    return (
      <StockDashboard
        result={analysisResult}
        isLoading={isAnalyzing}
        symbol={selectedCompany.symbol}
        companyName={selectedCompany.name}
        onBack={() => setSelectedCompany(null)}
      />
    );
  }
 
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Landing Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            Stock Analysis
            <span className="text-primary"> Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive analysis and insights for any publicly traded company with 
            our advanced scoring algorithm
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-16">
          <UnifiedStockInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary rounded-full" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Technical Analysis</h3>
            <p className="text-muted-foreground">
              Advanced technical indicators including RSI, SMA trends, and momentum analysis
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fundamental Metrics</h3>
            <p className="text-muted-foreground">
              Comprehensive fundamental analysis including P/E ratios, ROE, and growth metrics
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sentiment Analysis</h3>
            <p className="text-muted-foreground">
              Real-time news sentiment analysis with decay-weighted scoring algorithms
            </p>
          </div>
        </div>

        <footer className="text-center text-muted-foreground text-sm">
          <p>Data provided for informational purposes only. Not financial advice.</p>
          <p className="mt-1">© {new Date().getFullYear()} Stock Analysis Dashboard</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
