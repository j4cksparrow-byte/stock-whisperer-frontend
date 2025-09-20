import { alphaVantageService } from './alphaVantageService';
import { scoreFundamentals } from './fundamentalsScoring';
import { scoreTechnicals } from './technicalsScoring';
import { scoreSentiment } from './sentimentScoring';
import { aggregateScores } from './stockAggregator';
import { AggregateResult } from '../types/stockTypes';

export const calculateStockScore = async (ticker: string): Promise<AggregateResult> => {
  const requests: string[] = [];
  
  try {
    console.log(`Starting stock analysis for ${ticker}...`);
    
    // Get all data using the getAllData method which structures it properly
    console.log('Fetching all Alpha Vantage data...');
    const allData = await alphaVantageService.getAllData(ticker);
    
    requests.push(`OVERVIEW&symbol=${ticker}`);
    requests.push(`TIME_SERIES_DAILY&symbol=${ticker}`);
    requests.push(`NEWS_SENTIMENT&tickers=${ticker}`);

    // Calculate each pillar score with the structured data
    console.log('Calculating fundamentals score...');
    const fundamentals = scoreFundamentals(allData);
    
    console.log('Calculating technicals score...');
    const technicals = scoreTechnicals(allData);
    
    console.log('Calculating sentiment score...');
    const sentiment = scoreSentiment(allData);

    // Aggregate the scores
    console.log('Aggregating final score...');
    const result = aggregateScores(
      ticker,
      fundamentals,
      technicals,
      sentiment,
      {
        provider: "AlphaVantage",
        requests
      }
    );

    console.log(`Stock analysis complete for ${ticker}: ${result.aggregateScore}/100 (${result.label})`);
    return result;
    
  } catch (error) {
    console.error(`Error calculating stock score for ${ticker}:`, error);
    
    // Return error result
    return {
      ticker,
      asOf: new Date().toISOString(),
      scores: {
        fundamentals: null,
        technicals: null,
        sentiment: null,
      },
      aggregateScore: null,
      label: "Insufficient Data",
      flags: ["APIError"],
      dataSources: {
        provider: "AlphaVantage",
        requests
      },
      reasons: [`Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

export class StockScoringService {
  async scoreStock(ticker: string): Promise<AggregateResult> {
    return calculateStockScore(ticker);
  }

  async scoreMultipleStocks(tickers: string[]): Promise<AggregateResult[]> {
    const results: AggregateResult[] = [];
    
    console.log(`Scoring ${tickers.length} stocks...`);
    
    for (const ticker of tickers) {
      try {
        console.log(`Processing ${ticker}...`);
        const result = await this.scoreStock(ticker);
        results.push(result);
        
        // Rate limiting: wait 12 seconds between stocks to stay under 5 calls/minute
        if (tickers.indexOf(ticker) < tickers.length - 1) {
          console.log('Waiting 12 seconds for rate limiting...');
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      } catch (error) {
        console.error(`Failed to score ${ticker}:`, error);
        
        // Add error result for this ticker
        results.push({
          ticker,
          asOf: new Date().toISOString(),
          scores: {
            fundamentals: null,
            technicals: null,
            sentiment: null,
          },
          aggregateScore: null,
          label: "Insufficient Data",
          flags: ["APIError"],
          dataSources: {
            provider: "AlphaVantage",
            requests: []
          },
          reasons: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }
    
    console.log(`Completed scoring ${results.length} stocks`);
    return results;
  }
}

// Export a default instance
export const stockScoringService = new StockScoringService();
