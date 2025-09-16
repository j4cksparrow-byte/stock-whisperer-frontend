// services/analysisService.js
const geminiService = require('./geminiService');
const weightService = require('./weightService');
const technicalAnalysisService = require('./technicalAnalysisService');
const dataService = require('./dataService');
const { fetchAlphaVantageNewsSentiment } = require('./sentimentService');
const fundamentalAnalysisService = require('./fundamentalAnalysisService');

class AnalysisService {
  constructor() {
    this.performAdvancedAnalysis = this.performAdvancedAnalysis.bind(this);
    this.calculateWeightedScore = this.calculateWeightedScore.bind(this);
    this.generateWeightedAISummary = this.generateWeightedAISummary.bind(this);
  }

  // ---------------------------------------
  // PUBLIC: NORMAL (Fundamentals + AI text)
  // ---------------------------------------
  async performNormalAnalysis(symbol, stockData, timeframe) {
    const sym = String(symbol || '').toUpperCase();

    console.log(`🔍 Starting fundamental analysis for ${sym}...`);
    // Real fundamentals (Alpha Vantage pipeline with fallback inside)
    const fundamental = await this.getFundamentalAnalysis(sym);

    // Simple overall from fundamentals
    const overallScore = Math.round(fundamental?.score ?? 50);
    const overallReco = this.getRecommendationFromScore(overallScore);

    // AI summary (safe fallback text if Gemini is unavailable)
    const aiSummary = await this.generateWeightedAISummary(
      sym,
      { score: overallScore, ...fundamental },
      { score: 0 },
      { score: 0 },
      { fundamental: 100, technical: 0, sentiment: 0 },
      overallScore
    );

    console.log(`✅ Normal analysis completed for ${sym}`);
    return {
      status: 'success',
      symbol: sym,
      analysis: {
        mode: 'normal',
        timeframe,
        timestamp: new Date().toISOString(),

        fundamental: { ...fundamental, weight: '100%' },

        overall: {
          score: overallScore,
          recommendation: overallReco
        },

        aiInsights: { summary: aiSummary },

        meta: {
          dataPoints: Array.isArray(stockData?.ohlcv) ? stockData.ohlcv.length : 0,
          dataSource: stockData?.source || 'unknown',
          confidenceLevel: this.calculateConfidenceLevel(overallScore),
          riskLevel: this.calculateRiskLevel(
            { score: overallScore },
            { score: 50 },
            { score: 50 }
          )
        }
      }
    };
  }

  // --------------------------------------------------------------
  // PUBLIC: ADVANCED (Fundamentals + Technicals + Sentiment + AI)
  // --------------------------------------------------------------
  async performAdvancedAnalysis(symbol, stockData, timeframe, rawWeights = {}, indicatorsConfig = {}) {
    const sym = String(symbol || '').toUpperCase();

    // Validate/normalize weights to 100
    const weights = weightService.validateAndParseWeights({
      fundamental: Number(rawWeights?.fundamental ?? weightService.defaultWeights.fundamental),
      technical: Number(rawWeights?.technical ?? weightService.defaultWeights.technical),
      sentiment: Number(rawWeights?.sentiment ?? weightService.defaultWeights.sentiment),
    });

    console.log(`🔍 Starting advanced analysis for ${sym}...`);
    console.log(`📊 Initiating fundamental analysis for ${sym}...`);
    console.log(`📊 Initiating technical analysis for ${sym}...`);
    console.log(`📊 Initiating sentiment analysis for ${sym}...`);

    // Parallel pipelines
    const [fundamentalAnalysis, technicalAnalysis, sentimentAnalysis] = await Promise.all([
      this.getFundamentalAnalysis(sym),
      this.getTechnicalAnalysis(sym, stockData, timeframe, indicatorsConfig),
      this.getSentimentAnalysis(sym),
    ]);

    // Weighted score + recommendation
    const weightedScore = this.calculateWeightedScore(
      fundamentalAnalysis,
      technicalAnalysis,
      sentimentAnalysis,
      weights
    );
    const recommendation = this.getRecommendationFromScore(weightedScore);

    // AI summary (weights-aware)
    const aiSummary = await this.generateWeightedAISummary(
      sym,
      fundamentalAnalysis,
      technicalAnalysis,
      sentimentAnalysis,
      weights,
      weightedScore
    );

    console.log(`✅ Advanced analysis completed for ${sym}`);
    return {
      status: 'success',
      symbol: sym,
      analysis: {
        mode: 'advanced',
        timeframe,
        timestamp: new Date().toISOString(),

        fundamental: { ...fundamentalAnalysis, weight: `${weights.fundamental}%` },
        technical:    { ...technicalAnalysis,    weight: `${weights.technical}%` },
        sentiment:    { ...sentimentAnalysis,    weight: `${weights.sentiment}%` },

        overall: {
          score: weightedScore,
          recommendation
        },

        aiInsights: { summary: aiSummary },

        meta: {
          dataPoints: Array.isArray(stockData?.ohlcv) ? stockData.ohlcv.length : 0,
          weightsUsed: weights,
          confidenceLevel: this.calculateConfidenceLevel(weightedScore),
          riskLevel: this.calculateRiskLevel(
            fundamentalAnalysis,
            technicalAnalysis,
            sentimentAnalysis
          ),
          dataSource: stockData?.source || 'unknown'
        }
      }
    };
  }

  // -------------------------------
  // FUNDAMENTALS (real pipeline)
  // -------------------------------
  async getFundamentalAnalysis(symbol /*, stockData */) {
    try {
      const result = await fundamentalAnalysisService.analyze(symbol);
      console.log(`✅ Fundamental analysis completed for ${symbol}`);
      return result;
    } catch (err) {
      console.warn('⚠️ FundamentalAnalysisService failed, using neutral fallback:', err.message);
      console.log(`⚠️ Fundamental analysis fallback used for ${symbol}`);
      return {
        score: 50,
        recommendation: 'HOLD',
        breakdown: { valuation: 50, growth: 50, profitability: 50, leverage: 50, cashflow: 50 },
        metrics: {},
        notes: `Fundamentals fallback for ${symbol}: ${err.message}`,
        source: 'fallback',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // -------------------------------------------------------
  // TECHNICALS (uses your technicalAnalysisService)
  // -------------------------------------------------------
  async getTechnicalAnalysis(symbol, stockData, timeframe, indicatorsConfig = {}) {
    try {
      if (!Array.isArray(stockData?.ohlcv) || stockData.ohlcv.length < 10) {
        throw new Error('Insufficient OHLCV data for technical analysis');
      }

      // Use custom indicators if specified, otherwise use all
      const indicators = await technicalAnalysisService.calculateIndicators(
        stockData.ohlcv,
        indicatorsConfig
      );

      const score = this.calculateTechnicalScore(indicators, stockData.ohlcv);
      
      console.log(`✅ Technical analysis completed for ${symbol}`);
      
      return {
        score,
        indicators,
        recommendation: this.getRecommendationFromScore(score),
        configuration: indicatorsConfig
      };
    } catch (error) {
      console.error('Technical analysis error:', error.message);
      console.log(`⚠️ Technical analysis fallback used for ${symbol}`);
      // Reasonable fallback from latest bar
      const last = stockData?.ohlcv?.at(-1) || {};
      return {
        score: 60,
        indicators: {
          note: 'Fallback indicators due to error',
          lastClose: last.close,
          lastHigh: last.high,
          lastLow: last.low
        },
        recommendation: 'HOLD',
        error: 'Advanced technical analysis failed; using fallback'
      };
    }
  }

  // Scoring heuristic using common signals (robust to missing indicators)
  calculateTechnicalScore(indicators, ohlcv) {
    let score = 50;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const lastClose = Array.isArray(ohlcv) && ohlcv.length ? ohlcv[ohlcv.length - 1].close : null;

    // RSI - only if RSI was calculated
    const rsiSeries = indicators?.RSI || indicators?.rsi;
    if (Array.isArray(rsiSeries) && rsiSeries.length) {
      const rsi = Number(rsiSeries.at(-1));
      if (!Number.isNaN(rsi)) {
        if (rsi < 30) score += 10;
        else if (rsi > 70) score -= 10;
        else if (rsi > 50) score += 5;
      }
    }

    // MACD (histogram bias) - only if MACD was calculated
    if (indicators?.MACD || indicators?.macd) {
      const macd = indicators.MACD || indicators.macd;
      if (macd && Array.isArray(macd.histogram || macd.hist)) {
        const h = Number((macd.histogram || macd.hist).at(-1));
        if (!Number.isNaN(h)) score += h > 0 ? 7 : -7;
      }
    }

    // Simple moving averages - only if SMA was calculated
    if (indicators?.SMA || indicators?.SMA20) {
      const sma20 = indicators?.SMA?.values?.at?.(-1) ?? indicators?.SMA20?.at?.(-1);
      const sma50 = indicators?.SMA50?.at?.(-1);
      if (lastClose != null) {
        if (sma20 != null && lastClose > sma20) score += 5;
        if (sma50 != null && lastClose > sma50) score += 5;
      }
    }

    // Bollinger Bands - only if BollingerBands was calculated
    if (indicators?.BollingerBands || indicators?.bollingerBands) {
      const bb = indicators.BollingerBands || indicators.bollingerBands;
      if (bb && Array.isArray(bb.lower) && Array.isArray(bb.upper) && lastClose != null) {
        const lo = Number(bb.lower.at(-1));
        const up = Number(bb.upper.at(-1));
        if (!Number.isNaN(lo) && !Number.isNaN(up) && up > lo) {
          const pos = (lastClose - lo) / (up - lo); // 0=lower, 1=upper
          if (pos < 0.25) score += 4;
          if (pos > 0.75) score -= 4;
        }
      }
    }

    // ADX (Trend Strength) - only if ADX was calculated
    if (indicators?.ADX) {
      const adxSeries = indicators.ADX;
      if (Array.isArray(adxSeries) && adxSeries.length) {
        const adx = Number(adxSeries.at(-1));
        if (!Number.isNaN(adx)) {
          // ADX > 25 indicates strong trend
          if (adx > 25) score += 3;
          // ADX > 40 indicates very strong trend
          if (adx > 40) score += 2;
        }
      }
    }

    // CCI (Commodity Channel Index) - only if CCI was calculated
    if (indicators?.CCI) {
      const cciSeries = indicators.CCI;
      if (Array.isArray(cciSeries) && cciSeries.length) {
        const cci = Number(cciSeries.at(-1));
        if (!Number.isNaN(cci)) {
          // CCI > 100 indicates overbought
          if (cci > 100) score -= 8;
          // CCI < -100 indicates oversold
          else if (cci < -100) score += 8;
          // CCI between -100 and 100 indicates neutral
          else if (cci > 0) score += 2;
        }
      }
    }

    // Williams R - only if WilliamsR was calculated
    if (indicators?.WilliamsR) {
      const williamsRSeries = indicators.WilliamsR;
      if (Array.isArray(williamsRSeries) && williamsRSeries.length) {
        const williamsR = Number(williamsRSeries.at(-1));
        if (!Number.isNaN(williamsR)) {
          // Williams R < -80 indicates oversold
          if (williamsR < -80) score += 7;
          // Williams R > -20 indicates overbought
          else if (williamsR > -20) score -= 7;
        }
      }
    }

    // Money Flow Index - only if MoneyFlowIndex was calculated
    if (indicators?.MoneyFlowIndex) {
      const mfiSeries = indicators.MoneyFlowIndex;
      if (Array.isArray(mfiSeries) && mfiSeries.length) {
        const mfi = Number(mfiSeries.at(-1));
        if (!Number.isNaN(mfi)) {
          // MFI > 80 indicates overbought
          if (mfi > 80) score -= 6;
          // MFI < 20 indicates oversold
          else if (mfi < 20) score += 6;
        }
      }
    }

    return clamp(Math.round(score), 0, 100);
  }

  // ------------------------------
  // SENTIMENT (Alpha Vantage News)
  // ------------------------------
  async getSentimentAnalysis(symbol) {
    try {
      const s = await fetchAlphaVantageNewsSentiment(symbol);
      // ensure 0..100 score
      const score = Math.max(0, Math.min(100, Math.round(Number(s?.score ?? 50))));
      console.log(`✅ Sentiment analysis completed for ${symbol}`);
      return { ...s, score };
    } catch (err) {
      console.warn('⚠️ Sentiment fetch failed, using placeholder:', err.message);
      console.log(`⚠️ Sentiment analysis fallback used for ${symbol}`);
      return {
        score: 50,
        source: 'placeholder',
        summary: `No external sentiment source configured or fetch failed for ${symbol}.`
      };
    }
  }

  // -------------------------------
  // WEIGHTING / SUMMARY / META
  // -------------------------------
  calculateWeightedScore(fundamental, technical, sentiment, weights) {
    const f = Number(fundamental?.score ?? 50);
    const t = Number(technical?.score ?? 50);
    const s = Number(sentiment?.score ?? 50);

    const wF = Number(weights?.fundamental ?? 33);
    const wT = Number(weights?.technical ?? 34);
    const wS = Number(weights?.sentiment ?? 33);
    const wSum = (wF + wT + wS) || 1;

    const weighted = (f * wF + t * wT + s * wS) / wSum;
    return Math.round(Math.max(0, Math.min(100, weighted)));
  }

  async generateWeightedAISummary(symbol, fundamental, technical, sentiment, weights, weightedScore) {
    // Format technical indicators for the prompt
    const formatTechnicalIndicators = (indicators) => {
      if (!indicators) return "No technical indicators available";
      
      let result = "";
      for (const [key, value] of Object.entries(indicators)) {
        if (key === 'patterns' && Array.isArray(value)) {
          result += `Patterns detected: ${value.length}\n`;
          value.forEach(pattern => {
            result += `  - ${pattern.pattern} (${pattern.direction}, confidence: ${pattern.confidence}%)\n`;
          });
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested indicator objects
          result += `${key}:\n`;
          for (const [subKey, subValue] of Object.entries(value)) {
            if (Array.isArray(subValue)) {
              // Get the last value for time series indicators
              const lastValue = subValue[subValue.length - 1];
              result += `  ${subKey}: ${typeof lastValue === 'number' ? lastValue.toFixed(4) : lastValue}\n`;
            } else {
              result += `  ${subKey}: ${subValue}\n`;
            }
          }
        } else if (Array.isArray(value)) {
          // Get the last value for simple arrays
          const lastValue = value[value.length - 1];
          result += `${key}: ${typeof lastValue === 'number' ? lastValue.toFixed(4) : lastValue}\n`;
        } else {
          result += `${key}: ${value}\n`;
        }
      }
      return result;
    };

    // Format fundamental metrics for the prompt
    const formatFundamentalMetrics = (fundamental) => {
      if (!fundamental || !fundamental.metrics) return "No fundamental metrics available";
      
      let result = "";
      for (const [key, value] of Object.entries(fundamental.metrics)) {
        result += `${key}: ${value}\n`;
      }
      return result;
    };

    const prompt = `
You are a senior equity analyst providing comprehensive investment analysis.

STOCK: ${symbol}
TIMEFRAME: Current analysis

COMPREHENSIVE ANALYSIS DATA:

FUNDAMENTAL ANALYSIS (Weight: ${weights?.fundamental}%):
Score: ${fundamental?.score}/100
Recommendation: ${fundamental?.recommendation}
Breakdown:
- Valuation: ${fundamental?.breakdown?.valuation}/100
- Growth: ${fundamental?.breakdown?.growth}/100
- Profitability: ${fundamental?.breakdown?.profitability}/100
- Leverage: ${fundamental?.breakdown?.leverage}/100
- Cashflow: ${fundamental?.breakdown?.cashflow}/100

Key Metrics:
${formatFundamentalMetrics(fundamental)}

TECHNICAL ANALYSIS (Weight: ${weights?.technical}%):
Score: ${technical?.score}/100
Recommendation: ${technical?.recommendation}
Indicators Configuration: ${JSON.stringify(technical?.configuration || {})}

Technical Indicators:
${formatTechnicalIndicators(technical?.indicators)}

SENTIMENT ANALYSIS (Weight: ${weights?.sentiment}%):
Score: ${sentiment?.score}/100
Summary: ${sentiment?.summary || 'No sentiment data available'}

OVERALL ASSESSMENT:
Weighted Score: ${weightedScore}/100
Overall Recommendation: ${this.getRecommendationFromScore(weightedScore)}

ANALYSIS REQUEST:
Provide a comprehensive investment analysis including:

1. EXECUTIVE SUMMARY: Brief overview of the investment opportunity
2. FUNDAMENTAL ASSESSMENT: Analysis of company financial health, valuation, and growth prospects
3. TECHNICAL ASSESSMENT: Price action analysis, trend identification, and key levels
4. SENTIMENT ASSESSMENT: Market psychology and news impact evaluation
5. RISK ASSESSMENT: Key risks and risk management recommendations
6. INVESTMENT RECOMMENDATION: Clear BUY/HOLD/SELL recommendation with specific price targets and time horizons
7. KEY MONITORING METRICS: What to watch going forward

Format your response with clear section headings and bullet points for readability.
`;

    // Try Gemini if available in your geminiService; otherwise fallback
    try {
      if (geminiService && typeof geminiService.generateInsights === 'function') {
        const text = await geminiService.generateInsights(prompt);
        if (typeof text === 'string' && text.trim().length > 0) return text.trim();
        if (text?.message) return String(text.message);
      }
    } catch (err) {
      console.warn('Gemini summary failed; using fallback:', err.message);
    }

    // Fallback summary (enhanced with more details)
    const rec = this.getRecommendationFromScore(weightedScore);
    return [
      `Overall ${rec} with composite score ${weightedScore}/100 based on provided weights.`,
      `Fundamentals: ${fundamental?.score ?? 50}/100 (${fundamental?.recommendation || '—'})`,
      `Technicals: ${technical?.score ?? 50}/100 (${technical?.recommendation || '—'})`,
      `Sentiment: ${sentiment?.score ?? 50}/100`,
      fundamental?.notes ? `Fundamental note: ${fundamental.notes}` : null,
      sentiment?.summary ? `Sentiment: ${sentiment.summary}` : null,
      `Analysis includes ${Object.keys(technical?.indicators || {}).length} technical indicators`
    ].filter(Boolean).join('\n');
  }

  calculateConfidenceLevel(score) {
    if (score >= 75) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  calculateRiskLevel(fundamental, technical, sentiment) {
    // simple dispersion-based risk
    const f = Number(fundamental?.score ?? 50);
    const t = Number(technical?.score ?? 50);
    const s = Number(sentiment?.score ?? 50);
    const avg = (f + t + s) / 3;
    const variance = ((f - avg) ** 2 + (t - avg) ** 2 + (s - avg) ** 2) / 3;
    if (variance < 100) return 'low';
    if (variance < 225) return 'medium';
    return 'elevated';
  }

  getRecommendationFromScore(score) {
    if (score >= 70) return 'BUY';
    if (score >= 50) return 'HOLD';
    return 'SELL';
  }
}

module.exports = new AnalysisService();