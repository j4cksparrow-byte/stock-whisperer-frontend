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
    const { symbol, exchange, dataType = 'OHLCV', timeframe = '1D' } = await req.json()
    
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

    // Check cache first
    const { data: cachedData } = await supabase
      .from('market_data_cache')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .eq('exchange', exchange.toUpperCase())
      .eq('data_type', dataType)
      .eq('timeframe', timeframe)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cachedData) {
      console.log(`Cache hit for ${symbol} ${dataType}`)
      return Response.json(
        { success: true, data: cachedData.data, cached: true },
        { headers: corsHeaders }
      )
    }

    // Fetch from Alpha Vantage
    const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY')
    if (!alphaVantageKey) {
      throw new Error('Alpha Vantage API key not configured')
    }

    let alphaVantageFunction = 'TIME_SERIES_DAILY'
    if (dataType === 'OHLCV') {
      switch (timeframe) {
        case '1D': alphaVantageFunction = 'TIME_SERIES_DAILY'; break
        case '1W': alphaVantageFunction = 'TIME_SERIES_WEEKLY'; break
        case '1M': alphaVantageFunction = 'TIME_SERIES_MONTHLY'; break
        default: alphaVantageFunction = 'TIME_SERIES_DAILY'
      }
    }

    const alphaVantageUrl = `https://www.alphavantage.co/query?function=${alphaVantageFunction}&symbol=${symbol}&apikey=${alphaVantageKey}&outputsize=compact`
    
    console.log(`Fetching from Alpha Vantage: ${symbol} ${dataType}`)
    const response = await fetch(alphaVantageUrl)
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }
    
    const apiData = await response.json()
    
    // Check for API error
    if (apiData['Error Message'] || apiData['Note']) {
      throw new Error(apiData['Error Message'] || apiData['Note'])
    }

    // Process and normalize the data
    const processedData = processAlphaVantageData(apiData, dataType)
    
    // Cache the result
    await supabase
      .from('market_data_cache')
      .insert({
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
        data_type: dataType,
        timeframe,
        data: processedData,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      })

    console.log(`Successfully fetched and cached ${symbol} ${dataType}`)
    return Response.json(
      { success: true, data: processedData, cached: false },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Stock data service error:', error)
    return Response.json(
      { 
        success: false, 
        error: error.message,
        data: generateMockData() // Fallback to mock data
      },
      { status: 500, headers: corsHeaders }
    )
  }
})

function processAlphaVantageData(apiData: any, dataType: string) {
  if (dataType === 'OHLCV') {
    const timeSeries = apiData['Time Series (Daily)'] || 
                     apiData['Weekly Time Series'] || 
                     apiData['Monthly Time Series'] || {}
    
    const processed = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      metadata: apiData['Meta Data'] || {},
      timeSeries: processed,
      lastUpdated: new Date().toISOString()
    }
  }
  
  return apiData
}

function generateMockData() {
  const mockData = []
  const basePrice = 150
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const variation = (Math.random() - 0.5) * 0.1
    const price = basePrice * (1 + variation)
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      open: price * 0.99,
      high: price * 1.02,
      low: price * 0.97,
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000
    })
  }
  
  return {
    metadata: { symbol: 'MOCK', lastRefreshed: new Date().toISOString() },
    timeSeries: mockData,
    lastUpdated: new Date().toISOString()
  }
}