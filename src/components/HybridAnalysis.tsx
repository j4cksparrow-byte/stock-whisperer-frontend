import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Brain, TrendingUp, Calculator, Zap, Settings, BarChart3, PieChart, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

// Types for the hybrid analysis
type AnalysisMode = 'smart' | 'pro';
type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y';

interface AnalysisWeights {
  fundamental: number;
  technical: number;
  sentiment: number;
}

interface HybridAnalysisResult {
  mode: AnalysisMode;
  symbol: string;
  timeframe: string;
  timestamp: string;
  fundamental: {
    score: number;
    weight: string;
    recommendation: string;
    breakdown: any;
  };
  technical: {
    score: number;
    weight: string;
    indicators: any;
  };
  sentiment: {
    score: number;
    weight: string;
    summary: string;
  };
  overall: {
    score: number;
    recommendation: string;
  };
  aiInsights: {
    summary: string;
  };
  enhanced?: {
    aggregateScore: number;
    recommendation: string;
    confidence: number;
    fundamental: any;
    technical: any;
    sentiment: any;
  };
  insights?: {
    keyStrengths: string[];
    riskFactors: string[];
    confidenceLevel: string;
    recommendation: string;
  };
}

interface HybridAnalysisProps {
  symbol: string;
  onAnalysisComplete?: (result: HybridAnalysisResult) => void;
}

const HybridAnalysis: React.FC<HybridAnalysisProps> = ({ symbol, onAnalysisComplete }) => {
  // State management
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('smart');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('3M');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<HybridAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Weights configuration for Pro mode
  const [weights, setWeights] = useState<AnalysisWeights>({
    fundamental: 40,
    technical: 35,
    sentiment: 25
  });

  // Preset weight configurations
  const weightPresets = {
    balanced: { fundamental: 40, technical: 35, sentiment: 25 },
    conservative: { fundamental: 50, technical: 30, sentiment: 20 },
    technical: { fundamental: 20, technical: 60, sentiment: 20 },
    sentiment: { fundamental: 30, technical: 25, sentiment: 45 }
  };

  // Time frame options
  const timeFrameOptions: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];

  // Analysis mode descriptions
  const modeDescriptions = {
    smart: {
      title: 'Smart Analysis',
      description: 'AI-powered fundamental analysis with easy-to-understand insights',
      icon: Brain,
      features: ['Fundamental Analysis', 'AI Summary', 'Investment Recommendation', 'Risk Assessment']
    },
    pro: {
      title: 'Pro Analysis',
      description: 'Comprehensive multi-factor analysis with customizable weights',
      icon: TrendingUp,
      features: ['Fundamental Analysis', 'Technical Indicators', 'Sentiment Analysis', 'Custom Weights', 'Enhanced Scoring', 'Detailed Breakdown']
    }
  };

  // Enhanced analysis with multi-source data integration
  const performAnalysis = async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = '';
      let params = new URLSearchParams({
        timeframe: timeFrame.toLowerCase(),
        mode: analysisMode === 'smart' ? 'normal' : 'advanced'
      });

      // Enhanced API selection based on analysis mode
      if (analysisMode === 'pro') {
        // Add weights for Pro mode
        params.append('fundamental', weights.fundamental.toString());
        params.append('technical', weights.technical.toString());
        params.append('sentiment', weights.sentiment.toString());
        
        // Use enhanced analysis endpoint with multi-source data
        endpoint = `/api/stocks/enhanced-analysis/${symbol}?${params}`;
      } else {
        // Use regular analysis endpoint for Smart mode
        endpoint = `/api/stocks/analysis/${symbol}?${params}`;
      }

      // Parallel API calls for comprehensive analysis
      const analysisPromise = fetch(`http://localhost:3001${endpoint}`);
      
      // Additional API calls for enhanced data (Pro mode only)
      const additionalPromises = analysisMode === 'pro' ? [
        // Technical chart analysis
        fetch(`http://localhost:3001/api/stocks/chart-analysis/${symbol}?${params}`).catch(e => null),
        // Data sources status for transparency
        fetch(`http://localhost:3001/api/stocks/data-sources/status`).catch(e => null)
      ] : [];

      const [analysisResponse, ...additionalResponses] = await Promise.all([
        analysisPromise,
        ...additionalPromises
      ]);
      
      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${analysisResponse.statusText}`);
      }

      const analysisData = await analysisResponse.json();
      
      if (analysisData.status === 'success') {
        let enhancedResult = analysisData.analysis;

        // Process additional data for Pro mode
        if (analysisMode === 'pro' && additionalResponses.length > 0) {
          try {
            // Add technical chart insights if available
            if (additionalResponses[0]) {
              const chartData = await additionalResponses[0].json();
              if (chartData.status === 'success') {
                enhancedResult.chartAnalysis = chartData.analysis;
              }
            }

            // Add data source information
            if (additionalResponses[1]) {
              const sourcesData = await additionalResponses[1].json();
              if (sourcesData.status === 'success') {
                enhancedResult.dataSources = sourcesData.dataSources;
              }
            }
          } catch (additionalError) {
            console.warn('Additional data fetch failed:', additionalError);
          }
        }

        setAnalysisResult(enhancedResult);
        onAnalysisComplete?.(enhancedResult);
      } else {
        throw new Error(analysisData.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Update weights ensuring they sum to 100
  const updateWeight = (type: keyof AnalysisWeights, value: number) => {
    const newWeights = { ...weights };
    newWeights[type] = value;
    
    // Adjust other weights proportionally
    const remaining = 100 - value;
    const otherTypes = Object.keys(newWeights).filter(k => k !== type) as (keyof AnalysisWeights)[];
    const currentOtherTotal = otherTypes.reduce((sum, key) => sum + newWeights[key], 0);
    
    if (currentOtherTotal > 0) {
      otherTypes.forEach(key => {
        newWeights[key] = Math.round((newWeights[key] / currentOtherTotal) * remaining);
      });
    }
    
    setWeights(newWeights);
  };

  // Apply weight preset
  const applyPreset = (presetName: keyof typeof weightPresets) => {
    setWeights(weightPresets[presetName]);
  };

  // Get recommendation color
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'buy':
      case 'strong buy':
        return 'text-green-600 bg-green-100';
      case 'hold':
        return 'text-yellow-600 bg-yellow-100';
      case 'sell':
      case 'strong sell':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Multi-Source Banner */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Enhanced Multi-Source Analysis</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-blue-700">
                <Activity className="h-4 w-4" />
                <span>6+ Data Sources</span>
              </div>
              <div className="flex items-center gap-1 text-blue-700">
                <Zap className="h-4 w-4" />
                <span>1000+ Daily Requests</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Powered by Twelve Data, Polygon.io, Finnhub, FMP, and more for <strong>10x reliability</strong> and comprehensive insights.
          </p>
        </CardContent>
      </Card>

      {/* Analysis Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Hybrid Stock Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as AnalysisMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="smart" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Smart Analysis
              </TabsTrigger>
              <TabsTrigger value="pro" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pro Analysis
              </TabsTrigger>
            </TabsList>

            {/* Mode Descriptions */}
            {Object.entries(modeDescriptions).map(([mode, config]) => (
              <TabsContent key={mode} value={mode} className="mt-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <config.icon className="w-8 h-8 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{config.title}</h3>
                    <p className="text-gray-600 mt-1">{config.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {config.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Analysis Configuration
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              {showAdvancedSettings ? 'Hide' : 'Show'} Settings
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time Frame Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Time Frame</label>
            <div className="flex flex-wrap gap-2">
              {timeFrameOptions.map((tf) => (
                <Button
                  key={tf}
                  variant={timeFrame === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFrame(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>

          {/* Pro Mode Weight Configuration */}
          {analysisMode === 'pro' && showAdvancedSettings && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Analysis Weights (Pro Mode)
              </h4>
              
              {/* Weight Presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(weightPresets).map(([name, preset]) => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(name as keyof typeof weightPresets)}
                      className="capitalize"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Weight Sliders */}
              <div className="space-y-4">
                {Object.entries(weights).map(([type, value]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium capitalize">{type} Analysis</label>
                      <span className="text-sm text-gray-600">{value}%</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(values) => updateWeight(type as keyof AnalysisWeights, values[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
                <div className="text-xs text-gray-500">
                  Total: {Object.values(weights).reduce((sum, val) => sum + val, 0)}%
                </div>
              </div>
            </div>
          )}

          {/* Analysis Button */}
          <Button
            onClick={performAnalysis}
            disabled={isLoading || !symbol}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Analyzing {symbol}...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start {analysisMode === 'smart' ? 'Smart' : 'Pro'} Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <strong>Analysis Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Analysis Results for {analysisResult.symbol}
              </div>
              <Badge variant="outline" className="capitalize">
                {analysisResult.mode} Mode
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Overall Score */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className={cn("text-3xl font-bold", getScoreColor(analysisResult.overall.score))}>
                          {analysisResult.overall.score}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                        <Badge className={cn("mt-2", getRecommendationColor(analysisResult.overall.recommendation))}>
                          {analysisResult.overall.recommendation}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Score (Pro Mode) */}
                  {analysisResult.enhanced && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className={cn("text-3xl font-bold", getScoreColor(analysisResult.enhanced.aggregateScore))}>
                            {analysisResult.enhanced.aggregateScore}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Enhanced Score</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(analysisResult.enhanced.confidence * 100)}% Confidence
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Metrics */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Timeframe:</span>
                          <span className="text-sm font-medium">{analysisResult.timeframe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Analysis Date:</span>
                          <span className="text-sm font-medium">
                            {new Date(analysisResult.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {analysisResult.insights && (
                          <div className="flex justify-between">
                            <span className="text-sm">Confidence:</span>
                            <span className="text-sm font-medium">{analysisResult.insights.confidenceLevel}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Breakdown Tab */}
              <TabsContent value="breakdown" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {/* Fundamental Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Fundamental Analysis
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{analysisResult.fundamental.weight}</span>
                          <Badge variant="outline">{analysisResult.fundamental.score}</Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        Recommendation: <span className="font-medium">{analysisResult.fundamental.recommendation}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Analysis (Pro Mode) */}
                  {analysisResult.mode === 'advanced' && analysisResult.technical && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          Technical Analysis
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{analysisResult.technical.weight}</span>
                            <Badge variant="outline">{analysisResult.technical.score}</Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600">
                          Indicators: {Object.keys(analysisResult.technical.indicators || {}).length} calculated
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sentiment Analysis (Pro Mode) */}
                  {analysisResult.mode === 'advanced' && analysisResult.sentiment && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          Sentiment Analysis
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{analysisResult.sentiment.weight}</span>
                            <Badge variant="outline">{analysisResult.sentiment.score}</Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600">
                          {analysisResult.sentiment.summary}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="insights" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI-Generated Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {analysisResult.aiInsights.summary}
                        </div>
                      </div>

                      {/* Enhanced Insights (Pro Mode) */}
                      {analysisResult.insights && (
                        <div className="mt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base text-green-700">Key Strengths</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-1">
                                  {analysisResult.insights.keyStrengths.map((strength, index) => (
                                    <li key={index} className="text-sm text-gray-700">• {strength}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base text-red-700">Risk Factors</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-1">
                                  {analysisResult.insights.riskFactors.map((risk, index) => (
                                    <li key={index} className="text-sm text-gray-700">• {risk}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Technical Chart Analysis (Pro Mode) */}
                  {analysisResult.chartAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Technical Chart Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Chart Patterns</h4>
                            {analysisResult.chartAnalysis.technical?.indicators?.patterns ? (
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.chartAnalysis.technical.indicators.patterns.map((pattern: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {pattern.pattern} ({pattern.confidence}%)
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">No significant patterns detected</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Technical Score</h4>
                            <div className={cn("text-2xl font-bold", getScoreColor(analysisResult.chartAnalysis.technical?.score || 0))}>
                              {analysisResult.chartAnalysis.technical?.score || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Multi-Source Data Status (Pro Mode) */}
                  {analysisResult.dataSources && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5" />
                          Data Source Reliability
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {Object.entries(analysisResult.dataSources).map(([source, status]: [string, any]) => (
                            <div key={source} className="text-center">
                              <div className={cn(
                                "w-3 h-3 rounded-full mx-auto mb-1",
                                status.available ? "bg-green-500" : "bg-red-500"
                              )} />
                              <div className="text-xs font-medium capitalize">{source}</div>
                              <div className="text-xs text-gray-500">
                                {status.available ? `${status.remaining}/${status.daily}` : 'Offline'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-600">
                          <strong>10x More Reliable:</strong> Multi-source integration provides backup when primary APIs are unavailable.
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HybridAnalysis;
