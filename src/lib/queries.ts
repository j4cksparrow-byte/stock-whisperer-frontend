import { useQuery } from '@tanstack/react-query'
import api from './api'
import { z } from 'zod'
import { AnalysisResponse, IndicatorsResponse, WeightsDefaultsResponse, SearchResponse, TrendingResponse } from './types'
// Local fallback data for offline search
import { NASDAQ_COMPANIES } from '../data/companies'
import { NYSE_COMPANIES } from '../data/nyseCompanies'
import { NSE_COMPANIES } from '../data/nseCompanies'
import { BSE_COMPANIES } from '../data/bseCompanies'
import { ASX_COMPANIES } from '../data/asxCompanies'

function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const res = schema.safeParse(data)
  if (!res.success) {
    console.error(res.error)
    throw new Error('Invalid server response')
  }
  return res.data as any
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { results: [] }

      console.log('[useSearch] Starting search for:', query)

      // First attempt: remote API
      try {
        console.log('[useSearch] Calling stocks-api/search endpoint')
        const { data } = await api.get('/stocks-api/search', { params: { query } })
        console.log('[useSearch] API response:', data)
        const parsed = parse(SearchResponse, data)
        console.log('[useSearch] Parsed results:', parsed)
        return parsed
      } catch (err) {
        console.warn('[useSearch] API failed, falling back to local search:', err)
        // API failed or invalid response — fall back to local search
        try {
          const q = query.trim().toLowerCase()
          const pool = [
            ...NASDAQ_COMPANIES,
            ...NYSE_COMPANIES,
            ...NSE_COMPANIES,
            ...BSE_COMPANIES,
            ...ASX_COMPANIES,
          ]

          const results = pool
            .filter((c) => {
              return (
                c.symbol.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q)
              )
            })
            .slice(0, 20)
            .map((c) => ({ symbol: c.symbol, name: c.name, region: c.exchange }))

          console.log('[useSearch] Local search results:', results.length)
          return { status: 'ok', results }
        } catch (localErr) {
          console.error('[useSearch] Local search fallback failed', localErr)
          return { results: [] }
        }
      }
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTrending(category: 'gainers'|'losers'|'mostActive') {
  return useQuery({
    queryKey: ['trending', category],
    queryFn: async () => {
      console.log('[useTrending] Fetching trending for category:', category)
      
      try {
        // Try to get real data from backend first
        const { data } = await api.get('/stocks-api/trending', { params: { category } })
        console.log('[useTrending] API response:', data)
        const parsed = parse(TrendingResponse, data)
        console.log('[useTrending] Parsed data:', parsed)
        return parsed
      } catch (err) {
        console.warn('[useTrending] API failed, using real-time stock data:', err)
        
        // Fallback to real-time stock data using a free API
        try {
          const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX', 'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE', 'PYPL', 'UBER', 'SPOT', 'ZM', 'SQ', 'SHOP', 'ROKU']
          const stockData = await Promise.all(
            symbols.map(async (symbol) => {
              try {
                // Using Alpha Vantage API (free tier) for real stock data
                const response = await fetch(
                  `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`
                )
                const data = await response.json()
                const quote = data['Global Quote']
                
                if (quote && quote['01. symbol']) {
                  const price = parseFloat(quote['05. price'])
                  const change = parseFloat(quote['09. change'])
                  const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
                  const volume = quote['06. volume']
                  
                  return {
                    symbol: quote['01. symbol'],
                    name: getCompanyName(symbol),
                    price: price,
                    change: change,
                    changePercent: changePercent,
                    volume: formatVolume(volume),
                    exchange: 'NASDAQ'
                  }
                }
              } catch (error) {
                console.warn(`Failed to fetch data for ${symbol}:`, error)
              }
              return null
            })
          )

          const validStocks = stockData.filter(stock => stock !== null)
          
          // Filter by category
          let filteredStocks = validStocks
          if (category === 'gainers') {
            filteredStocks = validStocks.filter(stock => stock.change > 0).slice(0, 6)
          } else if (category === 'losers') {
            filteredStocks = validStocks.filter(stock => stock.change < 0).slice(0, 6)
          } else if (category === 'mostActive') {
            filteredStocks = validStocks.sort((a, b) => {
              const aVol = parseFloat(a.volume.replace(/[MK]/g, ''))
              const bVol = parseFloat(b.volume.replace(/[MK]/g, ''))
              return bVol - aVol
            }).slice(0, 6)
          }

          const realTimeData = {
            status: 'ok',
            trending: filteredStocks,
            lastUpdated: new Date().toISOString(),
            source: 'Alpha Vantage API'
          }
          
          console.log('[useTrending] Using real-time stock data:', realTimeData)
          return parse(TrendingResponse, realTimeData)
        } catch (apiError) {
          console.warn('[useTrending] Real-time API failed, using fallback data:', apiError)
          
          // Final fallback with current market prices (as of recent data) - More companies
          const fallbackStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 254.63, change: 0.20, changePercent: 0.079, volume: '45.2M', exchange: 'NASDAQ' },
            { symbol: 'MSFT', name: 'Microsoft Corporation', price: 517.95, change: 0.65, changePercent: 0.125, volume: '28.7M', exchange: 'NASDAQ' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 0.87, changePercent: 0.61, volume: '22.1M', exchange: 'NASDAQ' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 219.57, change: -2.60, changePercent: -1.17, volume: '18.9M', exchange: 'NASDAQ' },
            { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.58, change: 3.21, changePercent: 0.67, volume: '15.3M', exchange: 'NASDAQ' },
            { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 186.58, change: 4.73, changePercent: 2.60, volume: '52.1M', exchange: 'NASDAQ' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -1.23, changePercent: -0.49, volume: '38.5M', exchange: 'NASDAQ' },
            { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.30, change: 2.15, changePercent: 0.44, volume: '8.7M', exchange: 'NASDAQ' },
            { symbol: 'AMD', name: 'Advanced Micro Devices', price: 145.67, change: 1.89, changePercent: 1.31, volume: '35.2M', exchange: 'NASDAQ' },
            { symbol: 'INTC', name: 'Intel Corporation', price: 45.23, change: -0.45, changePercent: -0.98, volume: '42.8M', exchange: 'NASDAQ' },
            { symbol: 'ORCL', name: 'Oracle Corporation', price: 125.34, change: 1.23, changePercent: 0.99, volume: '12.5M', exchange: 'NYSE' },
            { symbol: 'CRM', name: 'Salesforce Inc.', price: 285.67, change: -2.15, changePercent: -0.75, volume: '8.9M', exchange: 'NYSE' },
            { symbol: 'ADBE', name: 'Adobe Inc.', price: 445.23, change: 3.45, changePercent: 0.78, volume: '6.7M', exchange: 'NASDAQ' },
            { symbol: 'PYPL', name: 'PayPal Holdings Inc.', price: 78.45, change: -1.23, changePercent: -1.54, volume: '15.2M', exchange: 'NASDAQ' },
            { symbol: 'UBER', name: 'Uber Technologies Inc.', price: 67.89, change: 2.34, changePercent: 3.57, volume: '22.8M', exchange: 'NYSE' },
            { symbol: 'SPOT', name: 'Spotify Technology S.A.', price: 234.56, change: 1.67, changePercent: 0.72, volume: '4.3M', exchange: 'NYSE' },
            { symbol: 'ZM', name: 'Zoom Video Communications Inc.', price: 89.12, change: -0.89, changePercent: -0.99, volume: '7.8M', exchange: 'NASDAQ' },
            { symbol: 'SQ', name: 'Block Inc.', price: 67.34, change: 1.45, changePercent: 2.20, volume: '18.6M', exchange: 'NYSE' },
            { symbol: 'SHOP', name: 'Shopify Inc.', price: 78.90, change: 2.12, changePercent: 2.76, volume: '9.4M', exchange: 'NYSE' },
            { symbol: 'ROKU', name: 'Roku Inc.', price: 45.67, change: -1.23, changePercent: -2.62, volume: '11.2M', exchange: 'NASDAQ' },
          ]

          let filteredFallback = fallbackStocks
          if (category === 'gainers') {
            filteredFallback = fallbackStocks.filter(stock => stock.change > 0).slice(0, 6)
          } else if (category === 'losers') {
            filteredFallback = fallbackStocks.filter(stock => stock.change < 0).slice(0, 6)
          } else if (category === 'mostActive') {
            filteredFallback = fallbackStocks.sort((a, b) => {
              const aVol = parseFloat(a.volume.replace(/[MK]/g, ''))
              const bVol = parseFloat(b.volume.replace(/[MK]/g, ''))
              return bVol - aVol
            }).slice(0, 6)
          }

          const fallbackData = {
            status: 'ok',
            trending: filteredFallback,
            lastUpdated: new Date().toISOString(),
            source: 'Market Data (Fallback)'
          }
          
          console.log('[useTrending] Using fallback data:', fallbackData)
          return parse(TrendingResponse, fallbackData)
        }
      }
    },
    staleTime: 60 * 1000, // Refresh every minute for real-time feel
  })
}

// Helper functions
function getCompanyName(symbol: string): string {
  const names: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices',
    'INTC': 'Intel Corporation',
    'ORCL': 'Oracle Corporation',
    'CRM': 'Salesforce Inc.',
    'ADBE': 'Adobe Inc.',
    'PYPL': 'PayPal Holdings Inc.',
    'UBER': 'Uber Technologies Inc.',
    'SPOT': 'Spotify Technology S.A.',
    'ZM': 'Zoom Video Communications Inc.',
    'SQ': 'Block Inc.',
    'SHOP': 'Shopify Inc.',
    'ROKU': 'Roku Inc.'
  }
  return names[symbol] || symbol
}

function formatVolume(volume: string): string {
  const num = parseInt(volume)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return volume
}

export function useIndicators() {
  return useQuery({
    queryKey: ['indicators'],
    queryFn: async () => {
      console.log('[useIndicators] Fetching indicators')
      const { data } = await api.get('/stocks-api/indicators')
      console.log('[useIndicators] API response:', data)
      const parsed = parse(IndicatorsResponse, data)
      console.log('[useIndicators] Parsed data:', parsed)
      return parsed
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function useWeightDefaults() {
  return useQuery({
    queryKey: ['weights-defaults'],
    queryFn: async () => {
      console.log('[useWeightDefaults] Fetching default weights')
      const { data } = await api.get('/stocks-api/weights/defaults')
      console.log('[useWeightDefaults] API response:', data)
      const parsed = parse(WeightsDefaultsResponse, data)
      console.log('[useWeightDefaults] Parsed data:', parsed)
      return parsed
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

type AnalysisParams = {
  symbol: string
  timeframe?: string
  mode?: 'normal'|'advanced'
  weights?: { fundamental?: number, technical?: number, sentiment?: number }
  indicators?: Record<string, any>
  includeHeadlines?: boolean
  bypassCache?: boolean
}

export function useAnalysis(params: AnalysisParams) {
  const { symbol, ...rest } = params
  return useQuery({
    queryKey: ['analysis', params],
    queryFn: async () => {
      console.log('[useAnalysis] Starting analysis for:', symbol, 'params:', rest)
      try {
        const url = `/stock-analysis/analyze`
        console.log('[useAnalysis] Calling:', url, 'with params:', { symbol, ...rest })
        const { data } = await api.get(url, { params: { symbol, ...rest } })
        console.log('[useAnalysis] Raw API response:', data)
        const parsed = parse(AnalysisResponse, data)
        console.log('[useAnalysis] Parsed analysis:', parsed)
        return parsed
      } catch (error: any) {
        console.error('[useAnalysis] Error:', error)
        console.error('[useAnalysis] Error response:', error.response?.data)
        console.error('[useAnalysis] Error status:', error.response?.status)
        throw error
      }
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
