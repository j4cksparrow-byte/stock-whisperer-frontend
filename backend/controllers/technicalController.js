const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class TechnicalController {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Valid timeframes
    this.validTimeframes = {
      '1D': { label: '1 Day', alphavantage: 'TIME_SERIES_INTRADAY', interval: '60min' },
      '5D': { label: '5 Days', alphavantage: 'TIME_SERIES_DAILY', days: 5 },
      '1M': { label: '1 Month', alphavantage: 'TIME_SERIES_DAILY', days: 30 },
      '3M': { label: '3 Months', alphavantage: 'TIME_SERIES_DAILY', days: 90 },
      '6M': { label: '6 Months', alphavantage: 'TIME_SERIES_DAILY', days: 180 },
      '1Y': { label: '1 Year', alphavantage: 'TIME_SERIES_DAILY', days: 365 },
      '2Y': { label: '2 Years', alphavantage: 'TIME_SERIES_WEEKLY', days: 730 }
    };
  }

  // Get technical analysis with timeframe options
  async getTechnicalAnalysis(req, res) {
    try {
      const { symbol } = req.params;
      const timeframe = req.query.timeframe || '1M'; // Default to 1 month
      const stockSymbol = symbol.toUpperCase();

      // Validate timeframe
      if (!this.validTimeframes[timeframe]) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid timeframe. Valid options: ${Object.keys(this.validTimeframes).join(', ')}`,
          availableTimeframes: this.validTimeframes
        });
      }

      console.log(`📊 Fetching technical analysis for: ${stockSymbol} (${timeframe})`);

      // Get historical data for the specified timeframe
      const historicalData = await this.fetchHistoricalData(stockSymbol, timeframe);
      
      // Calculate technical indicators based on historical data
      const technicalIndicators = this.calculateTechnicalIndicators(historicalData, timeframe);

      // Generate AI technical analysis
      const aiTechnicalAnalysis = await this.generateTechnicalAIAnalysis(
        stockSymbol, 
        technicalIndicators,
        timeframe
      );

      const response = {
        status: 'success',
        symbol: stockSymbol,
        timeframe: {
          selected: timeframe,
          label: this.validTimeframes[timeframe].label
        },
        timestamp: new Date().toISOString(),
        data: {
          currentPrice: historicalData.current.price,
          priceChange: historicalData.current.change,
          priceChangePercent: historicalData.current.changePercent,
          period: {
            startDate: historicalData.startDate,
            endDate: historicalData.endDate,
            dataPoints: historicalData.prices.length
          },
          technicalIndicators,
          aiTechnicalAnalysis,
          signals: this.generateTradingSignals(technicalIndicators, timeframe),
          chart: {
            prices: historicalData.prices.slice(-20), // Last 20 data points for mini chart
            volumes: historicalData.volumes.slice(-20)
          }
        },
        availableTimeframes: Object.keys(this.validTimeframes),
        disclaimer: "Technical indicators calculated for educational purposes"
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Technical analysis error:', error.message);
      res.status(500).json({
        status: 'error',
        message: error.message,
        symbol: req.params.symbol,
        timeframe: req.query.timeframe
      });
    }
  }

  // Fetch historical data based on timeframe
  async fetchHistoricalData(symbol, timeframe) {
    try {
      // For demo purposes, we'll use daily data and simulate different timeframes
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY,
          outputsize: timeframe === '2Y' ? 'full' : 'compact'
        }
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('Historical data not available');
      }

      // Convert to array and sort by date
      const dates = Object.keys(timeSeries).sort();
      const config = this.validTimeframes[timeframe];
      
      // Filter data based on timeframe
      const endDate = dates[dates.length - 1];
      const startDate = this.calculateStartDate(endDate, config.days || 30);
      const filteredDates = dates.filter(date => date >= startDate);

      const prices = [];
      const volumes = [];
      const highs = [];
      const lows = [];
      const closes = [];

      filteredDates.forEach(date => {
        const data = timeSeries[date];
        const close = parseFloat(data['4. close']);
        closes.push(close);
        prices.push({
          date,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close,
          volume: parseInt(data['5. volume'])
        });
        volumes.push(parseInt(data['5. volume']));
        highs.push(parseFloat(data['2. high']));
        lows.push(parseFloat(data['3. low']));
      });

      // Current price info
      const latestData = timeSeries[dates[dates.length - 1]];
      const previousData = timeSeries[dates[dates.length - 2]];
      const currentPrice = parseFloat(latestData['4. close']);
      const previousPrice = parseFloat(previousData['4. close']);
      const change = currentPrice - previousPrice;
      const changePercent = ((change / previousPrice) * 100).toFixed(2) + '%';

      return {
        current: {
          price: currentPrice,
          change: parseFloat(change.toFixed(2)),
          changePercent
        },
        prices,
        volumes,
        closes,
        highs,
        lows,
        startDate: filteredDates[0],
        endDate: filteredDates[filteredDates.length - 1]
      };

    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      // Return mock data if API fails
      return this.generateMockHistoricalData(symbol, timeframe);
    }
  }

  // Calculate technical indicators based on historical data
  calculateTechnicalIndicators(data, timeframe) {
    const closes = data.closes;
    const volumes = data.volumes;
    const currentPrice = data.current.price;

    // Calculate RSI (14-period default)
    const rsi = this.calculateRSI(closes, 14);
    
    // Calculate Moving Averages
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    
    // Calculate MACD
    const macd = this.calculateMACD(ema12, ema26);
    
    // Calculate Bollinger Bands
    const bb = this.calculateBollingerBands(closes, 20);
    
    // Volume analysis
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];

    return {
      rsi: {
        current: rsi,
        signal: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL',
        interpretation: this.interpretRSI(rsi),
        period: 14
      },
      movingAverages: {
        sma20: sma20,
        sma50: sma50,
        ema12: ema12,
        ema26: ema26,
        trend: sma20 > sma50 ? 'UPTREND' : 'DOWNTREND',
        strength: Math.abs(((sma20 - sma50) / sma50) * 100).toFixed(2) + '%'
      },
      macd: {
        line: macd.line,
        signal: macd.signal,
        histogram: macd.histogram,
        crossover: macd.line > macd.signal ? 'BULLISH' : 'BEARISH',
        interpretation: this.interpretMACD(macd.line, macd.signal, macd.histogram)
      },
      bollingerBands: {
        upper: bb.upper,
        middle: bb.middle,
        lower: bb.lower,
        position: currentPrice > bb.upper ? 'ABOVE_UPPER' : 
                 currentPrice < bb.lower ? 'BELOW_LOWER' : 'WITHIN_BANDS',
        squeeze: ((bb.upper - bb.lower) / bb.middle * 100).toFixed(2) + '%'
      },
      volume: {
        current: currentVolume,
        average: Math.floor(avgVolume),
        ratio: (currentVolume / avgVolume).toFixed(2),
        status: currentVolume > avgVolume * 1.5 ? 'HIGH' : 
                currentVolume < avgVolume * 0.5 ? 'LOW' : 'NORMAL'
      },
      timeframe: {
        period: timeframe,
        dataPoints: closes.length,
        label: this.validTimeframes[timeframe].label
      }
    };
  }

  // Technical indicator calculation methods
  calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50; // Default neutral RSI
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
  }

  calculateSMA(closes, period) {
    if (closes.length < period) return closes[closes.length - 1];
    const relevant = closes.slice(-period);
    return parseFloat((relevant.reduce((sum, price) => sum + price, 0) / period).toFixed(2));
  }

  calculateEMA(closes, period) {
    if (closes.length < period) return this.calculateSMA(closes, period);
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(closes.slice(0, period), period);
    
    for (let i = period; i < closes.length; i++) {
      ema = (closes[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return parseFloat(ema.toFixed(2));
  }

  calculateMACD(ema12, ema26) {
    const line = parseFloat((ema12 - ema26).toFixed(3));
    const signal = parseFloat((line * 0.8).toFixed(3)); // Simplified signal calculation
    const histogram = parseFloat((line - signal).toFixed(3));
    
    return { line, signal, histogram };
  }

  calculateBollingerBands(closes, period = 20) {
    const sma = this.calculateSMA(closes, period);
    const relevant = closes.slice(-period);
    
    const variance = relevant.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: parseFloat((sma + (stdDev * 2)).toFixed(2)),
      middle: sma,
      lower: parseFloat((sma - (stdDev * 2)).toFixed(2))
    };
  }

  calculateStartDate(endDate, days) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  // Generate mock data fallback
  generateMockHistoricalData(symbol, timeframe) {
    const days = this.validTimeframes[timeframe].days || 30;
    const basePrice = 100 + Math.random() * 100;
    const prices = [];
    const volumes = [];
    const closes = [];
    
    for (let i = 0; i < days; i++) {
      const price = basePrice + (Math.random() - 0.5) * 20;
      const volume = 1000000 + Math.random() * 5000000;
      closes.push(price);
      volumes.push(Math.floor(volume));
      
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      prices.push({
        date: date.toISOString().split('T')[0],
        close: price,
        volume: Math.floor(volume)
      });
    }
    
    return {
      current: {
        price: closes[closes.length - 1],
        change: closes[closes.length - 1] - closes[closes.length - 2],
        changePercent: (((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100).toFixed(2) + '%'
      },
      prices,
      volumes,
      closes,
      startDate: prices[0].date,
      endDate: prices[prices.length - 1].date
    };
  }

  // Enhanced AI analysis with timeframe context
  async generateTechnicalAIAnalysis(symbol, indicators, timeframe) {
    const prompt = `
      Technical Analysis for ${symbol} over ${this.validTimeframes[timeframe].label}:
      
      RSI (14): ${indicators.rsi.current} (${indicators.rsi.signal})
      MACD: ${indicators.macd.line} vs Signal: ${indicators.macd.signal} (${indicators.macd.crossover})
      Moving Averages: SMA20: ${indicators.movingAverages.sma20}, SMA50: ${indicators.movingAverages.sma50} (${indicators.movingAverages.trend})
      Bollinger Bands: Price ${indicators.bollingerBands.position.toLowerCase().replace('_', ' ')}
      Volume: ${indicators.volume.status} (${indicators.volume.ratio}x average)
      Timeframe: ${timeframe} (${indicators.timeframe.dataPoints} data points)

      Provide analysis in EXACT JSON format:
      {"technicalSentiment":"bullish/bearish/neutral","keySignals":["signal1","signal2","signal3"],"momentum":"strong/weak/neutral","recommendation":"BUY/SELL/HOLD","confidenceLevel":"high/medium/low","timeframeBias":"short-term/medium-term/long-term outlook","priceTarget":"target with reasoning","riskLevel":"low/medium/high"}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      let response = await result.response.text();
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(response);
    } catch (error) {
      return {
        technicalSentiment: indicators.movingAverages.trend === 'UPTREND' ? "bullish" : "bearish",
        keySignals: [
          `RSI at ${indicators.rsi.current} (${indicators.rsi.signal.toLowerCase()})`,
          `MACD ${indicators.macd.crossover.toLowerCase()} crossover`,
          `${indicators.movingAverages.trend.toLowerCase()} confirmed`
        ],
        momentum: indicators.rsi.current > 60 || indicators.rsi.current < 40 ? "strong" : "neutral",
        recommendation: this.getRecommendationFromIndicators(indicators),
        confidenceLevel: "medium",
        timeframeBias: this.getTimeframeBias(timeframe),
        priceTarget: "Based on technical levels and momentum",
        riskLevel: indicators.volume.status === 'HIGH' ? "medium" : "low"
      };
    }
  }

  getRecommendationFromIndicators(indicators) {
    let bullishSignals = 0;
    let bearishSignals = 0;

    // RSI signals
    if (indicators.rsi.current < 30) bullishSignals++;
    if (indicators.rsi.current > 70) bearishSignals++;

    // Trend signals
    if (indicators.movingAverages.trend === 'UPTREND') bullishSignals++;
    else bearishSignals++;

    // MACD signals
    if (indicators.macd.crossover === 'BULLISH') bullishSignals++;
    else bearishSignals++;

    if (bullishSignals > bearishSignals) return 'BUY';
    if (bearishSignals > bullishSignals) return 'SELL';
    return 'HOLD';
  }

  getTimeframeBias(timeframe) {
    if (['1D', '5D'].includes(timeframe)) return 'short-term';
    if (['1M', '3M'].includes(timeframe)) return 'medium-term';
    return 'long-term';
  }

  // Enhanced trading signals with timeframe consideration
  generateTradingSignals(indicators, timeframe) {
    const signals = [];
    const timeframeBias = this.getTimeframeBias(timeframe);
    
    // Strong signals based on multiple confirmations
    if (indicators.rsi.current < 30 && 
        indicators.macd.crossover === 'BULLISH' && 
        indicators.bollingerBands.position === 'BELOW_LOWER') {
      signals.push({
        type: 'STRONG BUY',
        strength: 'HIGH',
        reason: `Triple confirmation: RSI oversold + MACD bullish + below Bollinger lower band (${timeframeBias})`,
        timeframe: timeframe
      });
    }
    
    if (indicators.rsi.current > 70 && 
        indicators.macd.crossover === 'BEARISH' && 
        indicators.bollingerBands.position === 'ABOVE_UPPER') {
      signals.push({
        type: 'STRONG SELL',
        strength: 'HIGH',
        reason: `Triple confirmation: RSI overbought + MACD bearish + above Bollinger upper band (${timeframeBias})`,
        timeframe: timeframe
      });
    }

    // Volume confirmation
    if (indicators.volume.status === 'HIGH') {
      signals.push({
        type: 'VOLUME ALERT',
        strength: 'MEDIUM',
        reason: `High volume (${indicators.volume.ratio}x average) confirms price movement`,
        timeframe: timeframe
      });
    }

    // Trend signals
    if (indicators.movingAverages.trend === 'UPTREND' && parseFloat(indicators.movingAverages.strength) > 3) {
      signals.push({
        type: 'TREND BUY',
        strength: 'MEDIUM',
        reason: `Strong uptrend confirmed (${indicators.movingAverages.strength} separation) - ${timeframeBias}`,
        timeframe: timeframe
      });
    }

    // Default signal if none found
    if (signals.length === 0) {
      signals.push({
        type: 'HOLD',
        strength: 'NEUTRAL',
        reason: `Mixed signals across ${timeframeBias} indicators - wait for clearer direction`,
        timeframe: timeframe
      });
    }

    return signals;
  }

  // Helper methods (keeping the original ones)
  interpretRSI(rsi) {
    if (rsi > 80) return "Extremely overbought - strong sell signal";
    if (rsi > 70) return "Overbought - consider taking profits";
    if (rsi < 20) return "Extremely oversold - strong buy signal";
    if (rsi < 30) return "Oversold - potential buying opportunity";
    if (rsi > 50) return "Bullish momentum - above midline";
    return "Bearish momentum - below midline";
  }

  interpretMACD(line, signal, histogram) {
    if (line > signal && histogram > 0) return "Strong bullish momentum - MACD above signal line with positive histogram";
    if (line < signal && histogram < 0) return "Strong bearish momentum - MACD below signal line with negative histogram";
    if (line > signal) return "Bullish crossover - momentum turning positive";
    return "Bearish crossover - momentum turning negative";
  }
}

module.exports = new TechnicalController();
