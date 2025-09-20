
import TradingViewChart from "@/components/TradingViewChart";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { MetricsRow } from "@/components/Dashboard/MetricsRow";
import { LeftSidebar } from "@/components/Dashboard/LeftSidebar";
import { RightSidebar } from "@/components/Dashboard/RightSidebar";
import { stockScoringService } from "@/services/scoringService";
import { AggregateResult } from "@/types/stockTypes";
import { useState, useEffect } from "react";


const Index = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [analysisResult, setAnalysisResult] = useState<AggregateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStockSelect = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setLoading(true);
    
    try {
      const result = await stockScoringService.scoreStock(symbol);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data for AAPL
  useEffect(() => {
    handleStockSelect("AAPL");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        {/* Dashboard Header */}
        <DashboardHeader 
          onStockSelect={handleStockSelect}
          selectedStock={selectedSymbol}
        />
        
        {/* Metrics Row */}
        <MetricsRow result={analysisResult} />
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <LeftSidebar result={analysisResult} />
          
          {/* Main Chart Area */}
          <div className="flex-1 p-6">
            <div className="h-full bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium text-muted-foreground">PRICE CHART</h3>
              </div>
              <div className="h-96">
                <TradingViewChart 
                  symbol={selectedSymbol} 
                  exchange="NASDAQ"
                  height={400} 
                />
              </div>
              
              {/* RSI Indicator */}
              <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">RSI 14</div>
                <div className="h-16 bg-muted/30 rounded flex items-end justify-center">
                  <div className="text-xs text-muted-foreground">RSI Indicator Area</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <RightSidebar result={analysisResult} />
        </div>
      </div>
    </div>
  );
};

export default Index;
