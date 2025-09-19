import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      symbol, 
      exchange, 
      analysisType = 'COMPREHENSIVE',
      duration = '1M',
      customWeights = { fundamental: 0.33, technical: 0.33, sentiment: 0.34 }
    } = await req.json()
    
    if (!symbol || !exchange) {
      return Response.json(
        { error: 'Symbol and exchange are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for cached analysis
    const { data: cachedAnalysis } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .eq('exchange', exchange.toUpperCase())
      .eq('analysis_type', analysisType)
      .eq('duration', duration)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cachedAnalysis) {
      console.log(`Analysis cache hit for ${symbol}`)
      return Response.json(
        { success: true, analysis: cachedAnalysis, cached: true },
        { headers: corsHeaders }
      )
    }

    console.log(`Performing comprehensive analysis for ${symbol}`)

    // Fetch market data
    const marketDataResponse = await supabase.functions.invoke('stock-data-service', {
      body: { symbol, exchange, dataType: 'OHLCV', timeframe: duration }
    })

    if (marketDataResponse.error) {
      throw new Error(`Failed to fetch market data: ${marketDataResponse.error}`)
    }

    const marketData = marketDataResponse.data?.data

    // Perform analysis components
    const [fundamentalResult, technicalResult, sentimentResult] = await Promise.all([
      performFundamentalAnalysis(symbol, exchange, marketData, supabase),
      performTechnicalAnalysis(symbol, exchange, marketData, supabase),
      performSentimentAnalysis(symbol, exchange, supabase)
    ])

    // Calculate aggregate score
    const aggregateScore = Math.round(
      fundamentalResult.score * customWeights.fundamental +
      technicalResult.score * customWeights.technical +
      sentimentResult.score * customWeights.sentiment
    )

    // Determine recommendation
    const recommendation = getRecommendation(aggregateScore)
    const riskLevel = getRiskLevel(fundamentalResult, technicalResult, marketData)
    const confidence = calculateConfidence(fundamentalResult, technicalResult, sentimentResult)

    // Prepare analysis result
    const analysisResult = {
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
      analysis_type: analysisType,
      duration,
      aggregate_score: aggregateScore,
      fundamental_score: fundamentalResult.score,
      technical_score: technicalResult.score,
      sentiment_score: sentimentResult.score,
      fundamental_weight: customWeights.fundamental,
      technical_weight: customWeights.technical,
      sentiment_weight: customWeights.sentiment,
      recommendation,
      risk_level: riskLevel,
      confidence,
      current_price: marketData?.timeSeries?.[marketData.timeSeries.length - 1]?.close || null,
      price_change: calculatePriceChange(marketData),
      price_change_percent: calculatePriceChangePercent(marketData),
      volume: marketData?.timeSeries?.[marketData.timeSeries.length - 1]?.volume || null,
      fundamental_metrics: fundamentalResult.metrics,
      technical_indicators: technicalResult.indicators,
      sentiment_data: sentimentResult.data,
      key_factors: [...fundamentalResult.keyFactors, ...technicalResult.keyFactors, ...sentimentResult.keyFactors],
      risks: [...fundamentalResult.risks, ...technicalResult.risks, ...sentimentResult.risks],
      catalysts: [...sentimentResult.catalysts],
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }

    // Cache the analysis
    await supabase
      .from('analysis_results')
      .insert(analysisResult)

    console.log(`Analysis completed for ${symbol}`)
    return Response.json(
      { success: true, analysis: analysisResult, cached: false },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Stock analysis service error:', error)
    return Response.json(
      { 
        success: false, 
        error: error.message,
        analysis: generateMockAnalysis() // Fallback to mock analysis
      },
      { status: 500, headers: corsHeaders }
    )
  }
})

async function performFundamentalAnalysis(symbol: string, exchange: string, marketData: any, supabase: any) {
  // Mock fundamental analysis - in production, this would fetch real fundamental data
  const mockMetrics = {
    pe_ratio: 15.5 + Math.random() * 10,
    peg_ratio: 1.2 + Math.random() * 0.8,
    roe: 0.12 + Math.random() * 0.08,
    debt_to_equity: 0.3 + Math.random() * 0.4,
    dividend_yield: Math.random() * 0.04,
    market_cap: Math.floor(Math.random() * 100000000000) + 10000000000
  }

  const score = calculateFundamentalScore(mockMetrics)
  
  return {
    score,
    metrics: mockMetrics,
    keyFactors: [
      `P/E ratio of ${mockMetrics.pe_ratio.toFixed(1)} indicates ${mockMetrics.pe_ratio < 15 ? 'undervalued' : 'fairly valued'} stock`,
      `ROE of ${(mockMetrics.roe * 100).toFixed(1)}% shows ${mockMetrics.roe > 0.15 ? 'strong' : 'moderate'} profitability`
    ],
    risks: mockMetrics.debt_to_equity > 0.5 ? ['High debt-to-equity ratio may indicate financial risk'] : []
  }
}

async function performTechnicalAnalysis(symbol: string, exchange: string, marketData: any, supabase: any) {
  if (!marketData?.timeSeries) {
    return { score: 50, indicators: {}, keyFactors: [], risks: [] }
  }

  const prices = marketData.timeSeries.map((d: any) => d.close)
  const volumes = marketData.timeSeries.map((d: any) => d.volume)
  
  const indicators = {
    sma_20: calculateSMA(prices, 20),
    sma_50: calculateSMA(prices, 50),
    rsi: calculateRSI(prices, 14),
    volume_trend: calculateVolumeTrend(volumes),
    price_trend: calculatePriceTrend(prices)
  }

  const score = calculateTechnicalScore(indicators, prices[prices.length - 1])
  
  return {
    score,
    indicators,
    keyFactors: [
      `RSI of ${indicators.rsi.toFixed(1)} indicates ${indicators.rsi > 70 ? 'overbought' : indicators.rsi < 30 ? 'oversold' : 'neutral'} conditions`,
      `Price ${indicators.price_trend > 0 ? 'above' : 'below'} 20-day moving average suggests ${indicators.price_trend > 0 ? 'bullish' : 'bearish'} momentum`
    ],
    risks: indicators.rsi > 80 ? ['Extremely overbought conditions may lead to correction'] : []
  }
}

async function performSentimentAnalysis(symbol: string, exchange: string, supabase: any) {
  // Check sentiment cache
  const { data: cachedSentiment } = await supabase
    .from('news_sentiment_cache')
    .select('*')
    .eq('symbol', symbol.toUpperCase())
    .eq('exchange', exchange.toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single()

  if (cachedSentiment) {
    return {
      score: Math.round((cachedSentiment.positive_score - cachedSentiment.negative_score + 1) * 50),
      data: cachedSentiment.sentiment_analysis,
      keyFactors: [`News sentiment trending ${cachedSentiment.sentiment_trend.toLowerCase()}`],
      risks: cachedSentiment.negative_score > 0.6 ? ['Negative news sentiment may impact stock price'] : [],
      catalysts: cachedSentiment.positive_score > 0.6 ? ['Positive news momentum could drive price higher'] : []
    }
  }

  // Mock sentiment analysis
  const mockSentiment = {
    positive_score: Math.random(),
    negative_score: Math.random() * 0.5,
    neutral_score: 0.3 + Math.random() * 0.4,
    news_count: Math.floor(Math.random() * 20) + 5,
    sentiment_trend: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE'
  }

  // Cache sentiment
  await supabase
    .from('news_sentiment_cache')
    .insert({
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
      ...mockSentiment,
      sentiment_analysis: { summary: 'Mock sentiment analysis' },
      news_data: { articles: [] }
    })

  return {
    score: Math.round((mockSentiment.positive_score - mockSentiment.negative_score + 1) * 50),
    data: mockSentiment,
    keyFactors: [`${mockSentiment.news_count} recent news articles with ${mockSentiment.sentiment_trend.toLowerCase()} sentiment`],
    risks: mockSentiment.negative_score > 0.6 ? ['Negative news sentiment detected'] : [],
    catalysts: mockSentiment.positive_score > 0.6 ? ['Positive news coverage supporting stock'] : []
  }
}

// Helper functions
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  const recent = prices.slice(-period)
  return recent.reduce((sum, price) => sum + price, 0) / period
}

function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50
  
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) gains += change
    else losses -= change
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateVolumeTrend(volumes: number[]): number {
  if (volumes.length < 10) return 0
  const recent = volumes.slice(-10)
  const older = volumes.slice(-20, -10)
  const recentAvg = recent.reduce((a, b) => a + b) / recent.length
  const olderAvg = older.reduce((a, b) => a + b) / older.length
  return (recentAvg - olderAvg) / olderAvg
}

function calculatePriceTrend(prices: number[]): number {
  if (prices.length < 2) return 0
  const current = prices[prices.length - 1]
  const sma20 = calculateSMA(prices, 20)
  return (current - sma20) / sma20
}

function calculateFundamentalScore(metrics: any): number {
  let score = 50 // Base score
  
  // P/E ratio scoring
  if (metrics.pe_ratio < 15) score += 10
  else if (metrics.pe_ratio > 25) score -= 10
  
  // ROE scoring
  if (metrics.roe > 0.15) score += 15
  else if (metrics.roe < 0.05) score -= 15
  
  // Debt-to-equity scoring
  if (metrics.debt_to_equity < 0.3) score += 10
  else if (metrics.debt_to_equity > 0.7) score -= 15
  
  return Math.max(0, Math.min(100, score))
}

function calculateTechnicalScore(indicators: any, currentPrice: number): number {
  let score = 50
  
  // RSI scoring
  if (indicators.rsi < 30) score += 15 // Oversold
  else if (indicators.rsi > 70) score -= 15 // Overbought
  
  // Moving average scoring
  if (currentPrice > indicators.sma_20) score += 10
  if (currentPrice > indicators.sma_50) score += 10
  
  // Volume trend scoring
  if (indicators.volume_trend > 0.2) score += 10
  
  return Math.max(0, Math.min(100, score))
}

function getRecommendation(score: number): string {
  if (score >= 70) return 'STRONG_BUY'
  if (score >= 60) return 'BUY'
  if (score >= 40) return 'HOLD'
  if (score >= 30) return 'SELL'
  return 'STRONG_SELL'
}

function getRiskLevel(fundamental: any, technical: any, marketData: any): string {
  const volatility = calculateVolatility(marketData?.timeSeries || [])
  if (volatility > 0.3 || fundamental.metrics?.debt_to_equity > 0.7) return 'HIGH'
  if (volatility > 0.15 || technical.indicators?.rsi > 75) return 'MEDIUM'
  return 'LOW'
}

function calculateConfidence(fundamental: any, technical: any, sentiment: any): number {
  const scores = [fundamental.score, technical.score, sentiment.score]
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - 60, 2), 0) / scores.length
  return Math.max(50, 100 - Math.sqrt(variance))
}

function calculatePriceChange(marketData: any): number | null {
  if (!marketData?.timeSeries || marketData.timeSeries.length < 2) return null
  const current = marketData.timeSeries[marketData.timeSeries.length - 1].close
  const previous = marketData.timeSeries[marketData.timeSeries.length - 2].close
  return current - previous
}

function calculatePriceChangePercent(marketData: any): number | null {
  const change = calculatePriceChange(marketData)
  if (!change || !marketData?.timeSeries) return null
  const previous = marketData.timeSeries[marketData.timeSeries.length - 2].close
  return (change / previous) * 100
}

function calculateVolatility(timeSeries: any[]): number {
  if (timeSeries.length < 10) return 0.1
  const returns = []
  for (let i = 1; i < timeSeries.length; i++) {
    returns.push((timeSeries[i].close - timeSeries[i - 1].close) / timeSeries[i - 1].close)
  }
  const mean = returns.reduce((a, b) => a + b) / returns.length
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / returns.length
  return Math.sqrt(variance)
}

function generateMockAnalysis() {
  return {
    symbol: 'MOCK',
    exchange: 'NASDAQ',
    aggregate_score: 65,
    recommendation: 'BUY',
    confidence: 75,
    risk_level: 'MEDIUM'
  }
}