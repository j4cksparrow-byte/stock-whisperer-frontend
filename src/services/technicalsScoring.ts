import { safeNumber, roundToDecimal } from '../utils/normalize';
import { PillarScore } from '../types/stockTypes';

// Technical indicator weights and max scores
interface IndicatorConfig {
  maxScore: number;
  weight: number;
}

interface TechnicalConfig {
  rsi: IndicatorConfig;
  macd: IndicatorConfig;
  bollingerBands: IndicatorConfig;
  stochastic: IndicatorConfig;
}

// Default configuration - can be customized
const DEFAULT_CONFIG: TechnicalConfig = {
  rsi: { maxScore: 15, weight: 0.25 },
  macd: { maxScore: 15, weight: 0.25 },
  bollingerBands: { maxScore: 10, weight: 0.20 },
  stochastic: { maxScore: 10, weight: 0.30 }
};

// Signal types
type Signal = 'buy' | 'neutral' | 'sell';

// Convert signal to numeric value
const getSignalValue = (signal: Signal): number => {
  switch (signal) {
    case 'buy': return 1;
    case 'neutral': return 0;
    case 'sell': return -1;
  }
};

export const scoreTechnicals = (data: any, config: TechnicalConfig = DEFAULT_CONFIG): PillarScore => {
  const notes: string[] = [];
  const subscores: Record<string, number | null> = {};
  const dataUsed: Record<string, unknown> = {};

  // Extract daily price series and high/low data for better indicators
  let closePrices: number[] = [];
  let highPrices: number[] = [];
  let lowPrices: number[] = [];
  let volumes: number[] = [];
  let hasLimitedHistory = false;

  if (data.dailySeries?.['Time Series (Daily)'] && !data.dailySeries?.isPremium && !data.dailySeries?.isEmpty && !data.dailySeries?.isInvalid) {
    const dailyData = data.dailySeries['Time Series (Daily)'];
    const sortedDates = Object.keys(dailyData).sort(); // Ascending order
    
    closePrices = sortedDates.map(date => 
      safeNumber(dailyData[date]['4. close']) || 0
    ).filter(price => price > 0);

    highPrices = sortedDates.map(date => 
      safeNumber(dailyData[date]['2. high']) || 0
    ).filter(price => price > 0);

    lowPrices = sortedDates.map(date => 
      safeNumber(dailyData[date]['3. low']) || 0
    ).filter(price => price > 0);

    volumes = sortedDates.map(date => 
      safeNumber(dailyData[date]['5. volume']) || 0
    ).filter(vol => vol > 0);
    
    // Check if we have enough history
    if (closePrices.length < 50) {
      hasLimitedHistory = true;
      notes.push("Limited price history - some indicators may be less reliable");
    }
  } else {
    // Handle API errors
    if (data.dailySeries?.isPremium) {
      notes.push("Premium Alpha Vantage subscription required for daily price data");
    } else if (data.dailySeries?.isEmpty) {
      notes.push("Empty response from daily price API");
    } else if (data.dailySeries?.isInvalid) {
      notes.push("Invalid ticker symbol for daily price data");
    } else {
      notes.push("No daily price data available");
    }
  }

  // If insufficient data, return neutral score
  if (closePrices.length < 14) {
    notes.push("Insufficient price data for technical analysis");
    return {
      score: 50, // Neutral score
      subscores: { rsi: null, macd: null, bollingerBands: null, stochastic: null },
      data_used: { daysOfData: closePrices.length },
      notes
    };
  }

  const currentClose = closePrices[closePrices.length - 1];
  dataUsed.currentClose = currentClose;
  dataUsed.daysOfData = closePrices.length;

  // Calculate Simple Moving Average
  const calculateSMA = (prices: number[], period: number): number => {
    if (prices.length < period) return 0;
    const recent = prices.slice(-period);
    return recent.reduce((sum, price) => sum + price, 0) / period;
  };

  // Calculate Exponential Moving Average
  const calculateEMA = (prices: number[], period: number): number[] => {
    if (prices.length < period) return [];
    
    const k = 2 / (period + 1);
    const emas: number[] = [];
    
    // Start with SMA for first value
    emas.push(calculateSMA(prices.slice(0, period), period));
    
    // Calculate remaining EMAs
    for (let i = period; i < prices.length; i++) {
      const ema = (prices[i] * k) + (emas[emas.length - 1] * (1 - k));
      emas.push(ema);
    }
    
    return emas;
  };

  // 1. RSI Calculation and Signal
  const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const rsi = calculateRSI(closePrices, 14);
  dataUsed.rsi = rsi;

  let rsiSignal: Signal;
  if (rsi < 30) {
    rsiSignal = 'buy';
    notes.push("RSI oversold - buy signal");
  } else if (rsi > 70) {
    rsiSignal = 'sell';
    notes.push("RSI overbought - sell signal");
  } else {
    rsiSignal = 'neutral';
    notes.push("RSI in neutral zone");
  }
  subscores.rsi = getSignalValue(rsiSignal) * config.rsi.maxScore;

  // 2. MACD Calculation and Signal
  let macdSignal: Signal = 'neutral';
  let macdValue = 0;
  
  if (closePrices.length >= 26) {
    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);
    
    if (ema12.length > 0 && ema26.length > 0) {
      const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];
      const macdHistory = ema12.slice(-9).map((val, i) => val - ema26[ema26.length - 9 + i]);
      const signalLine = calculateSMA(macdHistory, 9);
      
      macdValue = macdLine - signalLine;
      dataUsed.macd = { line: macdLine, signal: signalLine, histogram: macdValue };
      
      if (macdValue > 0 && macdLine > signalLine) {
        macdSignal = 'buy';
        notes.push("MACD bullish crossover - buy signal");
      } else if (macdValue < 0 && macdLine < signalLine) {
        macdSignal = 'sell';
        notes.push("MACD bearish crossover - sell signal");
      } else {
        notes.push("MACD neutral");
      }
    }
  } else {
    notes.push("Insufficient data for MACD calculation");
  }
  subscores.macd = getSignalValue(macdSignal) * config.macd.maxScore;

  // 3. Bollinger Bands Calculation and Signal
  let bbSignal: Signal = 'neutral';
  
  if (closePrices.length >= 20) {
    const sma20 = calculateSMA(closePrices.slice(-20), 20);
    const variance = closePrices.slice(-20).reduce((acc, price) => 
      acc + Math.pow(price - sma20, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    
    const upperBand = sma20 + (2 * stdDev);
    const lowerBand = sma20 - (2 * stdDev);
    
    dataUsed.bollingerBands = { upper: upperBand, middle: sma20, lower: lowerBand };
    
    if (currentClose <= lowerBand) {
      bbSignal = 'buy';
      notes.push("Price at lower Bollinger Band - buy signal");
    } else if (currentClose >= upperBand) {
      bbSignal = 'sell';
      notes.push("Price at upper Bollinger Band - sell signal");
    } else {
      notes.push("Price within Bollinger Bands - neutral");
    }
  } else {
    notes.push("Insufficient data for Bollinger Bands calculation");
  }
  subscores.bollingerBands = getSignalValue(bbSignal) * config.bollingerBands.maxScore;

  // 4. Stochastic Oscillator Calculation and Signal
  let stochSignal: Signal = 'neutral';
  
  if (highPrices.length >= 14 && lowPrices.length >= 14) {
    const period = 14;
    const recentHighs = highPrices.slice(-period);
    const recentLows = lowPrices.slice(-period);
    const recentCloses = closePrices.slice(-period);
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    const kPercent = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    // Calculate %D (3-period SMA of %K)
    const kValues = [];
    for (let i = period - 3; i < period; i++) {
      const periodHighs = highPrices.slice(i - period + 1, i + 1);
      const periodLows = lowPrices.slice(i - period + 1, i + 1);
      const periodClose = closePrices[i];
      
      const high = Math.max(...periodHighs);
      const low = Math.min(...periodLows);
      
      kValues.push(((periodClose - low) / (high - low)) * 100);
    }
    
    const dPercent = kValues.reduce((sum, val) => sum + val, 0) / kValues.length;
    
    dataUsed.stochastic = { k: kPercent, d: dPercent };
    
    if (kPercent < 20 && dPercent < 20) {
      stochSignal = 'buy';
      notes.push("Stochastic oversold - buy signal");
    } else if (kPercent > 80 && dPercent > 80) {
      stochSignal = 'sell';
      notes.push("Stochastic overbought - sell signal");
    } else {
      notes.push("Stochastic in normal range - neutral");
    }
  } else {
    notes.push("Insufficient data for Stochastic calculation");
  }
  subscores.stochastic = getSignalValue(stochSignal) * config.stochastic.maxScore;

  // Calculate raw score using signal-based approach
  const rawScore = (subscores.rsi || 0) + (subscores.macd || 0) + 
                   (subscores.bollingerBands || 0) + (subscores.stochastic || 0);
  
  const maxPossibleScore = config.rsi.maxScore + config.macd.maxScore + 
                          config.bollingerBands.maxScore + config.stochastic.maxScore;

  // Normalize to 0-100 scale using the formula from the example
  const normalizedScore = ((rawScore + maxPossibleScore) / (2 * maxPossibleScore)) * 100;

  // Apply weighted scoring if needed (alternative approach)
  const weightedScore = 
    ((subscores.rsi || 0) * config.rsi.weight) +
    ((subscores.macd || 0) * config.macd.weight) +
    ((subscores.bollingerBands || 0) * config.bollingerBands.weight) +
    ((subscores.stochastic || 0) * config.stochastic.weight);

  const maxWeightedScore = 
    (config.rsi.maxScore * config.rsi.weight) +
    (config.macd.maxScore * config.macd.weight) +
    (config.bollingerBands.maxScore * config.bollingerBands.weight) +
    (config.stochastic.maxScore * config.stochastic.weight);

  const weightedNormalizedScore = ((weightedScore + maxWeightedScore) / (2 * maxWeightedScore)) * 100;

  // Use weighted approach as it's more sophisticated
  const finalScore = Math.max(0, Math.min(100, weightedNormalizedScore));

  // Store calculation details
  dataUsed.calculation = {
    rawScore,
    maxPossibleScore,
    normalizedScore,
    weightedScore,
    maxWeightedScore,
    finalScore
  };

  // Adjust for limited history
  let adjustedScore = finalScore;
  if (hasLimitedHistory) {
    adjustedScore = Math.min(finalScore, 65); // Cap score for limited data
    notes.push("Score adjusted for limited historical data");
  }

  return {
    score: roundToDecimal(adjustedScore),
    subscores,
    data_used: dataUsed,
    notes
  };
};
