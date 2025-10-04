/// <reference types="https://deno.land/x/deno/cli/types/dts/index.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Stock analysis function booting up...')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- API Keys and Clients ---
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_API_KEY')
const POLYGON_KEY = Deno.env.get('POLYGON_API_KEY')
const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY')
const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY')
const FMP_KEY = Deno.env.get('FMP_API_KEY')
const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')
const CHART_IMG_KEY = Deno.env.get('CHART_IMG_API_KEY')

console.log('--- API Key Status ---')
console.log(`TWELVE_DATA_KEY: ${TWELVE_DATA_KEY ? 'Loaded' : 'Missing'}`)
console.log(`POLYGON_KEY: ${POLYGON_KEY ? 'Loaded' : 'Missing'}`)
console.log(`ALPHA_VANTAGE_KEY: ${ALPHA_VANTAGE_KEY ? 'Loaded' : 'Missing'}`)
console.log(`FINNHUB_KEY: ${FINNHUB_KEY ? 'Loaded' : 'Missing'}`)
console.log(`FMP_KEY: ${FMP_KEY ? 'Loaded' : 'Missing'}`)
console.log(`GEMINI_KEY: ${GEMINI_KEY ? 'Loaded' : 'Missing'}`)
console.log(`CHART_IMG_KEY: ${CHART_IMG_KEY ? 'Loaded' : 'Missing'}`)
console.log('----------------------')

// Rate limiting state
let twelveDataRequestCount = 0
let polygonRequestCount = 0
let alphaVantageRequestCount = 0
let finnhubRequestCount = 0
let fmpRequestCount = 0
setInterval(() => {
  twelveDataRequestCount = 0
  polygonRequestCount = 0
  alphaVantageRequestCount = 0
  finnhubRequestCount = 0
  fmpRequestCount = 0
}, 60000)

// --- Interfaces ---
interface StockData {
  [key: string]: any
}

interface PriceDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface GeminiRequestPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}


// --- Main Server Logic ---
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const symbol = url.searchParams.get('symbol')
    const bypassCache = url.searchParams.get('bypassCache') === 'true'
    
    console.log(`[Analysis] Received request for symbol: ${symbol}, bypassCache: ${bypassCache}`)
    
    if (!symbol) {
      return new Response(JSON.stringify({ error: 'Symbol is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Check cache only if not bypassing
    if (!bypassCache) {
      const { data: cachedData, error: cacheError } = await supabase
        .rpc('get_cached_analysis', { p_symbol: symbol })

      if (cacheError) {
        console.error(`[Cache] Error fetching from cache for ${symbol}:`, cacheError.message)
      }

      if (cachedData && cachedData.length > 0) {
        const age = Date.now() - new Date(cachedData[0].created_at).getTime()
        if (age < 24 * 60 * 60 * 1000) { // 24 hours
          console.log(`[Cache] Found valid cache entry for ${symbol}.`)
          return new Response(JSON.stringify(cachedData[0].analysis_data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        console.log(`[Cache] Stale cache entry found for ${symbol}. Refetching...`)
      } else {
        console.log(`[Cache] No cache entry found for ${symbol}. Fetching fresh data...`)
      }
    } else {
      console.log(`[Cache] Bypassing cache for ${symbol} as requested.`)
    }

    const analysisResult = await performStockAnalysis(symbol)

    // Check if analysis resulted in an error
    if (analysisResult.error) {
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Transform to match frontend schema
    const priceHistory = analysisResult.data?.priceHistory || []
    const currentPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1]?.close || 0 : 0
    
    console.log(`[Response] Current price: ${currentPrice}, Price history length: ${priceHistory.length}`)
    
    const formattedResponse = {
      status: 'success',
      symbol: analysisResult.symbol,
      currentPrice,
      priceHistory,
      analysis: {
        mode: 'hybrid',
        timeframe: 'daily',
        timestamp: analysisResult.timestamp,
        fundamental: {
          score: analysisResult.scores.fundamental,
          recommendation: getRecommendation(analysisResult.scores.fundamental),
        },
        technical: {
          score: analysisResult.scores.technical,
          recommendation: getRecommendation(analysisResult.scores.technical),
          indicators: analysisResult.data.technicalIndicators,
        },
        sentiment: {
          score: analysisResult.scores.sentiment,
          recommendation: getRecommendation(analysisResult.scores.sentiment),
        },
        overall: {
          score: analysisResult.scores.overall,
          recommendation: analysisResult.recommendation,
        },
        aiInsights: {
          summary: analysisResult.aiSummary,
        },
      },
    }

    const { error: saveError } = await supabase
      .rpc('save_analysis_cache', {
        p_symbol: symbol,
        p_analysis_data: formattedResponse,
      })

    if (saveError) {
      console.error(`[Cache] Error saving to cache for ${symbol}:`, saveError.message)
    } else {
      console.log(`[Cache] Successfully cached analysis for ${symbol}.`)
    }

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[Analysis] Top-level error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// --- Core Analysis Orchestration ---
async function performStockAnalysis(symbol: string) {
  console.log(`[Analysis Service] Starting analysis for ${symbol}...`)
  try {
    const [
      priceHistory,
      companyInfo,
      financialMetrics,
      newsSentiment,
      technicalIndicators,
    ] = await Promise.all([
      fetchPriceHistory(symbol),
      fetchCompanyInfo(symbol),
      fetchFinancialMetrics(symbol),
      fetchNewsSentiment(symbol),
      fetchTechnicalIndicators(symbol),
    ])

    const scores = calculateScores(financialMetrics, newsSentiment, technicalIndicators)
    const recommendation = getRecommendation(scores.overall)
    const aiSummary = await generateAISummary(symbol, { ...scores, recommendation }, technicalIndicators, priceHistory)

    const result = {
      symbol,
      recommendation,
      scores,
      aiSummary,
      data: {
        priceHistory,
        companyInfo,
        financialMetrics,
        newsSentiment,
        technicalIndicators,
      },
      timestamp: new Date().toISOString(),
    }

    console.log(`[Analysis Service] Completed analysis for ${symbol}.`)
    return result
  } catch (error) {
    console.error(`[Analysis Service] Error during analysis for ${symbol}:`, error.message)
    // If analysis fails, return a structured error response
    return {
      error: true,
      symbol: symbol,
      message: `Failed to perform analysis: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }
}

// --- Data Fetching Functions ---

async function fetchWithRateLimit(
  apiKey: string | undefined,
  requestCounter: 'twelveData' | 'polygon' | 'alphaVantage' | 'finnhub' | 'fmp',
  limit: number,
  fetchFn: (key: string) => Promise<any>
): Promise<any> {
  if (!apiKey) {
    console.warn(`[API] API key for ${requestCounter} is missing. Skipping call.`)
    return {} // Returns an empty object if key is missing.
  }

  let counter
  switch (requestCounter) {
    case 'twelveData':
      counter = ++twelveDataRequestCount
      break
    case 'polygon':
      counter = ++polygonRequestCount
      break
    case 'alphaVantage':
      counter = ++alphaVantageRequestCount
      break
    case 'finnhub':
      counter = ++finnhubRequestCount
      break
    case 'fmp':
      counter = ++fmpRequestCount
      break;
  }

  if (counter > limit) {
    console.warn(`[API] Rate limit reached for ${requestCounter}. Skipping call.`)
    return {}
  }

  try {
    return await fetchFn(apiKey)
  } catch (error) {
    console.error(`[API] Error fetching from ${requestCounter}:`, error.message)
    return {} // Return empty object on fetch error
  }
}

async function fetchPriceHistory(symbol: string): Promise<any> {
  console.log(`[Data] Fetching price history for ${symbol}...`)
  return fetchWithRateLimit(TWELVE_DATA_KEY, 'twelveData', 8, async (key) => {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=90&apikey=${key}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Twelve Data price history fetch failed with status: ${response.status}`)
    const data = await response.json()
    if (data.status === 'error') {
      console.warn(`[API - Twelve Data] Error for ${symbol}: ${data.message}`)
      return generateMockData(symbol) // Fallback to mock data
    }
    return {
      priceHistory: data.values.map((v: any) => ({
        time: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume, 10),
      })).reverse(),
      currentPrice: parseFloat(data.values[0].close),
    }
  }).catch(() => generateMockData(symbol)) // Fallback on any error
}

async function fetchCompanyInfo(symbol: string): Promise<any> {
  console.log(`[Data] Fetching company info for ${symbol}...`)
  return fetchWithRateLimit(POLYGON_KEY, 'polygon', 5, async (key) => {
    const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${key}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Polygon company info fetch failed with status: ${response.status}`)
    const data = await response.json()
    return data.results ? {
      name: data.results.name,
      description: data.results.description,
      sector: data.results.sic_description,
      marketCap: data.results.market_cap,
      logo: data.results.branding?.logo_url,
    } : {}
  })
}

async function fetchFinancialMetrics(symbol: string): Promise<any> {
  console.log(`[Data] Fetching financial metrics for ${symbol}...`)
  const overviewPromise = fetchWithRateLimit(ALPHA_VANTAGE_KEY, 'alphaVantage', 5, async (key) => {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${key}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Alpha Vantage overview fetch failed with status: ${response.status}`)
    const data = await response.json()
    return {
      pe: parseFloat(data.PERatio),
      pb: parseFloat(data.PriceToBookRatio),
      roe: parseFloat(data.ReturnOnEquityTTM),
      eps: parseFloat(data.EPS),
    }
  })

  const quotePromise = fetchWithRateLimit(FINNHUB_KEY, 'finnhub', 30, async (key) => {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Finnhub quote fetch failed with status: ${response.status}`)
    const data = await response.json()
    return {
      '52WeekHigh': data.h, // Finnhub doesn't provide 52-week high directly in quote
      '52WeekLow': data.l,
    }
  })

  const [overview, quote] = await Promise.all([overviewPromise, quotePromise])
  return { ...overview, ...quote }
}

async function fetchNewsSentiment(symbol: string): Promise<any> {
  console.log(`[Data] Fetching news sentiment for ${symbol}...`)
  return fetchWithRateLimit(FMP_KEY, 'fmp', 10, async (key) => {
    const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=50&apikey=${key}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`FMP news fetch failed with status: ${response.status}`)
    const data = await response.json()
    const articles = data.slice(0, 10)
    const sentimentScore = articles.reduce((acc: number, article: any) => {
      // A very basic sentiment calculation
      const text = `${article.title} ${article.text}`.toLowerCase()
      if (text.includes('positive') || text.includes('up') || text.includes('gain')) acc += 0.1
      if (text.includes('negative') || text.includes('down') || text.includes('loss')) acc -= 0.1
      return acc
    }, 0.5) * 100 // Scale to 0-100

    return {
      articles: articles.map((a: any) => ({ title: a.title, url: a.url, source: a.site })),
      sentimentScore: Math.max(0, Math.min(100, sentimentScore)),
    }
  })
}

async function fetchTechnicalIndicators(symbol: string): Promise<any> {
  console.log(`[Data] Fetching technical indicators for ${symbol}...`)
  try {
    const rsiPromise = fetchWithRateLimit(TWELVE_DATA_KEY, 'twelveData', 8, async (key) => {
      const url = `https://api.twelvedata.com/rsi?symbol=${symbol}&interval=1day&apikey=${key}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Twelve Data RSI fetch failed with status: ${response.status}`)
      const data = await response.json()
      return data.values ? parseFloat(data.values[0].rsi) : 50
    })

    const dmiPromise = fetchWithRateLimit(TWELVE_DATA_KEY, 'twelveData', 8, async (key) => {
      const url = `https://api.twelvedata.com/dmi?symbol=${symbol}&interval=1day&apikey=${key}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Twelve Data DMI fetch failed with status: ${response.status}`)
      const data = await response.json()
      return data.values ? { adx: parseFloat(data.values[0].adx), di_plus: parseFloat(data.values[0].plus_di), di_minus: parseFloat(data.values[0].minus_di) } : {}
    })

    const macdPromise = fetchWithRateLimit(TWELVE_DATA_KEY, 'twelveData', 8, async (key) => {
      const url = `https://api.twelvedata.com/macd?symbol=${symbol}&interval=1day&apikey=${key}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Twelve Data MACD fetch failed with status: ${response.status}`)
      const data = await response.json()
      return data.values ? {
        macd: parseFloat(data.values[0].macd),
        signal: parseFloat(data.values[0].macd_signal),
        hist: parseFloat(data.values[0].macd_hist),
      } : {}
    })

    const [rsi, dmi, macd] = await Promise.all([rsiPromise, dmiPromise, macdPromise])
    
    const indicators = { RSI: rsi, DMI: dmi, MACD: macd };
    console.log(`[Data] Fetched Technical Indicators for ${symbol}:`, JSON.stringify(indicators, null, 2));
    return indicators;

  } catch (error) {
    console.error(`[Data] Error in fetchTechnicalIndicators for ${symbol}:`, error.message);
    return { RSI: 50, DMI: {}, MACD: {} }; // Return default structure on error
  }
}

// --- Scoring and AI ---

function calculateScores(metrics: any, sentiment: any, indicators: any) {
  const fundamental = calculateFundamentalScore(metrics)
  const technical = calculateTechnicalScore(indicators)
  const sentimentScore = sentiment?.sentimentScore ?? 50

  // Weights can be adjusted
  const overall = (fundamental * 0.4) + (technical * 0.4) + (sentimentScore * 0.2)

  return {
    overall: Math.round(overall),
    fundamental: Math.round(fundamental),
    technical: Math.round(technical),
    sentiment: Math.round(sentimentScore),
  }
}

function calculateTechnicalScore(indicators: any): number {
  let score = 50
  const rsi = indicators?.RSI ?? 50
  
  if (rsi > 70) score -= (rsi - 70) * 1.5 // More penalty for overbought
  else if (rsi < 30) score += (30 - rsi) * 1.5 // More reward for oversold
  
  // MACD logic
  if (indicators?.MACD) {
    if (indicators.MACD.macd > indicators.MACD.signal) {
      score += 10; // Bullish crossover
    } else {
      score -= 10; // Bearish crossover
    }
  }
  
  return Math.max(0, Math.min(100, score))
}

function calculateFundamentalScore(metrics: any): number {
  let score = 50
  
  if (metrics.pe > 0 && metrics.pe < 15) score += 15
  else if (metrics.pe > 30) score -= 10
  
  if (metrics.pb > 0 && metrics.pb < 3) score += 10
  
  if (metrics.roe > 15) score += 15
  else if (metrics.roe < 5) score -= 10
  
  if (metrics.eps > 0) score += 10
  
  return Math.max(0, Math.min(100, score))
}

async function getChartImageAsBase64(symbol: string) {
  try {
    const chartUrl = `https://chartimg.com/v1/tradingview/advanced-chart?symbol=${symbol.toUpperCase()}&interval=1d&theme=dark&key=${CHART_IMG_KEY}`;
    const response = await fetch(chartUrl);
    if (!response.ok) {
      throw new Error(`Chart image fetch failed with status: ${response.status}`);
    }
    const imageBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    return {
      inlineData: {
        mimeType: 'image/png',
        data: base64,
      },
    };
  } catch (error) {
    console.error(`[Analysis Service] Failed to fetch chart image for ${symbol}:`, error.message);
    return null;
  }
}

async function generateAISummary(symbol: string, scores: any, indicators: any, priceData: any): Promise<string> {
  try {
    const rsi = indicators?.RSI || 50
    const macd = indicators?.MACD || {}
    const dmi = indicators?.DMI || {}
    
    // Get price trend
    const priceHistory = priceData?.priceHistory || []
    const currentPrice = priceData?.currentPrice || 0
    const oldPrice = priceHistory.length > 30 ? priceHistory[priceHistory.length - 30].close : currentPrice
    const priceTrend = currentPrice > oldPrice ? 'uptrend' : 'downtrend'
    const priceChangePercent = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice * 100).toFixed(2) : '0'

    const prompt = `You are a professional stock analyst. Provide a clear, structured technical and fundamental analysis for ${symbol.toUpperCase()}.

**IMPORTANT FORMATTING RULES:**
1. Use clear headings with ## for each section
2. Use bullet points (•) for listing key points
3. Keep each section concise (2-3 sentences maximum)
4. Use bold (**text**) for important metrics and signals
5. End with a clear, actionable summary

---

## 📊 Current Market Overview
**Symbol:** ${symbol.toUpperCase()}
**Current Trend:** ${priceTrend.toUpperCase()} (${priceChangePercent}% over 30 days)
**Overall Score:** ${scores.overall}/100 - **${scores.recommendation}**

---

## 📈 Technical Analysis (Score: ${scores.technical}/100)

### RSI Indicator (${rsi.toFixed(1)})
${rsi > 70 ? '• **OVERBOUGHT** - Stock may be due for a pullback' : rsi < 30 ? '• **OVERSOLD** - Potential buying opportunity' : '• **NEUTRAL** - Stock is in balanced territory'}
• Signal: ${rsi > 70 ? 'Consider taking profits or waiting for pullback' : rsi < 30 ? 'Look for entry points on confirmation' : 'Wait for stronger directional signals'}

### MACD Analysis
${macd.macd && macd.signal ? (
  macd.macd > macd.signal 
    ? '• **BULLISH CROSSOVER** - Upward momentum building\n• Signal strength: ' + (macd.macd > 0 ? 'Strong' : 'Moderate')
    : '• **BEARISH CROSSOVER** - Downward pressure present\n• Signal strength: ' + (macd.macd < 0 ? 'Strong' : 'Moderate')
) : '• Insufficient data for MACD analysis'}

### Directional Movement (DMI)
${dmi.adx ? (
  dmi.adx > 25 
    ? `• **STRONG TREND** detected (ADX: ${dmi.adx.toFixed(1)})\n• Direction: ${dmi.di_plus > dmi.di_minus ? 'Upward' : 'Downward'}`
    : `• **WEAK TREND** (ADX: ${dmi.adx.toFixed(1)}) - Market consolidating`
) : '• Trend strength analysis pending'}

---

## 💼 Fundamental Analysis (Score: ${scores.fundamental}/100)

${scores.fundamental > 60 ? '• **STRONG FUNDAMENTALS** - Company shows solid financial health' : scores.fundamental < 40 ? '• **WEAK FUNDAMENTALS** - Exercise caution with fundamentals' : '• **MODERATE FUNDAMENTALS** - Standard financial position'}
• Valuation: ${scores.fundamental > 60 ? 'Attractive at current levels' : scores.fundamental < 40 ? 'May be overvalued' : 'Fair value range'}
• Risk level: ${scores.fundamental > 60 ? 'Lower risk profile' : scores.fundamental < 40 ? 'Higher risk - monitor closely' : 'Medium risk'}

---

## 📰 Market Sentiment (Score: ${scores.sentiment}/100)

${scores.sentiment > 60 ? '• **POSITIVE SENTIMENT** - Market optimism prevails' : scores.sentiment < 40 ? '• **NEGATIVE SENTIMENT** - Market concerns present' : '• **NEUTRAL SENTIMENT** - Balanced market view'}
• News flow: ${scores.sentiment > 60 ? 'Predominantly positive coverage' : scores.sentiment < 40 ? 'Caution in recent reports' : 'Mixed market commentary'}

---

## 🎯 Trading Recommendation

**Overall Signal:** ${scores.recommendation}

**Key Action Points:**
${scores.overall > 70 ? '• Strong buy signal - Consider entering positions\n• Set stop-loss at recent support levels\n• Target: Next resistance zone' : 
  scores.overall > 60 ? '• Buy signal - Good entry opportunity\n• Monitor technical indicators for confirmation\n• Use proper risk management' :
  scores.overall > 40 ? '• Hold current positions\n• Wait for clearer directional signals\n• Avoid new entries until trend confirms' :
  scores.overall > 25 ? '• Consider reducing exposure\n• Watch support levels closely\n• Protect capital with tight stops' :
  '• Strong sell signal - Exit positions\n• Market showing significant weakness\n• Wait for reversal signals before re-entry'}

**Risk Management:**
• Confidence Level: ${scores.overall >= 70 ? 'HIGH' : scores.overall >= 50 ? 'MEDIUM' : 'LOW'}
• Position sizing: ${scores.overall >= 70 ? 'Standard allocation' : scores.overall >= 50 ? 'Reduced allocation' : 'Minimal or no position'}

---

*This analysis is based on current technical indicators and market data. Always conduct your own research and consider your risk tolerance before trading.*`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    )
    
    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`)
    }

    const data = await response.json()
    const summary = data.candidates[0]?.content.parts[0]?.text
    if (!summary) {
      console.error("[AI] Failed to extract summary from Gemini response:", JSON.stringify(data, null, 2))
      throw new Error('Could not generate AI summary.')
    }
    return summary
  } catch (error) {
    console.error('[AI] Error generating AI summary:', error.message)
    return 'An error occurred while generating the AI summary. Please try again later.'
  }
}

function getRecommendation(score: number): string {
  if (score > 75) return 'Strong Buy'
  if (score > 60) return 'Buy'
  if (score > 40) return 'Hold'
  if (score > 25) return 'Sell'
  return 'Strong Sell'
}

// --- Fallback/Mock Data ---
function generateMockData(symbol: string) {
  console.warn(`[Mock] Generating mock price history for ${symbol}.`)
  const priceHistory: PriceDataPoint[] = []
  let close = 150 + Math.random() * 100

  for (let i = 0; i < 90; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (90 - i))
    const open = close + (Math.random() - 0.5) * 5
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3
    close = low + Math.random() * (high - low)

    priceHistory.push({
      time: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(1000000 + Math.random() * 5000000)
    })
  }

  return {
    priceHistory,
    currentPrice: priceHistory[priceHistory.length - 1].close,
  }
}
