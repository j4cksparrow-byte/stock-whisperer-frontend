import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, Newspaper, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EnhancedCompanySearch from './EnhancedCompanySearch';
import TradingViewChart from './TradingViewChart';
import { Skeleton } from '@/components/ui/skeleton';
// Analysis panel components will be imported when available
import {
  StockAnalysisRequest,
  StockAnalysisResponse,
  AnalysisMode,
  AnalysisDuration,
  AnalysisWeights,
  TechnicalIndicators,
  FundamentalFilters,
  SentimentFilters,
  CompanyInfo,
  MarketData
} from '@/types/stockAnalysis';
import EnhancedStockService from '@/services/enhancedStockService';

interface EnhancedStockAnalysisProps {
  onAnalysisComplete?: (symbol: string) => void;
}

const EnhancedStockAnalysis: React.FC<EnhancedStockAnalysisProps> = ({ onAnalysisComplete }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('smart');
  const [analysisDuration, setAnalysisDuration] = useState<AnalysisDuration>('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparing analysis...');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<StockAnalysisResponse | null>(null);

  // Pro Mode Configuration States
  const [customWeights, setCustomWeights] = useState<AnalysisWeights>({
    fundamental: 40,
    technical: 35,
    sentiment: 25
  });

  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators>({
    smaWindows: [20, 50, 200],
    emaWindows: [12, 26],
    rsiLength: 14,
    rsiThresholds: {
      oversold: 30,
      overbought: 70
    },
    macdSettings: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    },
    priceAction: {
      supportResistance: true,
      swingHighsLows: true,
      candlestickPatterns: true,
      trendlines: true
    }
  });

  const [fundamentalFilters, setFundamentalFilters] = useState<FundamentalFilters>({
    peRange: { min: 0, max: 50 },
    pegRange: { min: 0, max: 3 },
    dividendMin: 0,
    marketCapFloor: 1e9, // 1 billion
    debtToEquityMax: 2
  });

  const [sentimentFilters, setSentimentFilters] = useState<SentimentFilters>({
    newsWindow: '7d',
    socialMedia: true,
    analystOpinions: true,
    sources: ['reuters', 'bloomberg', 'yahoo', 'cnbc']
  });

  const { toast } = useToast();

  const handleCompanySelect = (company: CompanyInfo) => {
    setSelectedCompany(company);
    setError(null);
    setAnalysisResult(null);
  };

  const handleAnalysisSubmit = async () => {
    if (!selectedCompany) {
      toast({
        title: "No Company Selected",
        description: "Please select a company to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Initializing analysis...');

    try {
      const request: StockAnalysisRequest = {
        symbol: selectedCompany.symbol,
        exchange: selectedCompany.exchange,
        duration: analysisDuration,
        mode: analysisMode,
        customWeights: analysisMode === 'pro' ? customWeights : undefined,
        indicators: analysisMode === 'pro' ? technicalIndicators : undefined,
        fundamentals: analysisMode === 'pro' ? fundamentalFilters : undefined,
        sentiment: analysisMode === 'pro' ? sentimentFilters : undefined
      };

      setLoadingMessage('Fetching market data...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoadingMessage('Analyzing technical indicators...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setLoadingMessage('Processing fundamental metrics...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setLoadingMessage('Evaluating sentiment data...');
      await new Promise(resolve => setTimeout(resolve, 700));

      setLoadingMessage('Generating AI insights...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await EnhancedStockService.analyzeStock(request);
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${selectedCompany.symbol}`,
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(selectedCompany.symbol);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis';
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('Preparing analysis...');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="card-glass border-t-4 border-t-finance-primary">
        <CardHeader className="bg-gradient-to-r from-finance-primary/10 via-finance-accent/10 to-finance-secondary/10">
          <CardTitle className="text-responsive-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary to-finance-accent">
            StockViz Hybrid Analysis
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Get intelligent insights combining technical, fundamental, and sentiment analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Mode Selection */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-foreground mb-2">
              Analysis Mode
            </Label>
            <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as AnalysisMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="smart">Smart Mode</TabsTrigger>
                <TabsTrigger value="pro">Pro Mode</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Company Search */}
          <div className="mb-6">
            <Label htmlFor="company-search" className="block text-sm font-medium text-foreground mb-2">
              Search Company
            </Label>
            <EnhancedCompanySearch
              onSelect={handleCompanySelect}
              placeholder="Type company name or symbol..."
            />
          </div>

          {/* Duration Selection */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-foreground mb-2">
              Analysis Duration
            </Label>
            <Select value={analysisDuration} onValueChange={(value) => setAnalysisDuration(value as AnalysisDuration)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1W">1 Week (Short-term)</SelectItem>
                <SelectItem value="1M">1 Month (Short-term)</SelectItem>
                <SelectItem value="3M">3 Months (Medium-term)</SelectItem>
                <SelectItem value="6M">6 Months (Medium-term)</SelectItem>
                <SelectItem value="1Y">1 Year (Long-term)</SelectItem>
                <SelectItem value="2Y">2 Years (Long-term)</SelectItem>
                <SelectItem value="5Y">5 Years (Long-term)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pro Mode Configuration */}
          {analysisMode === 'pro' && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Analysis Weights */}
                <Card className="card-glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <PieChart className="h-4 w-4" />
                      <span>Analysis Weights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm">Fundamental: {customWeights.fundamental}%</Label>
                      <Slider
                        value={[customWeights.fundamental]}
                        onValueChange={([value]) => setCustomWeights(prev => ({ ...prev, fundamental: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Technical: {customWeights.technical}%</Label>
                      <Slider
                        value={[customWeights.technical]}
                        onValueChange={([value]) => setCustomWeights(prev => ({ ...prev, technical: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Sentiment: {customWeights.sentiment}%</Label>
                      <Slider
                        value={[customWeights.sentiment]}
                        onValueChange={([value]) => setCustomWeights(prev => ({ ...prev, sentiment: value }))}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Indicators */}
                <Card className="card-glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Technical</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={technicalIndicators.priceAction.supportResistance}
                        onCheckedChange={(checked) => setTechnicalIndicators(prev => ({
                          ...prev,
                          priceAction: { ...prev.priceAction, supportResistance: checked }
                        }))}
                      />
                      <Label className="text-sm">Support/Resistance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={technicalIndicators.priceAction.swingHighsLows}
                        onCheckedChange={(checked) => setTechnicalIndicators(prev => ({
                          ...prev,
                          priceAction: { ...prev.priceAction, swingHighsLows: checked }
                        }))}
                      />
                      <Label className="text-sm">Swing Highs/Lows</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={technicalIndicators.priceAction.candlestickPatterns}
                        onCheckedChange={(checked) => setTechnicalIndicators(prev => ({
                          ...prev,
                          priceAction: { ...prev.priceAction, candlestickPatterns: checked }
                        }))}
                      />
                      <Label className="text-sm">Candlestick Patterns</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={technicalIndicators.priceAction.trendlines}
                        onCheckedChange={(checked) => setTechnicalIndicators(prev => ({
                          ...prev,
                          priceAction: { ...prev.priceAction, trendlines: checked }
                        }))}
                      />
                      <Label className="text-sm">Trendlines</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Fundamental Filters */}
                <Card className="card-glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Fundamental</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm">Min Market Cap (Billion): {fundamentalFilters.marketCapFloor / 1e9}</Label>
                      <Slider
                        value={[fundamentalFilters.marketCapFloor / 1e9]}
                        onValueChange={([value]) => setFundamentalFilters(prev => ({ ...prev, marketCapFloor: value * 1e9 }))}
                        max={1000}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Max Debt/Equity: {fundamentalFilters.debtToEquityMax}</Label>
                      <Slider
                        value={[fundamentalFilters.debtToEquityMax]}
                        onValueChange={([value]) => setFundamentalFilters(prev => ({ ...prev, debtToEquityMax: value }))}
                        max={5}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Min Dividend Yield: {fundamentalFilters.dividendMin}%</Label>
                      <Slider
                        value={[fundamentalFilters.dividendMin]}
                        onValueChange={([value]) => setFundamentalFilters(prev => ({ ...prev, dividendMin: value }))}
                        max={10}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sentiment Filters */}
              <Card className="card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Newspaper className="h-4 w-4" />
                    <span>Sentiment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm">News Lookback Window</Label>
                    <Select value={sentimentFilters.newsWindow} onValueChange={(value) => setSentimentFilters(prev => ({ ...prev, newsWindow: value as SentimentFilters['newsWindow'] }))}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="3d">Last 3 Days</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={sentimentFilters.socialMedia}
                      onCheckedChange={(checked) => setSentimentFilters(prev => ({ ...prev, socialMedia: checked }))}
                    />
                    <Label className="text-sm">Include Social Media Sentiment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={sentimentFilters.analystOpinions}
                      onCheckedChange={(checked) => setSentimentFilters(prev => ({ ...prev, analystOpinions: checked }))}
                    />
                    <Label className="text-sm">Include Analyst Opinions</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Button
            onClick={handleAnalysisSubmit}
            disabled={isLoading || !selectedCompany}
            className="w-full bg-gradient-to-r from-finance-primary to-finance-accent hover:from-finance-primary/90 hover:to-finance-accent/90 text-white text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>{loadingMessage}</span>
              </div>
            ) : (
              "Get Hybrid Analysis"
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analysisResult && (
            <div className="mt-8 space-y-8">
              <Separator />
              <h2 className="text-responsive-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary to-finance-accent text-center">
                Analysis Results for {analysisResult.companyName} ({analysisResult.symbol})
              </h2>

              {/* Recommendation */}
              <Card className="card-glass border-l-4 border-l-finance-success">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {analysisResult.recommendation.action === 'BUY' && <TrendingUp className="h-6 w-6 text-finance-success" />}
                    {analysisResult.recommendation.action === 'HOLD' && <Minus className="h-6 w-6 text-finance-warning" />}
                    {analysisResult.recommendation.action === 'SELL' && <TrendingDown className="h-6 w-6 text-finance-danger" />}
                    <span className="text-2xl font-bold text-foreground">
                      {analysisResult.recommendation.action}
                    </span>
                    <Badge variant="outline" className={`text-lg font-semibold ${
                      analysisResult.recommendation.confidence === 'HIGH' ? 'border-finance-success text-finance-success' :
                      analysisResult.recommendation.confidence === 'MEDIUM' ? 'border-finance-warning text-finance-warning' :
                      'border-finance-danger text-finance-danger'
                    }`}>
                      Confidence: {analysisResult.recommendation.confidence}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Overall Hybrid Score: {analysisResult.recommendation.score}/100
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={analysisResult.recommendation.score} className="w-full" />
                  <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                    {analysisResult.aiSummary}
                  </p>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-finance-primary" />
                      <span>Key Factors Supporting This Verdict:</span>
                    </h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {analysisResult.keyFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-finance-warning" />
                      <span>Important Risks & Considerations:</span>
                    </h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {analysisResult.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                  {analysisResult.nextCatalysts && analysisResult.nextCatalysts.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                        <Info className="h-5 w-5 text-finance-accent" />
                        <span>Upcoming Catalysts:</span>
                      </h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {analysisResult.nextCatalysts.map((catalyst, index) => (
                          <li key={index}>{catalyst}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live TradingView Chart */}
              <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card/50 p-2">
                <h3 className="text-xl font-bold text-foreground mb-2 px-4 pt-2">Live Chart</h3>
                <TradingViewChart
                  symbol={analysisResult.symbol}
                  height={400}
                />
                <div className="flex justify-between items-center px-4 pb-2 text-muted-foreground text-sm">
                  <span>Current Price: <span className="font-bold text-foreground">{analysisResult.currentPrice}</span></span>
                  <span>{analysisResult.priceContext}</span>
                </div>
              </div>

              {/* Detailed Analysis Panels (Pro Mode) - Coming Soon */}
              {analysisMode === 'pro' && analysisResult.detailedAnalysis && (
                <div className="space-y-6">
                  <Separator />
                  <h3 className="text-xl font-bold text-foreground">Detailed Analysis</h3>
                  <div className="text-center text-muted-foreground py-8">
                    <p>Detailed analysis panels will be available soon!</p>
                  </div>
                </div>
              )}

              {/* News Feed - Coming Soon */}
              <div className="text-center text-muted-foreground py-8">
                <p>Enhanced news feed will be available soon!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStockAnalysis; 