import { ArrowLeft, TrendingUp, Brain, Calculator, Target, Activity, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TradingViewChart from "../TradingViewChart";
import { AggregateResult } from "@/types/stockTypes";

interface ModernStockDashboardProps {
  result: AggregateResult | null;
  isLoading: boolean;
  symbol: string;
  companyName?: string;
  onBack?: () => void;
}

const ScoreCard = ({ 
  title, 
  score, 
  icon: Icon, 
  color = "primary",
  subtitle 
}: { 
  title: string; 
  score: number | null; 
  icon: any; 
  color?: string;
  subtitle?: string;
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "green": return "from-green-500 to-green-600 text-green-50";
      case "blue": return "from-blue-500 to-blue-600 text-blue-50";
      case "purple": return "from-purple-500 to-purple-600 text-purple-50";
      case "orange": return "from-orange-500 to-orange-600 text-orange-50";
      default: return "from-primary to-primary/80 text-primary-foreground";
    }
  };

  return (
    <Card className="metric-card group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(color)} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{score ?? "N/A"}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {score && (
          <Progress value={score} className="mt-3" />
        )}
      </CardContent>
    </Card>
  );
};

const CircularProgress = ({ score, size = 120 }: { score: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 70) return "#10b981"; // green
    if (score >= 40) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">SCORE</span>
      </div>
    </div>
  );
};

export const ModernStockDashboard = ({ 
  result, 
  isLoading, 
  symbol, 
  companyName, 
  onBack 
}: ModernStockDashboardProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Search for a stock to begin analysis</p>
        </div>
      </div>
    );
  }

  const currentPrice = result.scores.technicals?.data_used?.currentClose as number || 0;
  const sma20 = result.scores.technicals?.data_used?.sma20 as number || 0;
  const priceTrend = currentPrice && sma20 ? ((currentPrice - sma20) / sma20 * 100) : 0;

  const getVerdictColor = (label: string) => {
    switch (label) {
      case "Buy": return "bg-green-500 text-white";
      case "Hold": return "bg-yellow-500 text-white";
      case "Sell": return "bg-red-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {onBack && (
                <Button 
                  variant="ghost" 
                  onClick={onBack}
                  className="hover:bg-muted/50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-4xl font-bold gradient-text">{symbol}</h1>
                <p className="text-lg text-muted-foreground">{companyName}</p>
              </div>
            </div>
            <Badge className={`${getVerdictColor(result.label)} px-6 py-2 text-lg font-semibold`}>
              {result.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <ScoreCard
            title="Technical"
            score={result.scores.technicals?.score || null}
            icon={TrendingUp}
            color="blue"
            subtitle="RSI, SMA, Momentum"
          />
          <ScoreCard
            title="Fundamental"
            score={result.scores.fundamentals?.score || null}
            icon={Calculator}
            color="green"
            subtitle="P/E, ROE, Growth"
          />
          <ScoreCard
            title="Sentiment"
            score={result.scores.sentiment?.score || null}
            icon={Brain}
            color="purple"
            subtitle="News Analysis"
          />
          <ScoreCard
            title="Price"
            score={currentPrice ? Math.round(currentPrice) : null}
            icon={DollarSign}
            color="orange"
            subtitle={priceTrend ? `${priceTrend > 0 ? '+' : ''}${priceTrend.toFixed(2)}%` : undefined}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Chart */}
          <Card className="lg:col-span-2 glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Price Chart</h2>
                <Badge variant="outline" className="text-xs">
                  Live Data
                </Badge>
              </div>
              <div className="h-96 rounded-xl overflow-hidden">
                <TradingViewChart 
                  symbol={`NASDAQ:${symbol}`}
                  height={384}
                />
              </div>
            </CardContent>
          </Card>

          {/* Aggregate Score */}
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-6">Overall Score</h2>
              <div className="mb-6">
                <CircularProgress score={result.aggregateScore || 0} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Technical</span>
                  <span className="font-medium">{result.weights.technical}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fundamental</span>
                  <span className="font-medium">{result.weights.fundamental}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sentiment</span>
                  <span className="font-medium">{result.weights.sentiment}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        {result.reasons && result.reasons.length > 0 && (
          <Card className="glass-card animate-scale-in">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.reasons.map((reason, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-sm">{reason}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};