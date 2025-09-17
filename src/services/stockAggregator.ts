import type { ScoreBreakdown, AggregateResult, ScoringWeights } from './scoringService';

export const aggregateScores = (
  scores: {
    fundamentals: ScoreBreakdown;
    technicals: ScoreBreakdown;
    sentiment: ScoreBreakdown;
  },
  weights: ScoringWeights,
  ticker: string,
  timestamp: string
): AggregateResult => {
  // Calculate weighted aggregate score
  const aggregateScore = Math.round(
    scores.fundamentals.score * weights.fundamental +
    scores.technicals.score * weights.technical +
    scores.sentiment.score * weights.sentiment
  );

  // Determine label based on score
  let label: string;
  if (aggregateScore >= 80) {
    label = 'STRONG BUY';
  } else if (aggregateScore >= 70) {
    label = 'BUY';
  } else if (aggregateScore >= 60) {
    label = 'HOLD';
  } else if (aggregateScore >= 40) {
    label = 'WEAK HOLD';
  } else {
    label = 'SELL';
  }

  // Calculate overall confidence
  const confidence = Math.round(
    scores.fundamentals.confidence * weights.fundamental +
    scores.technicals.confidence * weights.technical +
    scores.sentiment.confidence * weights.sentiment
  );

  // Combine all reasons and flags
  const reasons = [
    ...scores.fundamentals.details,
    ...scores.technicals.details,
    ...scores.sentiment.details
  ];

  const flags = [
    ...scores.fundamentals.flags,
    ...scores.technicals.flags,
    ...scores.sentiment.flags
  ];

  return {
    ticker,
    asOf: timestamp,
    aggregateScore,
    label,
    confidence,
    scores,
    weights,
    reasons,
    flags,
    dataSources: {
      provider: 'Enhanced Stock Service',
      requests: ['Market Data', 'Company Info', 'Historical Data', 'News & Sentiment', 'Technical Indicators', 'Fundamental Metrics']
    }
  };
};