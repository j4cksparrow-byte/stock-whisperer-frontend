// Enhanced Scoring Service - Integrated from stock-whisperer-frontend
// Provides detailed scoring breakdown with confidence levels and reasoning

class EnhancedScoringService {
  constructor() {
    this.defaultWeights = {
      fundamental: 0.4,
      technical: 0.3,
      sentiment: 0.3
    };
  }

  // Enhanced Fundamental Scoring (from stock-whisperer-frontend)
  calculateEnhancedFundamentalScore(fundamentalData) {
    let score = 50; // Base score
    const details = [];
    const flags = [];
    let confidence = 0.7;

    // P/E Ratio Analysis
    if (fundamentalData.peRatio) {
      if (fundamentalData.peRatio < 15) {
        score += 10;
        details.push(`Attractive P/E ratio of ${fundamentalData.peRatio.toFixed(2)}`);
      } else if (fundamentalData.peRatio > 30) {
        score -= 10;
        flags.push(`High P/E ratio of ${fundamentalData.peRatio.toFixed(2)} suggests overvaluation`);
      } else if (fundamentalData.peRatio < 25) {
        score += 5;
        details.push(`Reasonable P/E ratio of ${fundamentalData.peRatio.toFixed(2)}`);
      }
    }

    // ROE Analysis
    if (fundamentalData.roe) {
      if (fundamentalData.roe > 0.15) {
        score += 15;
        details.push(`Excellent ROE of ${(fundamentalData.roe * 100).toFixed(1)}%`);
      } else if (fundamentalData.roe > 0.10) {
        score += 8;
        details.push(`Good ROE of ${(fundamentalData.roe * 100).toFixed(1)}%`);
      } else if (fundamentalData.roe < 0.05) {
        score -= 15;
        flags.push(`Low ROE of ${(fundamentalData.roe * 100).toFixed(1)}% indicates poor profitability`);
      }
    }

    // Debt-to-Equity Analysis
    if (fundamentalData.debtToEquity !== undefined) {
      if (fundamentalData.debtToEquity < 0.3) {
        score += 10;
        details.push(`Low debt-to-equity ratio of ${fundamentalData.debtToEquity.toFixed(2)}`);
      } else if (fundamentalData.debtToEquity > 0.7) {
        score -= 15;
        flags.push(`High debt-to-equity ratio of ${fundamentalData.debtToEquity.toFixed(2)} indicates high leverage risk`);
      }
    }

    // Revenue Growth Analysis
    if (fundamentalData.revenueGrowth !== undefined) {
      if (fundamentalData.revenueGrowth > 0.2) {
        score += 12;
        details.push(`Strong revenue growth of ${(fundamentalData.revenueGrowth * 100).toFixed(1)}%`);
      } else if (fundamentalData.revenueGrowth > 0.1) {
        score += 8;
        details.push(`Good revenue growth of ${(fundamentalData.revenueGrowth * 100).toFixed(1)}%`);
      } else if (fundamentalData.revenueGrowth > 0) {
        score += 4;
        details.push(`Positive revenue growth of ${(fundamentalData.revenueGrowth * 100).toFixed(1)}%`);
      } else {
        score -= 8;
        flags.push(`Negative revenue growth of ${(fundamentalData.revenueGrowth * 100).toFixed(1)}%`);
      }
    }

    // Profit Margin Analysis
    if (fundamentalData.profitMargin !== undefined) {
      if (fundamentalData.profitMargin > 0.2) {
        score += 10;
        details.push(`Excellent profit margin of ${(fundamentalData.profitMargin * 100).toFixed(1)}%`);
      } else if (fundamentalData.profitMargin > 0.1) {
        score += 5;
        details.push(`Good profit margin of ${(fundamentalData.profitMargin * 100).toFixed(1)}%`);
      } else if (fundamentalData.profitMargin < 0) {
        score -= 15;
        flags.push(`Negative profit margin of ${(fundamentalData.profitMargin * 100).toFixed(1)}%`);
      }
    }

    // Current Ratio (Liquidity Analysis)
    if (fundamentalData.currentRatio) {
      if (fundamentalData.currentRatio > 2.0) {
        score += 8;
        details.push(`Strong liquidity with current ratio of ${fundamentalData.currentRatio.toFixed(2)}`);
      } else if (fundamentalData.currentRatio < 1.0) {
        score -= 10;
        flags.push(`Poor liquidity with current ratio of ${fundamentalData.currentRatio.toFixed(2)}`);
      }
    }

    // Adjust confidence based on data availability
    const dataPoints = [
      fundamentalData.peRatio,
      fundamentalData.roe,
      fundamentalData.debtToEquity,
      fundamentalData.revenueGrowth,
      fundamentalData.profitMargin,
      fundamentalData.currentRatio
    ].filter(val => val !== undefined && val !== null).length;

    confidence = Math.min(0.9, 0.4 + (dataPoints * 0.1));

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      confidence,
      details,
      flags,
      breakdown: {
        valuation: this.calculateValuationScore(fundamentalData),
        profitability: this.calculateProfitabilityScore(fundamentalData),
        growth: this.calculateGrowthScore(fundamentalData),
        leverage: this.calculateLeverageScore(fundamentalData),
        liquidity: this.calculateLiquidityScore(fundamentalData)
      }
    };
  }

  // Enhanced Technical Scoring (from stock-whisperer-frontend)
  calculateEnhancedTechnicalScore(indicators, marketData, historicalData) {
    let score = 50;
    const details = [];
    const flags = [];
    let confidence = 0.8;

    // Price Momentum Analysis (Weight: 25%)
    const changePercent = marketData?.changePercent || 0;
    if (changePercent > 8) {
      score += 12;
      details.push(`Strong positive momentum (+${changePercent.toFixed(2)}%) - bullish signal`);
    } else if (changePercent > 4) {
      score += 8;
      details.push(`Good positive momentum (+${changePercent.toFixed(2)}%)`);
    } else if (changePercent < -8) {
      score -= 12;
      flags.push(`Strong negative momentum (${changePercent.toFixed(2)}%) - bearish signal`);
    } else if (changePercent < -4) {
      score -= 8;
      flags.push(`Negative momentum (${changePercent.toFixed(2)}%)`);
    }

    // RSI Analysis (Weight: 20%)
    const rsiSeries = indicators?.RSI || indicators?.rsi;
    if (Array.isArray(rsiSeries) && rsiSeries.length > 0) {
      const rsi = rsiSeries[rsiSeries.length - 1];
      if (rsi < 30) {
        score += 15;
        details.push(`RSI oversold at ${rsi.toFixed(1)} - potential buy signal`);
      } else if (rsi > 70) {
        score -= 15;
        flags.push(`RSI overbought at ${rsi.toFixed(1)} - potential sell signal`);
      } else if (rsi > 50) {
        score += 5;
        details.push(`RSI bullish at ${rsi.toFixed(1)}`);
      }
    }

    // Moving Average Analysis (Weight: 20%)
    const lastClose = marketData?.price || 0;
    if (indicators?.SMA && lastClose) {
      const sma20 = indicators.SMA.values?.[indicators.SMA.values.length - 1];
      const sma50 = indicators.SMA50?.[indicators.SMA50.length - 1];
      
      if (sma20 && lastClose > sma20) {
        score += 10;
        details.push(`Price above 20-day moving average - bullish trend`);
      }
      if (sma50 && lastClose > sma50) {
        score += 10;
        details.push(`Price above 50-day moving average - strong bullish trend`);
      }
      if (sma20 && sma50 && sma20 > sma50) {
        score += 5;
        details.push(`Golden cross pattern - 20-day MA above 50-day MA`);
      }
    }

    // MACD Analysis (Weight: 15%)
    if (indicators?.MACD) {
      const macd = indicators.MACD;
      if (macd.histogram && Array.isArray(macd.histogram)) {
        const currentHist = macd.histogram[macd.histogram.length - 1];
        const prevHist = macd.histogram[macd.histogram.length - 2];
        
        if (currentHist > 0 && prevHist <= 0) {
          score += 12;
          details.push(`MACD bullish crossover - momentum turning positive`);
        } else if (currentHist > 0) {
          score += 7;
          details.push(`MACD histogram positive - bullish momentum`);
        } else if (currentHist < 0 && prevHist >= 0) {
          score -= 12;
          flags.push(`MACD bearish crossover - momentum turning negative`);
        }
      }
    }

    // Volume Analysis (Weight: 10%)
    if (indicators?.OBV && Array.isArray(indicators.OBV)) {
      const obvCurrent = indicators.OBV[indicators.OBV.length - 1];
      const obvPrev = indicators.OBV[indicators.OBV.length - 20]; // 20 days ago
      
      if (obvCurrent > obvPrev) {
        score += 8;
        details.push(`On-Balance Volume increasing - accumulation pattern`);
      } else {
        score -= 5;
        flags.push(`On-Balance Volume decreasing - distribution pattern`);
      }
    }

    // Bollinger Bands Analysis (Weight: 10%)
    if (indicators?.BollingerBands && lastClose) {
      const bb = indicators.BollingerBands;
      if (bb.lower && bb.upper && Array.isArray(bb.lower) && Array.isArray(bb.upper)) {
        const lowerBand = bb.lower[bb.lower.length - 1];
        const upperBand = bb.upper[bb.upper.length - 1];
        
        if (lastClose < lowerBand) {
          score += 10;
          details.push(`Price below lower Bollinger Band - oversold condition`);
        } else if (lastClose > upperBand) {
          score -= 10;
          flags.push(`Price above upper Bollinger Band - overbought condition`);
        }
      }
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      confidence,
      details,
      flags,
      breakdown: {
        momentum: this.calculateMomentumScore(indicators, marketData),
        trend: this.calculateTrendScore(indicators, marketData),
        volatility: this.calculateVolatilityScore(indicators),
        volume: this.calculateVolumeScore(indicators)
      }
    };
  }

  // Enhanced Sentiment Scoring
  calculateEnhancedSentimentScore(sentimentData) {
    let score = 50;
    const details = [];
    const flags = [];
    let confidence = 0.6; // Sentiment is inherently less reliable

    if (!sentimentData || !sentimentData.newsItems || sentimentData.newsItems.length === 0) {
      flags.push('No recent news available for sentiment analysis');
      confidence = 0.3;
      return {
        score: 50,
        confidence,
        details: ['No news data available - neutral sentiment assumed'],
        flags
      };
    }

    let totalSentiment = 0;
    let sentimentCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    sentimentData.newsItems.forEach(item => {
      if (item.sentiment !== undefined) {
        totalSentiment += item.sentiment;
        sentimentCount++;
        
        if (item.sentiment > 0.1) positiveCount++;
        else if (item.sentiment < -0.1) negativeCount++;
        else neutralCount++;
      }
    });

    if (sentimentCount > 0) {
      const avgSentiment = totalSentiment / sentimentCount;
      const sentimentRatio = avgSentiment * 100; // Convert to percentage

      // Overall sentiment score adjustment
      score += sentimentRatio * 0.5; // Scale sentiment impact

      // Sentiment distribution analysis
      const totalNews = positiveCount + negativeCount + neutralCount;
      const positiveRatio = positiveCount / totalNews;
      const negativeRatio = negativeCount / totalNews;

      if (positiveRatio > 0.7) {
        score += 15;
        details.push(`Overwhelmingly positive news sentiment (${(positiveRatio * 100).toFixed(0)}% positive)`);
      } else if (positiveRatio > 0.5) {
        score += 10;
        details.push(`Majority positive sentiment (${(positiveRatio * 100).toFixed(0)}% positive)`);
      } else if (negativeRatio > 0.7) {
        score -= 15;
        flags.push(`Overwhelmingly negative news sentiment (${(negativeRatio * 100).toFixed(0)}% negative)`);
      } else if (negativeRatio > 0.5) {
        score -= 10;
        flags.push(`Majority negative sentiment (${(negativeRatio * 100).toFixed(0)}% negative)`);
      }

      // Confidence based on news volume and recency
      confidence = Math.min(0.8, 0.4 + (Math.min(totalNews, 10) * 0.04));
      
      details.push(`Analyzed ${totalNews} news items with average sentiment of ${avgSentiment.toFixed(2)}`);
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      confidence,
      details,
      flags,
      breakdown: {
        newsVolume: sentimentData.newsItems.length,
        positiveRatio,
        negativeRatio,
        avgSentiment: totalSentiment / sentimentCount
      }
    };
  }

  // Aggregate scoring with enhanced labels
  calculateAggregateScore(fundamental, technical, sentiment, weights = this.defaultWeights) {
    const aggregateScore = Math.round(
      fundamental.score * weights.fundamental +
      technical.score * weights.technical +
      sentiment.score * weights.sentiment
    );

    // Enhanced recommendation labels
    let label;
    if (aggregateScore >= 80) {
      label = 'STRONG BUY';
    } else if (aggregateScore >= 70) {
      label = 'BUY';
    } else if (aggregateScore >= 60) {
      label = 'WEAK BUY';
    } else if (aggregateScore >= 50) {
      label = 'HOLD';
    } else if (aggregateScore >= 40) {
      label = 'WEAK SELL';
    } else if (aggregateScore >= 30) {
      label = 'SELL';
    } else {
      label = 'STRONG SELL';
    }

    // Calculate overall confidence
    const overallConfidence = Math.round(
      fundamental.confidence * weights.fundamental +
      technical.confidence * weights.technical +
      sentiment.confidence * weights.sentiment
    );

    return {
      aggregateScore,
      label,
      confidence: overallConfidence,
      breakdown: {
        fundamental: fundamental.score,
        technical: technical.score,
        sentiment: sentiment.score
      },
      details: [
        ...fundamental.details,
        ...technical.details,
        ...sentiment.details
      ],
      flags: [
        ...fundamental.flags,
        ...technical.flags,
        ...sentiment.flags
      ]
    };
  }

  // Helper methods for detailed breakdown scoring
  calculateValuationScore(data) {
    let score = 50;
    if (data.peRatio && data.peRatio < 20) score += 15;
    if (data.priceToBook && data.priceToBook < 2) score += 10;
    return Math.max(0, Math.min(100, score));
  }

  calculateProfitabilityScore(data) {
    let score = 50;
    if (data.roe && data.roe > 0.15) score += 20;
    if (data.profitMargin && data.profitMargin > 0.1) score += 15;
    return Math.max(0, Math.min(100, score));
  }

  calculateGrowthScore(data) {
    let score = 50;
    if (data.revenueGrowth && data.revenueGrowth > 0.1) score += 25;
    if (data.earningsGrowth && data.earningsGrowth > 0.1) score += 25;
    return Math.max(0, Math.min(100, score));
  }

  calculateLeverageScore(data) {
    let score = 50;
    if (data.debtToEquity && data.debtToEquity < 0.3) score += 25;
    if (data.debtToEquity && data.debtToEquity > 0.7) score -= 25;
    return Math.max(0, Math.min(100, score));
  }

  calculateLiquidityScore(data) {
    let score = 50;
    if (data.currentRatio && data.currentRatio > 1.5) score += 25;
    if (data.quickRatio && data.quickRatio > 1.0) score += 25;
    return Math.max(0, Math.min(100, score));
  }

  calculateMomentumScore(indicators, marketData) {
    let score = 50;
    const changePercent = marketData?.changePercent || 0;
    if (changePercent > 5) score += 25;
    if (changePercent < -5) score -= 25;
    return Math.max(0, Math.min(100, score));
  }

  calculateTrendScore(indicators, marketData) {
    let score = 50;
    // Implementation for trend scoring based on moving averages
    return Math.max(0, Math.min(100, score));
  }

  calculateVolatilityScore(indicators) {
    let score = 50;
    // Implementation for volatility scoring
    return Math.max(0, Math.min(100, score));
  }

  calculateVolumeScore(indicators) {
    let score = 50;
    // Implementation for volume scoring
    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new EnhancedScoringService();
