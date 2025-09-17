import type { ScoreBreakdown } from './scoringService';
import type { CompanyInfo, MarketData, FundamentalMetrics } from '../types/stockAnalysis';

export const calculateFundamentalScore = async (
  companyInfo: CompanyInfo,
  fundamentalMetrics: FundamentalMetrics,
  marketData: MarketData
): Promise<ScoreBreakdown> => {
  const details: string[] = [];
  const flags: string[] = [];
  let score = 50; // Base score

  // PE Ratio Analysis
  if (fundamentalMetrics.peRatio) {
    if (fundamentalMetrics.peRatio < 15) {
      score += 10;
      details.push(`Attractive PE ratio of ${fundamentalMetrics.peRatio.toFixed(2)}`);
    } else if (fundamentalMetrics.peRatio > 30) {
      score -= 10;
      flags.push(`High PE ratio of ${fundamentalMetrics.peRatio.toFixed(2)}`);
    }
  }

  // ROE Analysis
  if (fundamentalMetrics.roe) {
    if (fundamentalMetrics.roe > 0.15) {
      score += 15;
      details.push(`Strong ROE of ${(fundamentalMetrics.roe * 100).toFixed(1)}%`);
    } else if (fundamentalMetrics.roe < 0.05) {
      score -= 10;
      flags.push(`Low ROE of ${(fundamentalMetrics.roe * 100).toFixed(1)}%`);
    }
  }

  // Debt Analysis
  if (fundamentalMetrics.debtToEquity) {
    if (fundamentalMetrics.debtToEquity < 0.3) {
      score += 10;
      details.push(`Low debt-to-equity ratio of ${fundamentalMetrics.debtToEquity.toFixed(2)}`);
    } else if (fundamentalMetrics.debtToEquity > 1.0) {
      score -= 15;
      flags.push(`High debt-to-equity ratio of ${fundamentalMetrics.debtToEquity.toFixed(2)}`);
    }
  }

  // Revenue Growth
  if (fundamentalMetrics.revenueGrowth) {
    if (fundamentalMetrics.revenueGrowth > 0.1) {
      score += 10;
      details.push(`Strong revenue growth of ${(fundamentalMetrics.revenueGrowth * 100).toFixed(1)}%`);
    } else if (fundamentalMetrics.revenueGrowth < 0) {
      score -= 10;
      flags.push(`Negative revenue growth of ${(fundamentalMetrics.revenueGrowth * 100).toFixed(1)}%`);
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Calculate confidence based on data availability
  const confidence = Math.min(100, 
    (fundamentalMetrics.peRatio ? 25 : 0) +
    (fundamentalMetrics.roe ? 25 : 0) +
    (fundamentalMetrics.debtToEquity ? 25 : 0) +
    (fundamentalMetrics.revenueGrowth ? 25 : 0)
  );

  return {
    score,
    confidence,
    details,
    flags
  };
};