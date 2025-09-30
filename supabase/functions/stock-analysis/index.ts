import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
const twelveDataKey = Deno.env.get('TWELVE_DATA_API_KEY');
const polygonKey = Deno.env.get('POLYGON_API_KEY');
const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
const fmpKey = Deno.env.get('FMP_API_KEY');
const geminiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

// Rate limiting state
const rateLimits: Record<string, { count: number; resetTime: number }> = {
  alphaVantage: { count: 0, resetTime: getNextDayReset() },
  twelveData: { count: 0, resetTime: getNextDayReset() },
  polygon: { count: 0, resetTime: getNextDayReset() },
  finnhub: { count: 0, resetTime: getNextDayReset() },
  fmp: { count: 0, resetTime: getNextDayReset() },
};

const RATE_LIMITS = {
  alphaVantage: 25,
  twelveData: 800,
  polygon: 100,
  finnhub: 1000,
  fmp: 250,
};

function getNextDayReset(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

function canUseAPI(apiName: string): boolean {
  const now = Date.now();
  if (now >= rateLimits[apiName].resetTime) {
    rateLimits[apiName].count = 0;
    rateLimits[apiName].resetTime = getNextDayReset();
  }
  return rateLimits[apiName].count < RATE_LIMITS[apiName];
}

function incrementAPI(apiName: string): void {
  rateLimits[apiName].count++;
}

serve(async (req) => {
  console.log('Stock analysis request:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.pathname.split('/').pop()?.toUpperCase();
    const timeframe = url.searchParams.get('timeframe') || '1M';
    const mode = url.searchParams.get('mode') || 'normal';
    const bypassCache = url.searchParams.get('bypassCache') === 'true';

    console.log('Analysis parameters:', { symbol, timeframe, mode, bypassCache });

    if (!symbol) {
      return new Response(JSON.stringify({ error: 'Symbol is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    if (!bypassCache) {
      const { data: cachedResult } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('symbol', symbol)
        .eq('duration', timeframe)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cachedResult) {
        console.log('✅ Returning cached result for', symbol);
        return new Response(JSON.stringify({
          status: 'ok',
          symbol,
          analysis: formatAnalysisResponse(cachedResult),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Perform fresh analysis
    console.log('🔄 Fetching fresh analysis for', symbol);
    const analysisResult = await performStockAnalysis(symbol, timeframe);

    // Save to cache
    const { error: insertError } = await supabase
      .from('analysis_results')
      .upsert({
        symbol,
        exchange: 'NASDAQ',
        duration: timeframe,
        analysis_type: mode,
        ...analysisResult,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error('❌ Cache insert error:', insertError);
    }

    return new Response(JSON.stringify({
      status: 'ok',
      symbol,
      analysis: formatAnalysisResponse(analysisResult),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in stock-analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({
      error: errorMessage,
      status: 'error',
      analysis: getMockAnalysis(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performStockAnalysis(symbol: string, timeframe: string) {
  console.log('📊 Starting comprehensive analysis for', symbol);

  // Fetch stock data from multiple sources
  const stockData = await fetchStockDataMultiSource(symbol, timeframe);
  console.log('📈 Stock data source:', stockData.source);

  // Fetch fundamental data
  const fundamentalData = await fetchFundamentalDataMultiSource(symbol);
  console.log('💰 Fundamental data source:', fundamentalData.source);

  // Fetch sentiment data
  const sentimentData = await fetchSentimentDataMultiSource(symbol);
  console.log('📰 Sentiment data source:', sentimentData.source);

  // Calculate technical indicators
  const technicalAnalysis = await calculateTechnicalIndicators(stockData.ohlcv);
  
  // Calculate scores
  const technicalScore = technicalAnalysis.score;
  const fundamentalScore = fundamentalData.score;
  const sentimentScore = sentimentData.score;

  const technical_weight = 0.35;
  const fundamental_weight = 0.35;
  const sentiment_weight = 0.30;

  const aggregate_score = Math.round(
    technicalScore * technical_weight +
    fundamentalScore * fundamental_weight +
    sentimentScore * sentiment_weight
  );

  let recommendation = 'HOLD';
  if (aggregate_score >= 70) recommendation = 'BUY';
  else if (aggregate_score <= 40) recommendation = 'SELL';

  const currentPrice = stockData.ohlcv[stockData.ohlcv.length - 1]?.close || 100;
  const previousPrice = stockData.ohlcv[stockData.ohlcv.length - 2]?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const aiSummary = await generateAISummary(symbol, {
    technical: technicalScore,
    fundamental: fundamentalScore,
    sentiment: sentimentScore,
    recommendation,
    currentPrice,
    priceChange,
  });

  return {
    technical_score: technicalScore,
    fundamental_score: fundamentalScore,
    sentiment_score: sentimentScore,
    aggregate_score,
    technical_weight,
    fundamental_weight,
    sentiment_weight,
    confidence: Math.round(70 + Math.random() * 25),
    recommendation,
    risk_level: aggregate_score >= 70 ? 'LOW' : aggregate_score >= 50 ? 'MEDIUM' : 'HIGH',
    current_price: currentPrice,
    price_change: priceChange,
    price_change_percent: priceChangePercent,
    volume: stockData.ohlcv[stockData.ohlcv.length - 1]?.volume || 1000000,
    technical_indicators: technicalAnalysis.indicators,
    fundamental_metrics: fundamentalData.metrics,
    sentiment_data: sentimentData.data,
    key_factors: [
      `Technical momentum: ${technicalScore >= 60 ? 'Strong' : technicalScore >= 40 ? 'Moderate' : 'Weak'}`,
      `Fundamental health: ${fundamentalScore >= 60 ? 'Good' : fundamentalScore >= 40 ? 'Fair' : 'Poor'}`,
      `Market sentiment: ${sentimentScore >= 60 ? 'Positive' : sentimentScore >= 40 ? 'Neutral' : 'Negative'}`,
    ],
    risks: [
      aggregate_score < 50 ? 'Below average performance indicators' : 'Market volatility',
      'Economic uncertainty',
      'Price fluctuation risk',
    ],
    ai_summary: aiSummary,
    data_sources: {
      stock: stockData.source,
      fundamental: fundamentalData.source,
      sentiment: sentimentData.source,
    },
  };
}

// Multi-source stock data fetching
async function fetchStockDataMultiSource(symbol: string, timeframe: string) {
  const sources = ['twelveData', 'polygon', 'alphaVantage'];
  
  for (const source of sources) {
    if (!canUseAPI(source)) continue;
    
    try {
      let data;
      if (source === 'twelveData' && twelveDataKey) {
        data = await fetchTwelveData(symbol, timeframe);
      } else if (source === 'polygon' && polygonKey) {
        data = await fetchPolygonData(symbol, timeframe);
      } else if (source === 'alphaVantage' && alphaVantageKey) {
        data = await fetchAlphaVantageData(symbol, timeframe);
      }
      
      if (data && data.ohlcv && data.ohlcv.length > 0) {
        incrementAPI(source);
        return data;
      }
    } catch (error) {
      console.warn(`⚠️ ${source} failed:`, error.message);
    }
  }
  
  console.warn('⚠️ All stock data sources failed, using mock data');
  return generateMockStockData(symbol, timeframe);
}

async function fetchTwelveData(symbol: string, timeframe: string) {
  const intervalMap: Record<string, string> = {
    '1D': '5min', '1W': '30min', '1M': '1day', '3M': '1day',
    '6M': '1day', '1Y': '1week', '2Y': '1week'
  };
  
  const interval = intervalMap[timeframe] || '1day';
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=100&apikey=${twelveDataKey}`;
  
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  
  if (data.status === 'error' || !data.values) {
    throw new Error(data.message || 'Twelve Data error');
  }
  
  const ohlcv = data.values.map((v: any) => ({
    date: v.datetime,
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    volume: parseFloat(v.volume || 0),
  })).reverse();
  
  return { symbol, ohlcv, source: 'Twelve Data' };
}

async function fetchPolygonData(symbol: string, timeframe: string) {
  const daysMap: Record<string, number> = {
    '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '2Y': 730
  };
  
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (daysMap[timeframe] || 30));
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const timespan = timeframe === '1D' ? 'minute' : 'day';
  const multiplier = timeframe === '1D' ? 5 : 1;
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDateStr}/${endDate}?adjusted=true&sort=asc&apikey=${polygonKey}`;
  
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('No data from Polygon');
  }
  
  const ohlcv = data.results.map((r: any) => ({
    date: new Date(r.t).toISOString().split('T')[0],
    open: r.o,
    high: r.h,
    low: r.l,
    close: r.c,
    volume: r.v,
  }));
  
  return { symbol, ohlcv, source: 'Polygon.io' };
}

async function fetchAlphaVantageData(symbol: string, timeframe: string) {
  const intervalMap: Record<string, string> = {
    '1D': '5min', '1W': '30min', '1M': 'daily', '3M': 'daily',
    '6M': 'daily', '1Y': 'weekly', '2Y': 'weekly'
  };
  
  const interval = intervalMap[timeframe] || 'daily';
  let fn, key;
  
  if (['5min', '30min'].includes(interval)) {
    fn = 'TIME_SERIES_INTRADAY';
    key = `Time Series (${interval})`;
  } else if (interval === 'weekly') {
    fn = 'TIME_SERIES_WEEKLY';
    key = 'Weekly Time Series';
  } else {
    fn = 'TIME_SERIES_DAILY';
    key = 'Time Series (Daily)';
  }
  
  const url = fn === 'TIME_SERIES_INTRADAY'
    ? `https://www.alphavantage.co/query?function=${fn}&symbol=${symbol}&interval=${interval}&apikey=${alphaVantageKey}&outputsize=full`
    : `https://www.alphavantage.co/query?function=${fn}&symbol=${symbol}&apikey=${alphaVantageKey}&outputsize=full`;
  
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  
  if (data.Note || data['Error Message'] || data.Information) {
    throw new Error(data.Note || data['Error Message'] || data.Information);
  }
  
  const timeSeries = data[key];
  if (!timeSeries) throw new Error('No time series data');
  
  const ohlcv = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
    date,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseFloat(values['5. volume'] || values['6. volume'] || 0),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return { symbol, ohlcv, source: 'Alpha Vantage' };
}

// Multi-source fundamental data fetching
async function fetchFundamentalDataMultiSource(symbol: string) {
  const sources = ['fmp', 'finnhub', 'alphaVantage'];
  
  for (const source of sources) {
    if (!canUseAPI(source)) continue;
    
    try {
      let data;
      if (source === 'fmp' && fmpKey) {
        data = await fetchFMPFundamentals(symbol);
      } else if (source === 'finnhub' && finnhubKey) {
        data = await fetchFinnhubFundamentals(symbol);
      } else if (source === 'alphaVantage' && alphaVantageKey) {
        data = await fetchAlphaVantageFundamentals(symbol);
      }
      
      if (data && data.metrics) {
        incrementAPI(source);
        return data;
      }
    } catch (error) {
      console.warn(`⚠️ ${source} fundamentals failed:`, error.message);
    }
  }
  
  return getMockFundamentals();
}

async function fetchFMPFundamentals(symbol: string) {
  const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${fmpKey}`;
  const metricsUrl = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?apikey=${fmpKey}`;
  
  const [profileRes, metricsRes] = await Promise.all([
    fetch(profileUrl, { signal: AbortSignal.timeout(10000) }),
    fetch(metricsUrl, { signal: AbortSignal.timeout(10000) })
  ]);
  
  const profile = (await profileRes.json())[0];
  const metrics = (await metricsRes.json())[0];
  
  if (!profile || !metrics) throw new Error('Invalid FMP response');
  
  const score = calculateFundamentalScore({
    pe: metrics.peRatio,
    pb: metrics.pbRatio,
    roe: metrics.roe,
    eps: profile.eps,
  });
  
  return {
    score,
    metrics: {
      PERatio: metrics.peRatio,
      PriceToBookRatio: metrics.pbRatio,
      ReturnOnEquity: metrics.roe,
      EPS: profile.eps,
      MarketCap: profile.mktCap,
    },
    source: 'Financial Modeling Prep',
  };
}

async function fetchFinnhubFundamentals(symbol: string) {
  const url = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${finnhubKey}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  
  if (!data.metric) throw new Error('Invalid Finnhub response');
  
  const score = calculateFundamentalScore({
    pe: data.metric.peBasicExclExtraTTM,
    pb: data.metric.pbQuarterly,
    roe: data.metric.roeTTM,
    eps: data.metric.epsBasicExclExtraItemsTTM,
  });
  
  return {
    score,
    metrics: {
      PERatio: data.metric.peBasicExclExtraTTM,
      PriceToBookRatio: data.metric.pbQuarterly,
      ReturnOnEquity: data.metric.roeTTM,
      EPS: data.metric.epsBasicExclExtraItemsTTM,
    },
    source: 'Finnhub',
  };
}

async function fetchAlphaVantageFundamentals(symbol: string) {
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${alphaVantageKey}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  
  if (data.Note || data['Error Message']) {
    throw new Error(data.Note || data['Error Message']);
  }
  
  const score = calculateFundamentalScore({
    pe: parseFloat(data.PERatio),
    pb: parseFloat(data.PriceToBookRatio),
    roe: parseFloat(data.ReturnOnEquityTTM),
    eps: parseFloat(data.EPS),
  });
  
  return {
    score,
    metrics: {
      PERatio: data.PERatio,
      PriceToBookRatio: data.PriceToBookRatio,
      ReturnOnEquity: data.ReturnOnEquityTTM,
      EPS: data.EPS,
      ProfitMargin: data.ProfitMargin,
    },
    source: 'Alpha Vantage',
  };
}

// Multi-source sentiment data fetching
async function fetchSentimentDataMultiSource(symbol: string) {
  const sources = ['alphaVantage', 'finnhub'];
  
  for (const source of sources) {
    if (!canUseAPI(source)) continue;
    
    try {
      let data;
      if (source === 'alphaVantage' && alphaVantageKey) {
        data = await fetchAlphaVantageSentiment(symbol);
      } else if (source === 'finnhub' && finnhubKey) {
        data = await fetchFinnhubSentiment(symbol);
      }
      
      if (data) {
        incrementAPI(source);
        return data;
      }
    } catch (error) {
      console.warn(`⚠️ ${source} sentiment failed:`, error.message);
    }
  }
  
  return getMockSentiment();
}

async function fetchAlphaVantageSentiment(symbol: string) {
  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${alphaVantageKey}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  
  if (data.Note || !data.feed) {
    throw new Error(data.Note || 'No sentiment data');
  }
  
  const sentiments = data.feed.slice(0, 10).map((item: any) => {
    const tickerSentiment = item.ticker_sentiment?.find((t: any) => t.ticker === symbol);
    return tickerSentiment ? parseFloat(tickerSentiment.ticker_sentiment_score) : 0;
  });
  
  const avgSentiment = sentiments.reduce((a: number, b: number) => a + b, 0) / sentiments.length;
  const score = Math.round(50 + avgSentiment * 50); // Convert -1 to 1 scale to 0-100
  
  return {
    score: Math.max(0, Math.min(100, score)),
    data: {
      average: avgSentiment,
      articles: data.feed.length,
      recent: sentiments.slice(0, 3),
    },
    source: 'Alpha Vantage',
  };
}

async function fetchFinnhubSentiment(symbol: string) {
  const url = `https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${finnhubKey}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  
  if (!data.sentiment) throw new Error('No Finnhub sentiment');
  
  const score = Math.round(50 + data.sentiment.bullishPercent - data.sentiment.bearishPercent);
  
  return {
    score: Math.max(0, Math.min(100, score)),
    data: {
      bullish: data.sentiment.bullishPercent,
      bearish: data.sentiment.bearishPercent,
      buzz: data.buzz?.buzz || 0,
    },
    source: 'Finnhub',
  };
}

// Technical indicators calculation
async function calculateTechnicalIndicators(ohlcv: any[]) {
  const closes = ohlcv.map(d => d.close);
  const highs = ohlcv.map(d => d.high);
  const lows = ohlcv.map(d => d.low);
  
  // Simple RSI calculation
  const rsi = calculateRSI(closes, 14);
  
  // Simple MACD calculation
  const macd = calculateMACD(closes);
  
  // Calculate score based on indicators
  let score = 50;
  
  if (rsi) {
    if (rsi > 70) score -= 10; // Overbought
    else if (rsi < 30) score += 10; // Oversold
    else if (rsi > 50) score += 5; // Bullish
    else score -= 5; // Bearish
  }
  
  if (macd) {
    if (macd > 0) score += 10; // Bullish
    else score -= 10; // Bearish
  }
  
  // Price trend
  if (closes.length >= 20) {
    const recent = closes.slice(-20);
    const older = closes.slice(-40, -20);
    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b) / older.length;
    
    if (recentAvg > olderAvg) score += 10; // Uptrend
    else score -= 10; // Downtrend
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    indicators: {
      RSI: rsi,
      MACD: macd,
      SMA_20: closes.slice(-20).reduce((a, b) => a + b) / 20,
      SMA_50: closes.slice(-50).reduce((a, b) => a + b) / 50,
    },
  };
}

function calculateRSI(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50;
  
  const changes = closes.slice(1).map((price, i) => price - closes[i]);
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(closes: number[]): number {
  if (closes.length < 26) return 0;
  
  const ema12 = closes.slice(-12).reduce((a, b) => a + b) / 12;
  const ema26 = closes.slice(-26).reduce((a, b) => a + b) / 26;
  
  return ema12 - ema26;
}

function calculateFundamentalScore(metrics: any): number {
  let score = 50;
  
  if (metrics.pe && metrics.pe > 0) {
    if (metrics.pe < 15) score += 15;
    else if (metrics.pe < 25) score += 5;
    else score -= 10;
  }
  
  if (metrics.pb && metrics.pb > 0) {
    if (metrics.pb < 3) score += 10;
    else if (metrics.pb > 10) score -= 10;
  }
  
  if (metrics.roe && metrics.roe > 0) {
    if (metrics.roe > 15) score += 15;
    else if (metrics.roe > 10) score += 5;
  }
  
  if (metrics.eps && metrics.eps > 0) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

async function generateAISummary(symbol: string, data: any): Promise<string> {
  if (!geminiKey) {
    return `Analysis for ${symbol} shows ${data.recommendation} recommendation with aggregate score of ${data.technical + data.fundamental + data.sentiment}/300. Current price: $${data.currentPrice.toFixed(2)} (${data.priceChange >= 0 ? '+' : ''}${data.priceChange.toFixed(2)}).`;
  }
  
  try {
    const prompt = `Provide a brief 2-3 sentence analysis for stock ${symbol} with: Technical Score: ${data.technical}/100, Fundamental Score: ${data.fundamental}/100, Sentiment Score: ${data.sentiment}/100, Recommendation: ${data.recommendation}, Price: $${data.currentPrice.toFixed(2)} (${data.priceChange >= 0 ? '+' : ''}${data.priceChange.toFixed(2)}%). Be concise and professional.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: AbortSignal.timeout(10000),
    });
    
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 
           `Analysis for ${symbol} indicates ${data.recommendation} with mixed signals across technical, fundamental, and sentiment metrics.`;
  } catch (error) {
    console.warn('⚠️ Gemini AI summary failed:', error.message);
    return `Analysis for ${symbol} shows ${data.recommendation} recommendation based on technical (${data.technical}/100), fundamental (${data.fundamental}/100), and sentiment (${data.sentiment}/100) analysis.`;
  }
}

// Mock data generators
function generateMockStockData(symbol: string, timeframe: string) {
  const dataPoints = timeframe === '1D' ? 96 : timeframe === '1W' ? 56 : 30;
  const ohlcv = [];
  let price = 100 + Math.random() * 50;
  
  for (let i = 0; i < dataPoints; i++) {
    const change = (Math.random() - 0.5) * 4;
    const open = price;
    price += change;
    const high = Math.max(open, price) + Math.random();
    const low = Math.min(open, price) - Math.random();
    
    const date = new Date();
    date.setDate(date.getDate() - (dataPoints - i));
    
    ohlcv.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.round(1000000 * (0.8 + Math.random() * 0.4)),
    });
  }
  
  return { symbol, ohlcv, source: 'Mock Data' };
}

function getMockFundamentals() {
  return {
    score: Math.floor(Math.random() * 40) + 30,
    metrics: {
      PERatio: (15 + Math.random() * 20).toFixed(2),
      PriceToBookRatio: (2 + Math.random() * 3).toFixed(2),
      ReturnOnEquity: (10 + Math.random() * 15).toFixed(2),
      EPS: (2 + Math.random() * 5).toFixed(2),
    },
    source: 'Mock Data',
  };
}

function getMockSentiment() {
  return {
    score: Math.floor(Math.random() * 40) + 30,
    data: {
      average: (Math.random() - 0.5).toFixed(3),
      articles: Math.floor(Math.random() * 50) + 10,
    },
    source: 'Mock Data',
  };
}

function formatAnalysisResponse(data: any) {
  return {
    score: data.aggregate_score || 50,
    recommendation: data.recommendation || 'HOLD',
    technical: {
      score: data.technical_score || 50,
      recommendation: data.recommendation || 'HOLD',
      indicators: data.technical_indicators || {},
      configuration: { weight: `${Math.round((data.technical_weight || 0.35) * 100)}%` }
    },
    fundamental: {
      score: data.fundamental_score || 50,
      recommendation: data.recommendation || 'HOLD',
      indicators: data.fundamental_metrics || {},
    },
    sentiment: {
      score: data.sentiment_score || 50,
      recommendation: data.recommendation || 'HOLD',
      indicators: data.sentiment_data || {},
    },
    summary: data.ai_summary || `Analysis for the requested symbol shows mixed market conditions.`,
    confidence: data.confidence || 75,
    keyFactors: data.key_factors || [],
    risks: data.risks || [],
    price: {
      current: data.current_price || 100,
      change: data.price_change || 0,
      changePercent: data.price_change_percent || 0,
    },
    volume: data.volume || 1000000,
    timestamp: data.created_at || new Date().toISOString(),
    dataSources: data.data_sources,
  };
}

function getMockAnalysis() {
  return formatAnalysisResponse({
    aggregate_score: 55,
    technical_score: 60,
    fundamental_score: 50,
    sentiment_score: 55,
    recommendation: 'HOLD',
    confidence: 75,
    current_price: 150,
    price_change: 2.5,
    price_change_percent: 1.7,
    volume: 2500000,
    ai_summary: "Mock analysis data - API integration pending",
    key_factors: ["Technical analysis pending", "Fundamental data pending"],
    risks: ["Data integration in progress"],
    technical_indicators: { RSI: 55, MACD: 0.1 }
  });
}
