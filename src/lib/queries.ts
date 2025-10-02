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
      
      // Use Supabase edge function for trending data
      const { data } = await api.get('/stocks-api/trending', { params: { category } })
      console.log('[useTrending] API response:', data)
      return parse(TrendingResponse, data)
    },
    staleTime: 30 * 1000, // Refresh every 30 seconds for more live feel
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
