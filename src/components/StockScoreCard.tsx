import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, TrendingUp, TrendingDown, Minus, Target, Activity, MessageSquare } from 'lucide-react';
import { EnhancedStockService } from '../services/enhancedStockService';
import type { StockAnalysisResponse, StockAnalysisRequest } from '../types/stockAnalysis';

// Simple scoring result interface
interface SimpleScoreResult {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  aggregateScore: number;
  recommendation: string;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
}

export const StockScoreCard = () => {
  // State to manage the component
  const [ticker, setTicker] = useState(''); // User input for stock symbol
  const [loading, setLoading] = useState(false); // Loading state during API calls
  const [result, setResult] = useState<SimpleScoreResult | null>(null); // Analysis result
  const [error, setError] = useState<string | null>(null); // Error messages

  // Function to analyze a stock when user clicks the button
  const handleAnalyze = async () => {
    // Don't proceed if no ticker is entered
    if (!ticker.trim()) return;
    
    // Set loading state and clear previous results
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`🔍 Starting analysis for ${ticker.toUpperCase()}...`);
      
      // Use enhanced stock service to get market data and company info
      const marketData = await EnhancedStockService.getMarketData(ticker.toUpperCase());
      const companyInfo = await EnhancedStockService.getCompanyInfo(ticker.toUpperCase());
      
      // Convert enhanced analysis to simple score format
      const simpleResult: SimpleScoreResult = {
        symbol: marketData.symbol,
        companyName: companyInfo.name || marketData.symbol,
        currentPrice: marketData.price,
        priceChange: marketData.change,
        priceChangePercent: marketData.changePercent,
        // Create mock scores based on available data (replace with actual scoring logic later)
        aggregateScore: Math.round((Math.random() * 40) + 30), // Mock score 30-70
        recommendation: marketData.price > 100 ? 'BUY' : marketData.price > 50 ? 'HOLD' : 'SELL',
        technicalScore: Math.round((Math.random() * 30) + 40),
        fundamentalScore: Math.round((Math.random() * 30) + 35),
        sentimentScore: Math.round((Math.random() * 30) + 45)
      };
      
      console.log(`✅ Analysis complete for ${ticker.toUpperCase()}:`, simpleResult);
      setResult(simpleResult);
      
    } catch (err) {
      // Handle any errors that occurred during analysis
      console.error('❌ Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      // Always stop loading regardless of success or failure
      setLoading(false);
    }
  };

  // Helper function to get the right icon based on score
  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score >= 40) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Helper function to format scores consistently
  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22c55e'; // green
    if (score >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  // Helper function to get recommendation color
  const getRecommendationStyle = (label: string) => {
    const colors = {
      'BUY': '#22c55e', // Green
      'HOLD': '#eab308', // Yellow
      'SELL': '#ef4444', // Red
    };
    return { backgroundColor: colors[label as keyof typeof colors] || '#6b7280' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card with Input */}
      <div className="glass-card rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            📊 Stock Score Aggregator
          </h2>
          <p className="text-gray-400 mt-2">
            Comprehensive analysis combining fundamentals, technicals, and sentiment
          </p>
        </div>
        
        {/* Input Section */}
        <div className="flex gap-3 max-w-md mx-auto">
          <input
            placeholder="Enter ticker symbol (e.g., AAPL, TSLA)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !ticker.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
        
        {/* Loading Progress */}
        {loading && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400 space-y-1">
              <div>🔍 Fetching company data...</div>
              <div>📊 Calculating fundamental scores...</div>
              <div>📈 Analyzing technical indicators...</div>
              <div>📰 Processing sentiment data...</div>
              <div>🎯 Aggregating final score...</div>
            </div>
          </div>
        )}
      </div>

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
                {result.symbol} - Overall Score
              </h3>
              <div 
                className="px-4 py-2 rounded-full text-white font-bold text-sm"
                style={getRecommendationStyle(result.recommendation)}
              >
                {result.recommendation}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Aggregate Score */}
              <div className="text-center">
                <div className="text-6xl font-bold" style={{ color: getScoreColor(result.aggregateScore) }}>
                  {formatScore(result.aggregateScore)}
                </div>
                <div className="text-sm text-gray-400 mt-2">Overall Score</div>
              </div>

              {/* Individual Pillar Scores */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-gray-300">Fundamentals</span>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {formatScore(result.fundamentalScore)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Weight: 40%
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-gray-300">Technical</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatScore(result.technicalScore)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Weight: 30%
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-gray-300">Sentiment</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {formatScore(result.sentimentScore)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Weight: 30%
                </div>
              </div>
            </div>
          </div>

          {/* Simple Analysis Summary */}
          <div className="glass-card rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Analysis Summary</h4>
            <div className="text-gray-300">
              <p className="mb-2">
                <strong>{result.symbol}</strong> ({result.companyName}) is currently trading at <strong>${result.currentPrice.toFixed(2)}</strong>.
              </p>
              <p className="mb-2">
                Price change: <span className={result.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {result.priceChange >= 0 ? '+' : ''}{result.priceChange.toFixed(2)} ({result.priceChangePercent >= 0 ? '+' : ''}{result.priceChangePercent.toFixed(2)}%)
                </span>
              </p>
              <p>
                Our analysis suggests a <strong>{result.recommendation}</strong> recommendation with an overall score of <strong>{result.aggregateScore}</strong>/100.
                This is based on technical analysis ({result.technicalScore}), fundamental analysis ({result.fundamentalScore}), 
                and market sentiment ({result.sentimentScore}).
              </p>
            </div>
          </div>

          {/* Data Sources Info */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Analysis completed at {new Date().toLocaleString()} • Mock data for development
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockScoreCard;
