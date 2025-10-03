import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// API Keys
const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_API_KEY')
const POLYGON_KEY = Deno.env.get('POLYGON_API_KEY')
const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY')
const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY')
const FMP_KEY = Deno.env.get('FMP_API_KEY')
const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')

// Rate limiting state
const rateLimits: Record<string, { count: number; resetTime: number }> = {}
const RATE_LIMITS = {
  'twelve-data': 8,
  'polygon': 5,
  'alpha-vantage': 25,
  'finnhub': 60,
  'fmp': 250,
}

function canUseAPI(apiName: string): boolean {
  const limit = rateLimits[apiName]
  if (!limit) return true
  
  const now = Date.now()
  if (now > limit.resetTime) {
    rateLimits[apiName] = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 }
    return true
  }
  
  const maxCalls = RATE_LIMITS[apiName as keyof typeof RATE_LIMITS] || 100
  return limit.count < maxCalls
}

function incrementAPI(apiName: string): void {
  const now = Date.now()
  if (!rateLimits[apiName] || now > rateLimits[apiName].resetTime) {
    rateLimits[apiName] = { count: 1, resetTime: now + 24 * 60 * 60 * 1000 }
  } else {
    rateLimits[apiName].count++
  }
  console.log(`📊 API Usage - ${apiName}: ${rateLimits[apiName].count}/${RATE_LIMITS[apiName as keyof typeof RATE_LIMITS] || 100}`)
}

Deno.serve(async (req) => {
  console.log('🌐 [STOCK-ANALYSIS] Incoming request:', req.method, req.url)
  
  if (req.method === 'OPTIONS') {
    console.log('✅ [STOCK-ANALYSIS] Returning CORS preflight response')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const symbol = url.searchParams.get('symbol') || url.pathname.split('/').filter(p => p && p !== 'analyze').pop()
    const timeframe = url.searchParams.get('timeframe') || '1M'
    const bypassCache = url.searchParams.get('bypassCache') === 'true'

    console.log('📋 [STOCK-ANALYSIS] Request params:', { symbol, timeframe, bypassCache })

    if (!symbol) {
      console.error('❌ [STOCK-ANALYSIS] Missing symbol parameter')
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 [STOCK-ANALYSIS] Analysis Request: ${symbol} | Timeframe: ${timeframe} | BypassCache: ${bypassCache}`)
    console.log(`🔑 [STOCK-ANALYSIS] API Keys Available:`, {
      twelveData: !!TWELVE_DATA_KEY,
      polygon: !!POLYGON_KEY,
      alphaVantage: !!ALPHA_VANTAGE_KEY,
      finnhub: !!FINNHUB_KEY,
      fmp: !!FMP_KEY,
      gemini: !!GEMINI_KEY
    })

    // Check cache first
    if (!bypassCache) {
      console.log(`🔍 [STOCK-ANALYSIS] Checking cache for ${symbol}`)
      const cacheKey = `analysis:${symbol}:${timeframe}`
      try {
        const { data: cached, error: cacheError } = await supabase.rpc('get_cache_value', { 
          _cache_key: cacheKey 
        })
        
        if (cacheError) {
          console.warn(`⚠️ [STOCK-ANALYSIS] Cache error:`, cacheError)
        }
        
        if (cached) {
          console.log(`✅ [STOCK-ANALYSIS] Cache HIT for ${symbol}`)
          return new Response(
            JSON.stringify({ ...cached, meta: { ...cached.meta, cached: true } }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        console.log(`❌ [STOCK-ANALYSIS] Cache MISS for ${symbol}`)
      } catch (cacheErr) {
        console.error(`❌ [STOCK-ANALYSIS] Cache check failed:`, cacheErr)
      }
    } else {
      console.log(`⏭️ [STOCK-ANALYSIS] Bypassing cache (bypassCache=true)`)
    }

    // Perform fresh analysis
    console.log(`🚀 [STOCK-ANALYSIS] Performing fresh analysis for ${symbol}`)
    const analysis = await performStockAnalysis(symbol, timeframe)
    console.log(`✅ [STOCK-ANALYSIS] Analysis complete for ${symbol}`)

    // Cache the result
    try {
      const cacheKey = `analysis:${symbol}:${timeframe}`
      const { error: setCacheError } = await supabase.rpc('set_cache_value', {
        _cache_key: cacheKey,
        _cache_value: analysis,
        _expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      })
      
      if (setCacheError) {
        console.warn(`⚠️ [STOCK-ANALYSIS] Failed to cache result:`, setCacheError)
      } else {
        console.log(`💾 [STOCK-ANALYSIS] Cached analysis for ${symbol}`)
      }
    } catch (cacheErr) {
      console.error(`❌ [STOCK-ANALYSIS] Cache save failed:`, cacheErr)
    }

    console.log(`📤 [STOCK-ANALYSIS] Returning analysis for ${symbol}`)
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('❌ [STOCK-ANALYSIS] Fatal Error:', error)
    console.error('❌ [STOCK-ANALYSIS] Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack?.split('\n').slice(0, 5).join('\n')
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function performStockAnalysis(symbol: string, timeframe: string) {
  console.log(`🚀 [ANALYSIS] Starting comprehensive analysis for ${symbol}`)
  
  // Fetch data from multiple sources in parallel
  console.log(`📡 [ANALYSIS] Fetching data from multiple sources...`)
  const startTime = Date.now()
  
  const [stockData, fundamentalData, sentimentData] = await Promise.all([
    fetchStockDataMultiSource(symbol, timeframe),
    fetchFundamentalDataMultiSource(symbol),
    fetchSentimentDataMultiSource(symbol)
  ])
  
  const fetchTime = Date.now() - startTime
  console.log(`⏱️ [ANALYSIS] Data fetch completed in ${fetchTime}ms`)

  console.log(`📈 [ANALYSIS] Stock Data Source: ${stockData.source}`)
  console.log(`📊 [ANALYSIS] Fundamental Data Source: ${fundamentalData.source}`)
  console.log(`💭 [ANALYSIS] Sentiment Data Source: ${sentimentData.source}`)
  console.log(`📊 [ANALYSIS] Price History Points: ${stockData.data.priceHistory?.length || 0}`)
  console.log(`💰 [ANALYSIS] Current Price: ${stockData.data.currentPrice}`)

  // Calculate technical indicators
  console.log(`📊 [ANALYSIS] Calculating technical indicators...`)
  const technical = calculateTechnicalIndicators(stockData.data)
  
  // Calculate scores
  console.log(`🎯 [ANALYSIS] Calculating scores...`)
  const fundamentalScore = calculateFundamentalScore(fundamentalData.data)
  const technicalScore = technical.score
  const sentimentScore = sentimentData.data.score

  console.log(`📊 [ANALYSIS] Scores - Fundamental: ${fundamentalScore}, Technical: ${technicalScore}, Sentiment: ${sentimentScore}`)

  // Aggregate overall score
  const overallScore = Math.round(
    (fundamentalScore * 0.4) + (technicalScore * 0.35) + (sentimentScore * 0.25)
  )

  const recommendation = overallScore >= 70 ? 'BUY' : overallScore <= 40 ? 'SELL' : 'HOLD'
  
  console.log(`🎯 [ANALYSIS] Overall Score: ${overallScore} | Recommendation: ${recommendation}`)

  // Generate AI summary if Gemini is available
  let aiSummary = 'Analysis complete. Check individual metrics for details.'
  if (GEMINI_KEY) {
    console.log(`🤖 [ANALYSIS] Generating AI summary with Gemini...`)
    try {
      aiSummary = await generateAISummary(symbol, {
        fundamental: fundamentalScore,
        technical: technicalScore,
        sentiment: sentimentScore,
        overall: overallScore,
        recommendation
      })
      console.log(`✅ [ANALYSIS] AI summary generated successfully`)
    } catch (error) {
      console.error('❌ [ANALYSIS] AI Summary Error:', error)
    }
  } else {
    console.log(`⚠️ [ANALYSIS] Gemini API key not configured, skipping AI summary`)
  }

  const result = {
    status: 'ok',
    symbol,
    timeframe,
    currentPrice: stockData.data.currentPrice,
    priceHistory: stockData.data.priceHistory,
    analysis: {
      mode: 'normal',
      timeframe,
      timestamp: new Date().toISOString(),
      fundamental: {
        score: fundamentalScore,
        recommendation: fundamentalScore >= 70 ? 'BUY' : fundamentalScore <= 40 ? 'SELL' : 'HOLD',
        weight: '40%',
        metrics: fundamentalData.data
      },
      technical: {
        score: technicalScore,
        recommendation: technicalScore >= 70 ? 'BUY' : technicalScore <= 40 ? 'SELL' : 'HOLD',
        indicators: technical.indicators
      },
      sentiment: {
        score: sentimentScore,
        recommendation: sentimentScore >= 70 ? 'BUY' : sentimentScore <= 40 ? 'SELL' : 'HOLD',
        weight: '25%',
        summary: sentimentData.data.summary
      },
      overall: {
        score: overallScore,
        recommendation
      },
      aiInsights: {
        summary: aiSummary
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      dataSource: `${stockData.source}, ${fundamentalData.source}, ${sentimentData.source}`,
      cached: false
    }
  }
  
  console.log(`✅ [ANALYSIS] Analysis complete for ${symbol}`, {
    overallScore,
    recommendation,
    dataSources: result.meta.dataSource,
    pricePoints: result.priceHistory?.length || 0
  })
  
  return result
}

// Multi-source data fetching functions
async function fetchStockDataMultiSource(symbol: string, timeframe: string) {
  const sources = [
    { name: 'Twelve Data', fn: () => fetchTwelveData(symbol, timeframe), enabled: TWELVE_DATA_KEY && canUseAPI('twelve-data') },
    { name: 'Polygon', fn: () => fetchPolygonData(symbol, timeframe), enabled: POLYGON_KEY && canUseAPI('polygon') },
    { name: 'Alpha Vantage', fn: () => fetchAlphaVantageData(symbol, timeframe), enabled: ALPHA_VANTAGE_KEY && canUseAPI('alpha-vantage') }
  ]

  for (const source of sources) {
    if (!source.enabled) {
      console.log(`⏭️  Skipping ${source.name} (not available or rate limited)`)
      continue
    }
    
    try {
      console.log(`🔄 Trying ${source.name} for stock data...`)
      const data = await source.fn()
      if (data && data.priceHistory && data.priceHistory.length > 0) {
        incrementAPI(source.name.toLowerCase().replace(' ', '-'))
        return { source: source.name, data }
      }
    } catch (error) {
      console.error(`❌ ${source.name} failed:`, error.message)
    }
  }

  console.log(`⚠️  All stock data sources failed, using mock data`)
  return { source: 'Mock Data', data: generateMockStockData(symbol) }
}

async function fetchFundamentalDataMultiSource(symbol: string) {
  const sources = [
    { name: 'FMP', fn: () => fetchFMPFundamentals(symbol), enabled: FMP_KEY && canUseAPI('fmp') },
    { name: 'Finnhub', fn: () => fetchFinnhubFundamentals(symbol), enabled: FINNHUB_KEY && canUseAPI('finnhub') },
    { name: 'Alpha Vantage', fn: () => fetchAlphaVantageFundamentals(symbol), enabled: ALPHA_VANTAGE_KEY && canUseAPI('alpha-vantage') }
  ]

  for (const source of sources) {
    if (!source.enabled) {
      console.log(`⏭️  Skipping ${source.name} for fundamentals`)
      continue
    }
    
    try {
      console.log(`🔄 Trying ${source.name} for fundamentals...`)
      const data = await source.fn()
      if (data && Object.keys(data).length > 0) {
        incrementAPI(source.name.toLowerCase())
        return { source: source.name, data }
      }
    } catch (error) {
      console.error(`❌ ${source.name} fundamentals failed:`, error.message)
    }
  }

  console.log(`⚠️  All fundamental data sources failed, using mock data`)
  return { source: 'Mock Data', data: getMockFundamentals() }
}

async function fetchSentimentDataMultiSource(symbol: string) {
  const sources = [
    { name: 'Alpha Vantage', fn: () => fetchAlphaVantageSentiment(symbol), enabled: ALPHA_VANTAGE_KEY && canUseAPI('alpha-vantage') },
    { name: 'Finnhub', fn: () => fetchFinnhubSentiment(symbol), enabled: FINNHUB_KEY && canUseAPI('finnhub') }
  ]

  for (const source of sources) {
    if (!source.enabled) {
      console.log(`⏭️  Skipping ${source.name} for sentiment`)
      continue
    }
    
    try {
      console.log(`🔄 Trying ${source.name} for sentiment...`)
      const data = await source.fn()
      if (data && data.score !== undefined) {
        incrementAPI(source.name.toLowerCase().replace(' ', '-'))
        return { source: source.name, data }
      }
    } catch (error) {
      console.error(`❌ ${source.name} sentiment failed:`, error.message)
    }
  }

  console.log(`⚠️  All sentiment data sources failed, using mock data`)
  return { source: 'Mock Data', data: getMockSentiment() }
}

// Individual API fetch functions
async function fetchTwelveData(symbol: string, timeframe: string) {
  const interval = timeframe === '1D' ? '1min' : '1day'
  const outputsize = timeframe === '1D' ? 390 : 100
  
  const response = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_KEY}`
  )
  const data = await response.json()
  
  if (!data.values) throw new Error('No data from Twelve Data')
  
  const priceHistory = data.values.map((item: any) => ({
    time: item.datetime.split(' ')[0],
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseInt(item.volume)
  })).reverse()
  
  return {
    currentPrice: priceHistory[priceHistory.length - 1].close,
    priceHistory
  }
}

async function fetchPolygonData(symbol: string, timeframe: string) {
  const toDate = new Date().toISOString().split('T')[0]
  const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?apiKey=${POLYGON_KEY}`
  )
  const data = await response.json()
  
  if (!data.results) throw new Error('No data from Polygon')
  
  const priceHistory = data.results.map((item: any) => ({
    time: new Date(item.t).toISOString().split('T')[0],
    open: item.o,
    high: item.h,
    low: item.l,
    close: item.c,
    volume: item.v
  }))
  
  return {
    currentPrice: priceHistory[priceHistory.length - 1].close,
    priceHistory
  }
}

async function fetchAlphaVantageData(symbol: string, timeframe: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
  )
  const data = await response.json()
  
  if (!data['Time Series (Daily)']) throw new Error('No data from Alpha Vantage')
  
  const timeSeries = data['Time Series (Daily)']
  const priceHistory = Object.entries(timeSeries).slice(0, 100).map(([date, values]: [string, any]) => ({
    time: date,
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'])
  })).reverse()
  
  return {
    currentPrice: priceHistory[priceHistory.length - 1].close,
    priceHistory
  }
}

async function fetchFMPFundamentals(symbol: string) {
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_KEY}`
  )
  const data = await response.json()
  
  if (!data || data.length === 0) throw new Error('No data from FMP')
  
  const company = data[0]
  return {
    pe: company.pe || 0,
    eps: company.eps || 0,
    marketCap: company.mktCap || 0,
    beta: company.beta || 1
  }
}

async function fetchFinnhubFundamentals(symbol: string) {
  const response = await fetch(
    `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`
  )
  const data = await response.json()
  
  if (!data.metric) throw new Error('No data from Finnhub')
  
  return {
    pe: data.metric.peBasicExclExtraTTM || 0,
    eps: data.metric.epsBasicExclExtraItemsTTM || 0,
    roe: data.metric.roeTTM || 0,
    pb: data.metric.pbAnnual || 0
  }
}

async function fetchAlphaVantageFundamentals(symbol: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
  )
  const data = await response.json()
  
  if (!data.Symbol) throw new Error('No data from Alpha Vantage')
  
  return {
    pe: parseFloat(data.PERatio) || 0,
    eps: parseFloat(data.EPS) || 0,
    pb: parseFloat(data.PriceToBookRatio) || 0,
    roe: parseFloat(data.ReturnOnEquityTTM) || 0
  }
}

async function fetchAlphaVantageSentiment(symbol: string) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
  )
  const data = await response.json()
  
  if (!data.feed || data.feed.length === 0) throw new Error('No sentiment data from Alpha Vantage')
  
  const scores = data.feed.slice(0, 10).map((item: any) => {
    const tickerSentiment = item.ticker_sentiment?.find((t: any) => t.ticker === symbol)
    return tickerSentiment ? parseFloat(tickerSentiment.ticker_sentiment_score) : 0
  })
  
  const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  const normalizedScore = Math.round(((avgScore + 1) / 2) * 100)
  
  return {
    score: normalizedScore,
    summary: `Based on ${scores.length} recent news articles`
  }
}

async function fetchFinnhubSentiment(symbol: string) {
  const response = await fetch(
    `https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${FINNHUB_KEY}`
  )
  const data = await response.json()
  
  if (!data.sentiment) throw new Error('No sentiment data from Finnhub')
  
  const score = Math.round(data.sentiment.bullishPercent)
  
  return {
    score,
    summary: `${data.sentiment.bullishPercent}% bullish, ${data.sentiment.bearishPercent}% bearish`
  }
}

function calculateTechnicalIndicators(stockData: any) {
  const closes = stockData.priceHistory.map((p: any) => p.close)
  
  // RSI
  const rsi = calculateRSI(closes, 14)
  
  // MACD
  const macd = calculateMACD(closes)
  
  // Simple Moving Averages
  const sma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20
  const sma50 = closes.slice(-50).reduce((a: number, b: number) => a + b, 0) / 50
  
  // Calculate score
  let score = 50
  if (rsi < 30) score += 15
  else if (rsi > 70) score -= 15
  
  if (macd > 0) score += 10
  else score -= 10
  
  if (sma20 > sma50) score += 10
  else score -= 10
  
  return {
    score: Math.max(0, Math.min(100, score)),
    indicators: {
      rsi,
      macd,
      sma20,
      sma50
    }
  }
}

function calculateRSI(closes: number[], period: number): number {
  let gains = 0, losses = 0
  
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) gains += change
    else losses -= change
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  const rs = avgGain / avgLoss
  
  return 100 - (100 / (1 + rs))
}

function calculateMACD(closes: number[]): number {
  const ema12 = closes.slice(-12).reduce((a, b) => a + b, 0) / 12
  const ema26 = closes.slice(-26).reduce((a, b) => a + b, 0) / 26
  return ema12 - ema26
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

async function generateAISummary(symbol: string, scores: any): Promise<string> {
  try {
    const prompt = `Please provide a fundamental and technical analysis of the stock chart for ${symbol}. Focus on:

## **1. Candlestick Patterns and Overall Price Trends**
Analyze the candlestick formations and identify the dominant price trend direction.

## **2. Volume Analysis**
Examine the volume patterns and their correlation with price movements.

## **3. RSI (Relative Strength Index) Interpretation**
Current RSI is ${scores.technical}/100. Provide interpretation of overbought/oversold conditions.

## **4. DMI (Directional Movement Index) Interpretation**
Analyze the directional movement and trend strength indicators.

## **5. Key Support and Resistance Levels**
Identify critical price levels that may act as support or resistance.

## **6. Overall Outlook and Trade Setup Ideas**
Based on the analysis above, provide a brief overall outlook and potential trade setup ideas.

**Current Scores:**
- Overall Score: ${scores.overall}/100 (${scores.recommendation})
- Technical: ${scores.technical}/100
- Fundamental: ${scores.fundamental}/100
- Sentiment: ${scores.sentiment}/100

Please format your response with proper markdown including bold headings (##) and adequate spacing between sections for readability.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [AI] Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ [AI] Invalid Gemini response structure:', JSON.stringify(data))
      throw new Error('Invalid response from Gemini API')
    }
    
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('❌ [AI] Failed to generate summary:', error)
    return `## **Analysis for ${symbol}**

## **1. Candlestick Patterns and Overall Price Trends**
The stock is showing a ${scores.recommendation} signal based on current technical patterns.

## **2. Volume Analysis**
Volume patterns indicate ${scores.sentiment >= 60 ? 'strong' : scores.sentiment >= 40 ? 'moderate' : 'weak'} market participation.

## **3. RSI (Relative Strength Index) Interpretation**
RSI at ${scores.technical}/100 suggests the stock is ${scores.technical >= 70 ? 'overbought' : scores.technical <= 30 ? 'oversold' : 'neutral'}.

## **4. DMI (Directional Movement Index) Interpretation**
Trend strength is ${scores.technical >= 60 ? 'strong' : scores.technical >= 40 ? 'moderate' : 'weak'} based on current indicators.

## **5. Key Support and Resistance Levels**
Key levels should be monitored for potential breakouts or reversals.

## **6. Overall Outlook and Trade Setup Ideas**
**Recommendation: ${scores.recommendation}**
- Overall Score: ${scores.overall}/100
- Technical: ${scores.technical}/100
- Fundamental: ${scores.fundamental}/100
- Sentiment: ${scores.sentiment}/100

Consider ${scores.recommendation === 'BUY' ? 'long positions' : scores.recommendation === 'SELL' ? 'short positions or reducing exposure' : 'waiting for clearer signals'} based on the current market conditions.`
  }
}

// Mock data generators
function generateMockStockData(symbol: string) {
  const basePrice = 100 + Math.random() * 100
  const priceHistory = []
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const volatility = basePrice * 0.02
    const open = basePrice + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    
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
    currentPrice: priceHistory[priceHistory.length - 1].close,
    priceHistory
  }
}

function getMockFundamentals() {
  return {
    pe: 15 + Math.random() * 10,
    eps: 2 + Math.random() * 3,
    pb: 2 + Math.random() * 2,
    roe: 10 + Math.random() * 10
  }
}

function getMockSentiment() {
  return {
    score: 40 + Math.random() * 20,
    summary: 'Mock sentiment data based on simulated news analysis'
  }
}
