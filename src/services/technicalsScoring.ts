import type { ScoreBreakdown } from './scoringService';
import type { MarketData, HistoricalData } from '../types/stockAnalysis';

/**
 * Technical analysis scoring service
 */
export const technicalsScoring = {
  /**
   * Calculate technical analysis score
   */
  async calculateScore(
    marketData: MarketData,
    historicalData: HistoricalData[],
    technicalIndicators: any
  ): Promise<ScoreBreakdown> {
    console.log(`📈 Starting technical analysis for ${marketData.symbol}...`);
    
    let score = 50; // Start with neutral score
    let confidence = 0.8; // Base confidence (technical analysis is more reliable with good data)
    const details: string[] = [];
    const flags: string[] = [];
    
    try {
      // Price Momentum Analysis (Weight: 25%)
      const changePercent = marketData.changePercent || 0;
      if (changePercent > 8) {
        score += 12;
        details.push(`Strong positive momentum (+${changePercent.toFixed(2)}%) - bullish signal`);
      } else if (changePercent > 4) {
        score += 8;
        details.push(`Good positive momentum (+${changePercent.toFixed(2)}%) - upward trend`);
      } else if (changePercent > 1) {
        score += 4;
        details.push(`Moderate positive momentum (+${changePercent.toFixed(2)}%) - slight bullish`);
      } else if (changePercent > -1) {
        details.push(`Neutral momentum (${changePercent.toFixed(2)}%) - sideways movement`);
      } else if (changePercent > -4) {
        score -= 4;
        flags.push(`Moderate negative momentum (${changePercent.toFixed(2)}%) - slight bearish`);
      } else if (changePercent > -8) {
        score -= 8;
        flags.push(`Negative momentum (${changePercent.toFixed(2)}%) - downward trend`);
      } else {
        score -= 12;
        flags.push(`Strong negative momentum (${changePercent.toFixed(2)}%) - bearish signal`);
      }
      
      // Volume Analysis (Weight: 20%)
      if (marketData.volume && historicalData.length >= 20) {
        // Calculate average volume from historical data
        const volumes = historicalData.slice(-20).map(d => d.volume || 0);
        const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
        
        if (avgVolume > 0) {
          const volumeRatio = marketData.volume / avgVolume;
          if (volumeRatio > 3) {
            if (changePercent > 0) {
              score += 10;
              details.push(`High volume breakout (${volumeRatio.toFixed(1)}x avg) - strong buying interest`);
            } else {
              score -= 8;
              flags.push(`High volume selloff (${volumeRatio.toFixed(1)}x avg) - strong selling pressure`);
            }
          } else if (volumeRatio > 2) {
            if (changePercent > 0) {
              score += 6;
              details.push(`Above-average volume (${volumeRatio.toFixed(1)}x avg) - good buying support`);
            } else {
              score -= 4;
              flags.push(`Above-average volume (${volumeRatio.toFixed(1)}x avg) - selling pressure`);
            }
          } else if (volumeRatio > 1.5) {
            score += 2;
            details.push(`Healthy volume (${volumeRatio.toFixed(1)}x avg) - normal trading activity`);
          } else if (volumeRatio < 0.5) {
            score -= 3;
            flags.push(`Low volume (${volumeRatio.toFixed(1)}x avg) - weak conviction`);
          }
        }
      } else {
        flags.push('Insufficient volume data for analysis');
      }
      
      // Historical Price Analysis (Weight: 30%)
      if (historicalData && historicalData.length >= 20) {
        const prices = historicalData.map(d => d.close);
        const currentPrice = marketData.price;
        
        // 20-day moving average
        const sma20 = prices.slice(-20).reduce((sum, price) => sum + price, 0) / 20;
        const sma20Distance = ((currentPrice - sma20) / sma20) * 100;
        
        if (sma20Distance > 5) {
          score += 8;
          details.push(`Well above 20-day MA (+${sma20Distance.toFixed(1)}%) - strong uptrend`);
        } else if (sma20Distance > 2) {
          score += 4;
          details.push(`Above 20-day MA (+${sma20Distance.toFixed(1)}%) - bullish trend`);
        } else if (sma20Distance > -2) {
          details.push(`Near 20-day MA (${sma20Distance.toFixed(1)}%) - consolidating`);
        } else if (sma20Distance > -5) {
          score -= 4;
          flags.push(`Below 20-day MA (${sma20Distance.toFixed(1)}%) - bearish trend`);
        } else {
          score -= 8;
          flags.push(`Well below 20-day MA (${sma20Distance.toFixed(1)}%) - strong downtrend`);
        }
        
        // 50-day moving average (if enough data)
        if (prices.length >= 50) {
          const sma50 = prices.slice(-50).reduce((sum, price) => sum + price, 0) / 50;
          const sma50Distance = ((currentPrice - sma50) / sma50) * 100;
          
          if (sma50Distance > 10) {
            score += 6;
            details.push(`Strong position above 50-day MA (+${sma50Distance.toFixed(1)}%) - long-term bullish`);
          } else if (sma50Distance > -10) {
            details.push(`Near 50-day MA (${sma50Distance.toFixed(1)}%) - neutral long-term trend`);
          } else {
            score -= 6;
            flags.push(`Below 50-day MA (${sma50Distance.toFixed(1)}%) - long-term bearish`);
          }
          
          // Golden Cross / Death Cross
          if (sma20 > sma50 && prices[prices.length - 21] <= prices.slice(-51, -31).reduce((sum, p) => sum + p, 0) / 20) {
            score += 8;
            details.push('Golden Cross detected - bullish crossover signal');
          } else if (sma20 < sma50 && prices[prices.length - 21] >= prices.slice(-51, -31).reduce((sum, p) => sum + p, 0) / 20) {
            score -= 8;
            flags.push('Death Cross detected - bearish crossover signal');
          }
        }
        
        // Volatility Analysis
        const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
        const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
        
        if (volatility < 0.02) {
          score += 3;
          details.push(`Low volatility (${(volatility * 100).toFixed(1)}%) - stable price action`);
        } else if (volatility > 0.05) {
          score -= 3;
          flags.push(`High volatility (${(volatility * 100).toFixed(1)}%) - unstable price action`);
        }
        
        // Support and Resistance Levels
        const highs = prices.slice(-20);
        const lows = prices.slice(-20);
        const maxPrice = Math.max(...highs);
        const minPrice = Math.min(...lows);
        
        const nearResistance = ((currentPrice - maxPrice) / maxPrice) > -0.02;
        const nearSupport = ((currentPrice - minPrice) / minPrice) < 0.02;
        
        if (nearResistance) {
          score -= 2;
          flags.push('Near resistance level - potential selling pressure');
        }
        
        if (nearSupport) {
          score += 2;
          details.push('Near support level - potential buying opportunity');
        }
      } else {
        flags.push('Insufficient historical data - limited technical analysis');
        confidence *= 0.7;
      }
      
      // Technical Indicators Analysis (Weight: 25%)
      if (technicalIndicators) {
        // RSI Analysis
        if (technicalIndicators.rsi !== undefined) {
          if (technicalIndicators.rsi < 30) {
            score += 8;
            details.push(`Oversold RSI (${technicalIndicators.rsi.toFixed(1)}) - potential buying opportunity`);
          } else if (technicalIndicators.rsi < 40) {
            score += 4;
            details.push(`Low RSI (${technicalIndicators.rsi.toFixed(1)}) - bearish momentum weakening`);
          } else if (technicalIndicators.rsi > 70) {
            score -= 8;
            flags.push(`Overbought RSI (${technicalIndicators.rsi.toFixed(1)}) - potential selling pressure`);
          } else if (technicalIndicators.rsi > 60) {
            score -= 4;
            flags.push(`High RSI (${technicalIndicators.rsi.toFixed(1)}) - bullish momentum may be peaking`);
          }
        }
        
        // MACD Analysis
        if (technicalIndicators.macd && technicalIndicators.macdSignal) {
          const macdDiff = technicalIndicators.macd - technicalIndicators.macdSignal;
          if (macdDiff > 0) {
            score += 4;
            details.push('MACD above signal line - bullish momentum');
          } else {
            score -= 4;
            flags.push('MACD below signal line - bearish momentum');
          }
        }
        
        // Bollinger Bands
        if (technicalIndicators.upperBand && technicalIndicators.lowerBand) {
          const bbPosition = (marketData.price - technicalIndicators.lowerBand) / 
                           (technicalIndicators.upperBand - technicalIndicators.lowerBand);
          
          if (bbPosition > 0.8) {
            score -= 3;
            flags.push('Near upper Bollinger Band - potentially overbought');
          } else if (bbPosition < 0.2) {
            score += 3;
            details.push('Near lower Bollinger Band - potentially oversold');
          }
        }
      } else {
        flags.push('No technical indicators available - basic analysis only');
        confidence *= 0.8;
      }
      
      // Adjust confidence based on data quality
      const dataQuality = (historicalData?.length || 0) / 60; // Prefer 60+ days of data
      confidence = Math.min(confidence * (0.7 + dataQuality * 0.3), 1.0);
      
    } catch (error) {
      console.warn('Error in technical analysis:', error);
      flags.push('Error in technical analysis - reduced reliability');
      confidence *= 0.6;
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, Math.round(score)));
    confidence = Math.max(0, Math.min(1, confidence));
    
    const result: ScoreBreakdown = {
      score,
      confidence,
      details,
      flags
    };
    
    console.log(`✅ Technical analysis complete for ${marketData.symbol}: ${score}/100 (confidence: ${(confidence * 100).toFixed(1)}%)`);
    
    return result;
  }
};
