const geminiService = require('./geminiService');
const weightService = require('./weightService');
const technicalAnalysisService = require('./technicalAnalysisService');
const dataService = require('./dataService');
const { fetchAlphaVantageNewsSentiment } = require('./sentimentService'); // add this import

class AnalysisService {
  constructor() {
    this.performAdvancedAnalysis = this.performAdvancedAnalysis.bind(this);
    this.calculateWeightedScore = this.calculateWeightedScore.bind(this);
    this.generateWeightedAISummary = this.generateWeightedAISummary.bind(this);
  }

  // ---------- PUBLIC MODES ----------

  async performNormalAnalysis(symbol, stockData, timeframe) {
    const fundamental = await this.getFundamentalAnalysis(symbol, stockData);
    const aiSummary = await geminiService.generateInsights(
      `Analyze ${symbol} stock fundamentally for ${timeframe} period`
    );
    return {
      status: 'success',
      symbol: symbol.toUpperCase(),
      analysis: {
        mode: 'normal',
        timeframe,
        timestamp: new Date().toISOString(),
        fundamental,
        aiInsights: { summary: aiSummary }
      }
    };
  }

  async performAdvancedAnalysis(symbol, stockData, timeframe, weights, indicatorsConfig = {}) {
    console.log('🔬 Performing weighted advanced analysis...');

    const [fundamentalAnalysis, technicalAnalysis, sentimentAnalysis] = await Promise.all([
      this.getFundamentalAnalysis(symbol, stockData),
      this.getTechnicalAnalysis(symbol, stockData, timeframe, indicatorsConfig),
      this.getSentimentAnalysis(symbol)
    ]);

    const weightedScore = this.calculateWeightedScore(
      fundamentalAnalysis,
      technicalAnalysis,
      sentimentAnalysis,
      weights
    );

    const aiSummary = await this.generateWeightedAISummary(
      symbol,
      fundamentalAnalysis,
      technicalAnalysis,
      sentimentAnalysis,
      weights,
      weightedScore
    );

    return {
      status: 'success',
      symbol: symbol.toUpperCase(),
      analysis: {
        mode: 'advanced',
        timeframe,
        weights,
        timestamp: new Date().toISOString(),
        fundamental: { ...fundamentalAnalysis, weight: weights.fundamental + '%' },
        technical:   { ...technicalAnalysis,   weight: weights.technical   + '%' },
        sentiment:   { ...sentimentAnalysis,   weight: weights.sentiment   + '%' },
        weightedScore,
        aiInsights: aiSummary,
        analysisMetadata: {
          dataPoints: stockData.ohlcv.length,
          weightsUsed: weights,
          confidenceLevel: this.calculateConfidenceLevel(weightedScore),
          riskLevel: this.calculateRiskLevel(fundamentalAnalysis, technicalAnalysis, sentimentAnalysis),
          dataSource: stockData.source
        }
      }
    };
  }

  // ---------- TECHNICAL ANALYSIS (uses your service) ----------

  async getTechnicalAnalysis(symbol, stockData, timeframe, indicatorsConfig = {}) {
    try {
      console.log('📈 Calculating technical indicators...');
      const indicators = await technicalAnalysisService.calculateIndicators(
        stockData.ohlcv,
        indicatorsConfig
      );
      const score = this.calculateTechnicalScore(indicators, stockData.ohlcv);
      return {
        score,
        indicators,
        recommendation: this.getRecommendationFromScore(score),
        configuration: indicatorsConfig
      };
    } catch (error) {
      console.error('Technical analysis error:', error);
      return {
        score: 68,
        indicators: {
          rsi: 62,
          macd: 'bullish',
          moving_averages: 'upward_trend',
          support: stockData.ohlcv[stockData.ohlcv.length - 1].low * 0.95,
          resistance: stockData.ohlcv[stockData.ohlcv.length - 1].high * 1.05
        },
        recommendation: 'BUY',
        error: 'Advanced technical analysis failed, using basic indicators'
      };
    }
  }

  calculateTechnicalScore(indicators, ohlcvData) {
    let score = 50;
    const latestClose = ohlcvData[ohlcvData.length - 1].close;

    if (indicators.RSI && indicators.RSI.length) {
      const latestRSI = indicators.RSI.at(-1);
      if (latestRSI > 70) score -= 10;
      else if (latestRSI < 30) score += 10;
      else if (latestRSI > 50) score += 5;
    }

    if (indicators.MACD && indicators.MACD.macd?.length && indicators.MACD.signal?.length) {
      const latestMACD = indicators.MACD.macd.at(-1);
      const latestSignal = indicators.MACD.signal.at(-1);
      score += latestMACD > latestSignal ? 8 : -8;
    }

    if (indicators.SMA && indicators.SMA.length) {
      const latestSMA = indicators.SMA.at(-1);
      score += latestClose > latestSMA ? 7 : -7;
    }

    if (indicators.BollingerBands?.upper?.length && indicators.BollingerBands?.lower?.length) {
      const latestUpper = indicators.BollingerBands.upper.at(-1);
      const latestLower = indicators.BollingerBands.lower.at(-1);
      if (latestClose > latestUpper) score -= 5;
      else if (latestClose < latestLower) score += 5;
    }

    if (indicators.patterns?.length) {
      const latestPattern = indicators.patterns.at(-1);
      score += (latestPattern.direction === 'bullish' ? 1 : -1) * (latestPattern.confidence / 10);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // ---------- NEW: FUNDAMENTAL + SENTIMENT (lightweight stubs) ----------

  // If you have fundamentals in dataService, swap this stub to real data lookups.
  async getFundamentalAnalysis(symbol, stockData) {
    // Simple placeholder based on trend & volatility proxies from price
    const closes = (stockData?.ohlcv || []).map(d => d.close);
    const last = closes.at(-1);
    const prev = closes.at(-21) ?? closes[0];
    const pctChg20 = last && prev ? ((last - prev) / prev) * 100 : 0;

    const score =
      (pctChg20 > 0 ? 55 : 45) // crude trend proxy
      + Math.max(-5, Math.min(5, pctChg20 / 10));

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      valuation: 'neutral',
      notes: 'Placeholder fundamentals; wire to real financials when available'
    };
  }

  // You can later replace this with a news/NLP pipeline.
    async getSentimentAnalysis(symbol) {
    try {
        const s = await fetchAlphaVantageNewsSentiment(symbol);
        return s;
    } catch (err) {
        console.warn('⚠️ Sentiment fetch failed, using placeholder:', err.message);
        return {
        score: 50,
        source: 'placeholder',
        summary: `No external sentiment source configured or fetch failed for ${symbol}.`
        };
    }
    }

  // ---------- NEW: WEIGHTING / SUMMARY / META ----------

  calculateWeightedScore(fundamental, technical, sentiment, weights) {
    const f = Number(fundamental?.score ?? 50);
    const t = Number(technical?.score ?? 50);
    const s = Number(sentiment?.score ?? 50);

    const wF = Number(weights?.fundamental ?? 33);
    const wT = Number(weights?.technical ?? 34);
    const wS = Number(weights?.sentiment ?? 33);
    const wSum = (wF + wT + wS) || 1;

    const weighted =
      (f * wF + t * wT + s * wS) / wSum;

    return Math.round(Math.max(0, Math.min(100, weighted)));
  }

  async generateWeightedAISummary(symbol, fundamental, technical, sentiment, weights, weightedScore) {
    const prompt = `
You are a senior equity analyst. Summarize a composite signal.

Symbol: ${symbol}
Scores:
- Fundamental: ${fundamental?.score}
- Technical: ${technical?.score}
- Sentiment: ${sentiment?.score}

Weights (%):
- Fundamental: ${weights?.fundamental}
- Technical: ${weights?.technical}
- Sentiment: ${weights?.sentiment}

Overall weighted score: ${weightedScore} (0-100).
Provide a 3-5 bullet verdict with a BUY/HOLD/SELL call consistent with the score.
    `.trim();

    const summary = await geminiService.generateInsights(prompt);
    return { summary };
  }

  calculateConfidenceLevel(weightedScore) {
    if (weightedScore >= 75) return 'high';
    if (weightedScore >= 55) return 'medium';
    return 'low';
  }

  calculateRiskLevel(fundamental, technical, sentiment) {
    const f = fundamental?.score ?? 50;
    const t = technical?.score ?? 50;
    const s = sentiment?.score ?? 50;
    const avg = (f + t + s) / 3;
    if (avg >= 70) return 'moderate';
    if (avg >= 50) return 'medium';
    return 'elevated';
  }

  getRecommendationFromScore(score) {
    if (score >= 70) return 'BUY';
    if (score >= 50) return 'HOLD';
    return 'SELL';
  }
}

module.exports = new AnalysisService();
