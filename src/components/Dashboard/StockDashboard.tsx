import { useState } from "react";
import { TrendingUp, BarChart3, Brain, Calculator, Target, ArrowLeft } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { SentimentBar } from "./SentimentBar";
import { WeightsVisualization } from "./WeightsVisualization";
import { FundamentalsTable } from "./FundamentalsTable";
import { AlertRules } from "./AlertRules";
import { CircularScore } from "../CircularScore";
import TradingViewChart from "../TradingViewChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AggregateResult } from "@/types/stockTypes";

interface StockDashboardProps {
  result: AggregateResult | null;
  isLoading: boolean;
  symbol: string;
  companyName?: string;
  onBack?: () => void;
}

export const StockDashboard = ({ result, isLoading, symbol, companyName, onBack }: StockDashboardProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Search for a stock to view analysis</p>
        </div>
      </div>
    );
  }

  // Sample alert rules (in a real app, these would come from the backend)
  const sampleAlerts = [
    {
      id: "1",
      type: "crossover" as const,
      title: "SMA crossover with Sentiment positive",
      description: "Alert when SMA50 crosses above SMA200 and sentiment is positive",
      status: "active" as const,
      date: "Apr 23"
    },
    {
      id: "2", 
      type: "score" as const,
      title: "Fundamentals score below 50",
      description: "Alert when fundamental analysis score drops below threshold",
      status: "triggered" as const,
      date: "Apr 24"
    }
  ];

  const getConfidenceLevel = (score: number | null) => {
    if (!score) return "Unknown";
    if (score >= 80) return "Very High";
    if (score >= 70) return "High";
    if (score >= 60) return "Medium";
    if (score >= 40) return "Low";
    return "Very Low";
  };

  const currentPrice = result.scores.technicals?.data_used?.currentClose as number || 0;
  const sma20 = result.scores.technicals?.data_used?.sma20 as number || 0;
  const priceTrend = currentPrice && sma20 ? ((currentPrice - sma20) / sma20 * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="p-6">
        {/* Stock Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              )}
              <div>
                <h1 className="text-4xl font-bold">{symbol}</h1>
                <p className="text-lg text-muted-foreground">{companyName || "Company Name"}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Market Open
            </Badge>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* SMA Trend */}
          <MetricCard
            title="SMA Trend"
            value={currentPrice ? currentPrice.toFixed(2) : "N/A"}
            trend={priceTrend ? {
              value: Number(priceTrend.toFixed(2)),
              isPositive: priceTrend > 0
            } : undefined}
            icon={<TrendingUp className="w-5 h-5" />}
          />

          {/* RSI */}
          <MetricCard
            title="RSI"
            value={result.scores.technicals?.data_used?.rsi ? 
              (result.scores.technicals.data_used.rsi as number).toFixed(1) : "N/A"}
            icon={<BarChart3 className="w-5 h-5" />}
          />

          {/* Sentiment */}
          <MetricCard
            title="Sentiment"
            value=""
            icon={<Brain className="w-5 h-5" />}
          >
            <SentimentBar score={result.scores.sentiment?.score || 50} />
          </MetricCard>

          {/* Fundamentals */}
          <MetricCard
            title="Fundamentals"
            value={result.scores.fundamentals?.score || "N/A"}
            icon={<Calculator className="w-5 h-5" />}
          />

          {/* Aggregate Score */}
          <MetricCard
            title="Aggregate Score"
            value=""
            badge={{
              text: `Verdict: ${result.label}`,
              variant: result.label === "Buy" ? "default" : 
                      result.label === "Hold" ? "secondary" : "destructive"
            }}
            subtitle={`Confidence: ${getConfidenceLevel(result.aggregateScore)}`}
            icon={<Target className="w-5 h-5" />}
          >
            <div className="flex justify-center">
              <CircularScore 
                score={result.aggregateScore || 0} 
                label={result.label}
              />
            </div>
          </MetricCard>
        </div>

        {/* Charts and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Price Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <TradingViewChart 
                  symbol={`NASDAQ:${symbol}`}
                  height={300}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weights */}
          <Card>
            <CardContent className="pt-6">
              <WeightsVisualization weights={result.weights} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Rules */}
          <AlertRules alerts={sampleAlerts} />

          {/* Fundamentals Table */}
          <FundamentalsTable 
            data={{
              peRatio: result.scores.fundamentals?.data_used?.peRatio as number | undefined,
              pegRatio: result.scores.fundamentals?.data_used?.pegRatio as number | undefined,  
              dividendYield: result.scores.fundamentals?.data_used?.dividendYield as number | undefined,
              marketCap: result.scores.fundamentals?.data_used?.marketCap as number | undefined,
              evEbitda: result.scores.fundamentals?.data_used?.evEbitda as number | undefined,
              roe: result.scores.fundamentals?.data_used?.roe as number | undefined,
              operatingMargin: result.scores.fundamentals?.data_used?.operatingMargin as number | undefined,
              revenueGrowth: result.scores.fundamentals?.data_used?.revenueGrowth as number | undefined,
            }}
          />

          {/* News & Sentiment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                News & Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">{symbol} moves search on them</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {(result.scores.sentiment?.data_used?.articleCount as number) || 0} articles
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.scores.sentiment?.notes?.[0] || "Sentiment analysis complete"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};