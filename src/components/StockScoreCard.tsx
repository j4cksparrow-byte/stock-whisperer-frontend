import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { Loader2, TrendingUp, TrendingDown, Minus, Activity, MessageSquare } from 'lucide-react';
import { stockScoringService } from '../services/scoringService';
import { AggregateResult } from '../types/stockTypes';
import { getScoreColor } from '../services/stockAggregator';
import { Company } from '../data/companies';
import { CircularScore } from './CircularScore';

interface StockScoreCardProps {
  company: Company | null;
  triggerAnalysis: boolean;
}

export const StockScoreCard = ({ company, triggerAnalysis }: StockScoreCardProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AggregateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company && triggerAnalysis) {
      handleAnalyze();
    }
  }, [company, triggerAnalysis]);

  const handleAnalyze = async () => {
    if (!company) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`🔍 Starting analysis for ${company.symbol}...`);
      
      const analysis = await stockScoringService.scoreStock(company.symbol);
      
      console.log(`✅ Analysis complete for ${company.symbol}:`, analysis);
      setResult(analysis);
      
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the right icon based on score
  const getScoreIcon = (score: number | null) => {
    if (score === null) return <Minus className="h-4 w-4 text-gray-500" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score >= 40) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Helper function to format scores consistently
  const formatScore = (score: number | null | undefined): string => {
    return score !== null && score !== undefined ? score.toFixed(1) : 'N/A';
  };

  // Helper function to get recommendation color
  const getRecommendationStyle = (label: string) => {
    const colors = {
      'Strong Buy': '#22c55e', // Green
      'Buy': '#84cc16',        // Light green
      'Hold': '#eab308',       // Yellow
      'Sell': '#f97316',       // Orange
      'Strong Sell': '#ef4444', // Red
      'Insufficient Data': '#6b7280' // Gray
    };
    return { backgroundColor: colors[label as keyof typeof colors] || '#6b7280' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          📊 Stock Score Aggregator
        </h3>
        <p className="text-gray-400 mt-2">
          Comprehensive analysis combining fundamentals, technicals, and sentiment
        </p>
      </div>
      
      {/* Loading Progress */}
      {loading && (
        <div className="mt-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <div className="text-sm text-gray-400 space-y-1">
            <div>🔍 Fetching company data...</div>
            <div>📊 Calculating fundamental scores...</div>
            <div>📈 Analyzing technical indicators...</div>
            <div>📰 Processing sentiment data...</div>
            <div>🎯 Aggregating final score...</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertDescription className="text-red-300">
            ❌ {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Main Score Section */}
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Company Info and Circular Score */}
              <div className="text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{result.ticker}</h2>
                  <p className="text-muted-foreground">Stock Analysis Score</p>
                </div>
                
                <div className="flex justify-center md:justify-start">
                  <CircularScore 
                    score={result.aggregateScore} 
                    label={`Verdict: ${result.label}`}
                    size={140}
                  />
                </div>

                {/* Weights Display */}
                {result.weights && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Weights</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Technical</div>
                        <div className="text-muted-foreground">{result.weights.technical}%</div>
                      </div>
                      <div>
                        <div className="font-medium">Fundamental</div>
                        <div className="text-muted-foreground">{result.weights.fundamental}%</div>
                      </div>
                      <div>
                        <div className="font-medium">Sentiment</div>
                        <div className="text-muted-foreground">{result.weights.sentiment}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Individual Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-1">TECHNICAL</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatScore(result.scores.technicals?.score)}
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-1">FUNDAMENTAL</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatScore(result.scores.fundamentals?.score)}
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-1">SENTIMENT</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatScore(result.scores.sentiment?.score)}
                  </div>
                </div>
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {result.flags.map((flag) => (
                  <Badge key={flag} variant="outline" className="text-yellow-600 border-yellow-600">
                    ⚠️ {flag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Reasons */}
            {result.reasons && result.reasons.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Insights</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {result.reasons.slice(0, 6).map((reason, idx) => (
                    <div key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Detailed Breakdown */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Fundamentals */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.weights?.fundamental}% Weight
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatScore(result.scores.fundamentals?.score)}
                  </div>
                </div>
                
                {result.scores.fundamentals?.subscores && (
                  <div className="space-y-2">
                    {Object.entries(result.scores.fundamentals.subscores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">{formatScore(value as number)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.scores.fundamentals?.notes && result.scores.fundamentals.notes.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-3">
                    {result.scores.fundamentals.notes.slice(0, 2).map((note, idx) => (
                      <div key={idx}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Technicals */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Technicals</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.weights?.technical}% Weight
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatScore(result.scores.technicals?.score)}
                  </div>
                </div>
                
                {result.scores.technicals?.subscores && (
                  <div className="space-y-2">
                    {Object.entries(result.scores.technicals.subscores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="font-medium">{formatScore(value as number)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.scores.technicals?.notes && result.scores.technicals.notes.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-3">
                    {result.scores.technicals.notes.slice(0, 2).map((note, idx) => (
                      <div key={idx}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Sentiment */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Sentiment</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.weights?.sentiment}% Weight
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatScore(result.scores.sentiment?.score)}
                  </div>
                </div>
                
                {result.scores.sentiment?.subscores && (
                  <div className="space-y-2">
                    {Object.entries(result.scores.sentiment.subscores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">{formatScore(value as number)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.scores.sentiment?.notes && result.scores.sentiment.notes.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-3">
                    {result.scores.sentiment.notes.slice(0, 2).map((note, idx) => (
                      <div key={idx}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Data Sources Info */}
          <Card className="p-4">
            <div className="text-center text-xs text-muted-foreground">
              <div className="mb-1">
                📡 Data: {result.dataSources.provider} • 
                {result.dataSources.requests.length} API calls • 
                Updated: {new Date(result.asOf).toLocaleString()}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
