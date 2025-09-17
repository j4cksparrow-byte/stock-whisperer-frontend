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

// Scoring functions
const calculateTechnicalScore = (marketData: any, historicalData: any[], technicalIndicators: any): number => {
  let score = 50; // Base score
  
  try {
    // Price momentum (30% weight)
    const changePercent = marketData.changePercent || 0;
    if (changePercent > 5) score += 15;
    else if (changePercent > 2) score += 10;
    else if (changePercent > 0) score += 5;
    else if (changePercent > -2) score -= 5;
    else if (changePercent > -5) score -= 10;
    else score -= 15;
    
    // Volume analysis (20% weight)
    if (marketData.volume && marketData.avgVolume) {
      const volumeRatio = marketData.volume / marketData.avgVolume;
      if (volumeRatio > 2) score += 10;
      else if (volumeRatio > 1.5) score += 5;
      else if (volumeRatio < 0.5) score -= 5;
    }
    
    // Volatility analysis (20% weight)
    if (historicalData && historicalData.length > 20) {
      const prices = historicalData.slice(-20).map(d => d.close);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const volatility = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length) / avgPrice;
      
      if (volatility < 0.02) score += 10; // Low volatility is good
      else if (volatility > 0.05) score -= 10; // High volatility is risky
    }
    
    // Moving averages (30% weight)
    if (technicalIndicators) {
      if (technicalIndicators.sma20 && technicalIndicators.sma50) {
        if (marketData.price > technicalIndicators.sma20 && technicalIndicators.sma20 > technicalIndicators.sma50) {
          score += 15; // Bullish trend
        } else if (marketData.price < technicalIndicators.sma20 && technicalIndicators.sma20 < technicalIndicators.sma50) {
          score -= 15; // Bearish trend
        }
      }
    }
    
  } catch (error) {
    console.warn('Technical score calculation error:', error);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const calculateFundamentalScore = (companyInfo: any, fundamentalMetrics: any): number => {
  let score = 50; // Base score
  
  try {
    // Market cap analysis (25% weight)
    if (companyInfo.marketCap) {
      if (companyInfo.marketCap > 100e9) score += 12; // Large cap
      else if (companyInfo.marketCap > 10e9) score += 8; // Mid cap
      else if (companyInfo.marketCap > 1e9) score += 4; // Small cap
      else score -= 5; // Micro cap (riskier)
    }
    
    // Sector stability (15% weight)
    const stableSectors = ['Healthcare', 'Consumer Staples', 'Utilities'];
    const growthSectors = ['Technology', 'Consumer Discretionary'];
    if (stableSectors.includes(companyInfo.sector)) score += 8;
    else if (growthSectors.includes(companyInfo.sector)) score += 6;
    
    // Company maturity (10% weight)
    const currentYear = new Date().getFullYear();
    const companyAge = currentYear - (companyInfo.founded || currentYear - 10);
    if (companyAge > 50) score += 5;
    else if (companyAge > 20) score += 3;
    else if (companyAge < 5) score -= 3;
    
    // Financial metrics (50% weight)
    if (fundamentalMetrics) {
      // P/E ratio
      if (fundamentalMetrics.peRatio) {
        if (fundamentalMetrics.peRatio > 5 && fundamentalMetrics.peRatio < 20) score += 10;
        else if (fundamentalMetrics.peRatio < 30) score += 5;
        else if (fundamentalMetrics.peRatio > 50) score -= 10;
      }
      
      // Debt to equity
      if (fundamentalMetrics.debtToEquity !== undefined) {
        if (fundamentalMetrics.debtToEquity < 0.3) score += 8;
        else if (fundamentalMetrics.debtToEquity < 0.6) score += 4;
        else if (fundamentalMetrics.debtToEquity > 1.5) score -= 8;
      }
      
      // Revenue growth
      if (fundamentalMetrics.revenueGrowth !== undefined) {
        if (fundamentalMetrics.revenueGrowth > 0.2) score += 12;
        else if (fundamentalMetrics.revenueGrowth > 0.1) score += 8;
        else if (fundamentalMetrics.revenueGrowth > 0) score += 4;
        else score -= 8;
      }
    }
    
  } catch (error) {
    console.warn('Fundamental score calculation error:', error);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const calculateSentimentScore = (newsItems: any[]): number => {
  let score = 50; // Base score
  
  try {
    if (!newsItems || newsItems.length === 0) {
      return 50; // Neutral if no news
    }
    
    let totalSentiment = 0;
    let sentimentCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    
    newsItems.forEach(item => {
      if (item.sentiment !== undefined) {
        totalSentiment += item.sentiment;
        sentimentCount++;
        
        if (item.sentiment > 0.1) positiveCount++;
        else if (item.sentiment < -0.1) negativeCount++;
      }
      
      // Analyze headlines for key sentiment words
      const headline = (item.title || '').toLowerCase();
      const positiveWords = ['buy', 'bullish', 'upgrade', 'growth', 'profit', 'beat', 'strong', 'rise', 'gain'];
      const negativeWords = ['sell', 'bearish', 'downgrade', 'loss', 'miss', 'weak', 'fall', 'drop', 'decline'];
      
      positiveWords.forEach(word => {
        if (headline.includes(word)) score += 2;
      });
      
      negativeWords.forEach(word => {
        if (headline.includes(word)) score -= 2;
      });
    });
    
    // Calculate average sentiment
    if (sentimentCount > 0) {
      const avgSentiment = totalSentiment / sentimentCount;
      score += avgSentiment * 30; // Scale sentiment to score impact
    }
    
    // Sentiment distribution
    const totalNews = newsItems.length;
    if (totalNews > 0) {
      const positiveRatio = positiveCount / totalNews;
      const negativeRatio = negativeCount / totalNews;
      
      if (positiveRatio > 0.6) score += 15;
      else if (positiveRatio > 0.4) score += 5;
      
      if (negativeRatio > 0.6) score -= 15;
      else if (negativeRatio > 0.4) score -= 5;
    }
    
  } catch (error) {
    console.warn('Sentiment score calculation error:', error);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const getRecommendation = (aggregateScore: number): string => {
  if (aggregateScore >= 80) return 'STRONG BUY';
  if (aggregateScore >= 70) return 'BUY';
  if (aggregateScore >= 60) return 'MODERATE BUY';
  if (aggregateScore >= 40) return 'HOLD';
  if (aggregateScore >= 30) return 'MODERATE SELL';
  if (aggregateScore >= 20) return 'SELL';
  return 'STRONG SELL';
};

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
      
      // Use enhanced stock service to get comprehensive data
      const marketData = await EnhancedStockService.getMarketData(ticker.toUpperCase());
      const companyInfo = await EnhancedStockService.getCompanyInfo(ticker.toUpperCase());
      const historicalData = await EnhancedStockService.getHistoricalData(ticker.toUpperCase(), '3M');
      const technicalIndicators = await EnhancedStockService.getTechnicalIndicators(ticker.toUpperCase());
      const fundamentalMetrics = await EnhancedStockService.getFundamentalMetrics(ticker.toUpperCase());
      const newsItems = await EnhancedStockService.getNewsAndSentiment(ticker.toUpperCase(), 7);
      
      // Calculate actual scores based on real data
      const technicalScore = calculateTechnicalScore(marketData, historicalData, technicalIndicators);
      const fundamentalScore = calculateFundamentalScore(companyInfo, fundamentalMetrics);
      const sentimentScore = calculateSentimentScore(newsItems);
      
      // Calculate weighted aggregate score
      const weights = { technical: 0.3, fundamental: 0.4, sentiment: 0.3 };
      const aggregateScore = Math.round(
        (technicalScore * weights.technical) +
        (fundamentalScore * weights.fundamental) +
        (sentimentScore * weights.sentiment)
      );
      
      // Determine recommendation based on aggregate score
      const recommendation = getRecommendation(aggregateScore);
      
      // Convert enhanced analysis to simple score format
      const simpleResult: SimpleScoreResult = {
        symbol: marketData.symbol,
        companyName: companyInfo.name || marketData.symbol,
        currentPrice: marketData.price,
        priceChange: marketData.change,
        priceChangePercent: marketData.changePercent,
        aggregateScore: aggregateScore,
        recommendation: recommendation,
        technicalScore: technicalScore,
        fundamentalScore: fundamentalScore,
        sentimentScore: sentimentScore
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
      'STRONG BUY': '#16a34a', // Dark Green
      'BUY': '#22c55e', // Green
      'MODERATE BUY': '#65a30d', // Light Green
      'HOLD': '#eab308', // Yellow
      'MODERATE SELL': '#f97316', // Orange
      'SELL': '#ef4444', // Red
      'STRONG SELL': '#dc2626', // Dark Red
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
