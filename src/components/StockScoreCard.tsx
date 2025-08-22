import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, TrendingUp, TrendingDown, Minus, Activity, MessageSquare } from 'lucide-react';
import { stockScoringService } from '../services/scoringService';
import { AggregateResult } from '../types/stockTypes';
import { getScoreColor } from '../services/stockAggregator';
import { Company } from '../data/companies';

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
        <div className="grid gap-6">
          {/* Overall Score Card */}
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">
                {result.ticker} - Overall Score
              </h3>
              <div 
                className="px-4 py-2 rounded-full text-white font-bold text-sm"
                style={getRecommendationStyle(result.label)}
              >
                {result.label}
              </div>
            </div>
            
            <div className="text-center space-y-4">
              {/* Main Score Display */}
              <div>
                <div 
                  className="text-6xl font-bold"
                  style={{ color: result.aggregateScore ? getScoreColor(result.aggregateScore) : '#6b7280' }}
                >
                  {formatScore(result.aggregateScore)}
                </div>
                <div className="text-gray-400 text-lg">out of 100</div>
              </div>
              
              {/* Score Bar */}
              {result.aggregateScore && (
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${result.aggregateScore}%`,
                      backgroundColor: getScoreColor(result.aggregateScore)
                    }}
                  />
                </div>
              )}

              {/* Flags */}
              {result.flags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {result.flags.map((flag) => (
                    <span 
                      key={flag} 
                      className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/50 rounded-full text-yellow-300 text-xs"
                    >
                      ⚠️ {flag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Analysis completed on {new Date(result.asOf).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Pillar Scores */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Fundamentals */}
            <div className="glass-card rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Fundamentals</h4>
                  <p className="text-sm text-gray-400">Weight: 50%</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {formatScore(result.scores.fundamentals?.score || null)}
                  </div>
                </div>
                
                {result.scores.fundamentals?.subscores && (
                  <div className="space-y-2 text-sm">
                    {Object.entries(result.scores.fundamentals.subscores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-gray-300">
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-mono">{formatScore(value as number)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.scores.fundamentals?.notes && result.scores.fundamentals.notes.length > 0 && (
                  <div className="text-xs text-gray-400 space-y-1 mt-3">
                    {result.scores.fundamentals.notes.slice(0, 3).map((note, idx) => (
                      <div key={idx}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Technicals */}
            <div className="glass-card rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Technicals</h4>
                  <p className="text-sm text-gray-400">Weight: 30%</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {formatScore(result.scores.technicals?.score || null)}
                  </div>
                </div>
                
                {result.scores.technicals?.subscores && (
                  <div className="space-y-2 text-sm">
                    {Object.entries(result.scores.technicals.subscores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-gray-300">
                        <span className="capitalize">{key}</span>
                        <span className="font-mono">{formatScore(value as number)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.scores.technicals?.notes && result.scores.technicals.notes.length > 0 && (
                  <div className="text-xs text-gray-400 space-y-1 mt-3">
                    {result.scores.technicals.notes.slice(0, 3).map((note, idx) => (
                      <div key={idx}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sentiment */}
            <div className="glass-card rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Sentiment</h4>
                  <p className="text-sm text-gray-400">Weight: 20%</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {formatScore(result.scores.sentiment?.score || null)}
                  </div>
                </div>
                
                {result.scores.sentiment?.subscores && (
                  <div className="space-y-2 text-sm">
                    {Object.entries(result.scores.sentiment.subscores).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-gray-300">
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-mono">{formatScore(value as number)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {result.scores.sentiment?.notes && result.scores.sentiment.notes.length > 0 && (
                  <div className="text-xs text-gray-400 space-y-1 mt-3">
                    {result.scores.sentiment.notes.slice(0, 3).map((note, idx) => (
                      <div key={idx}>• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Sources Info */}
          <div className="glass-card rounded-lg p-4">
            <div className="text-center text-xs text-gray-500">
              <div className="mb-1">
                📡 Data provided by {result.dataSources.provider} • 
                {result.dataSources.requests.length} API calls made
              </div>
              <div>
                🔗 Endpoints: {result.dataSources.requests.slice(0, 5).join(', ')}
                {result.dataSources.requests.length > 5 && ` +${result.dataSources.requests.length - 5} more`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
