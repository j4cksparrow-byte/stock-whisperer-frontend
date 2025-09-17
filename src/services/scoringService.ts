import { EnhancedStockService } from './enhancedStockService';
import { calculateFundamentalScore } from './fundamentalsScoring';
import { technicalsScoring } from './technicalsScoring';
import { sentimentScoring } from './sentimentScoring';
import { aggregateScores } from './stockAggregator';
import type { 
  StockAnalysisResponse,
  CompanyInfo,
  MarketData,
  HistoricalData,
  NewsItem 
} from '../types/stockAnalysis';

// Types for scoring results
export interface ScoreBreakdown {
  score: number;
  confidence: number;
  details: string[];
  flags: string[];
}

export interface AggregateResult {
  ticker: string;
  asOf: string;
  aggregateScore: number;
  label: string;
  confidence: number;
  scores: {
    fundamentals: ScoreBreakdown;
    technicals: ScoreBreakdown;
    sentiment: ScoreBreakdown;
  };
  weights: {
    fundamental: number;
    technical: number;
    sentiment: number;
  };
  reasons: string[];
  flags: string[];
  dataSources: {
    provider: string;
    requests: string[];
  };
}

export interface ScoringWeights {
  fundamental: number;
  technical: number;
  sentiment: number;
}

/**
 * Main service class for stock scoring and analysis
 */
export class StockScoringService {
  private defaultWeights: ScoringWeights = {
    fundamental: 0.4,
    technical: 0.3,
    sentiment: 0.3
  };

  /**
   * Score a single stock with comprehensive analysis
   */
  async scoreStock(
    ticker: string, 
    customWeights?: Partial<ScoringWeights>
  ): Promise<AggregateResult> {
    console.log(`🎯 Starting comprehensive scoring for ${ticker}...`);
    
    const weights = { ...this.defaultWeights, ...customWeights };
    const timestamp = new Date().toISOString();
    
    try {
      // Gather all required data
      console.log(`📊 Fetching market data for ${ticker}...`);
      const marketData = await EnhancedStockService.getMarketData(ticker);
      
      console.log(`🏢 Fetching company information for ${ticker}...`);
      const companyInfo = await EnhancedStockService.getCompanyInfo(ticker);
      
      console.log(`📈 Fetching historical data for ${ticker}...`);
      const historicalData = await EnhancedStockService.getHistoricalData(ticker, '6M');
      
      console.log(`📰 Fetching news and sentiment for ${ticker}...`);
      const newsItems = await EnhancedStockService.getNewsAndSentiment(ticker, 14);
      
      console.log(`⚙️ Fetching technical indicators for ${ticker}...`);
      const technicalIndicators = await EnhancedStockService.getTechnicalIndicators(ticker);
      
      console.log(`💰 Fetching fundamental metrics for ${ticker}...`);
      const fundamentalMetrics = await EnhancedStockService.getFundamentalMetrics(ticker);
      
      // Calculate individual pillar scores
      console.log(`🧮 Calculating fundamental score for ${ticker}...`);
      const fundamentalScore = await calculateFundamentalScore(
        companyInfo,
        fundamentalMetrics,
        marketData
      );
      
      console.log(`📊 Calculating technical score for ${ticker}...`);
      const technicalScore = await technicalsScoring.calculateScore(
        marketData,
        historicalData,
        technicalIndicators
      );
      
      console.log(`💭 Calculating sentiment score for ${ticker}...`);
      const sentimentScore = await sentimentScoring.calculateScore(newsItems);
      
      // Aggregate the scores
      console.log(`🎯 Aggregating final score for ${ticker}...`);
      const aggregateResult = aggregateScores(
        {
          fundamentals: fundamentalScore,
          technicals: technicalScore,
          sentiment: sentimentScore
        },
        weights,
        ticker,
        timestamp
      );
      
      console.log(`✅ Scoring complete for ${ticker}:`, {
        aggregate: aggregateResult.aggregateScore,
        recommendation: aggregateResult.label,
        breakdown: {
          fundamental: fundamentalScore.score,
          technical: technicalScore.score,
          sentiment: sentimentScore.score
        }
      });
      
      return aggregateResult;
      
    } catch (error) {
      console.error(`❌ Scoring failed for ${ticker}:`, error);
      throw new Error(`Failed to score ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Score multiple stocks in parallel
   */
  async scoreMultipleStocks(
    tickers: string[], 
    customWeights?: Partial<ScoringWeights>
  ): Promise<AggregateResult[]> {
    console.log(`🎯 Starting batch scoring for ${tickers.length} stocks: ${tickers.join(', ')}`);
    
    const promises = tickers.map(ticker => this.scoreStock(ticker, customWeights));
    const results = await Promise.allSettled(promises);
    
    const successfulResults: AggregateResult[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        errors.push(`${tickers[index]}: ${result.reason}`);
      }
    });
    
    if (errors.length > 0) {
      console.warn(`⚠️ Some stocks failed to score:`, errors);
    }
    
    console.log(`✅ Batch scoring complete: ${successfulResults.length}/${tickers.length} successful`);
    return successfulResults;
  }

  /**
   * Get default scoring weights
   */
  getDefaultWeights(): ScoringWeights {
    return { ...this.defaultWeights };
  }

  /**
   * Set new default weights
   */
  setDefaultWeights(weights: ScoringWeights): void {
    this.defaultWeights = weights;
  }
}

// Export singleton instance
export const stockScoringService = new StockScoringService();
