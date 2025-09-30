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
        const { data } = await api.get('/stocks-api/trending', { params: { category } })
        console.log('[useTrending] API response:', data)
        const parsed = parse(TrendingResponse, data)
        console.log('[useTrending] Parsed data:', parsed)
        return parsed
      } catch (err) {
        // Fallback to mock data when API fails
        console.warn('[useTrending] API failed, using mock data:', err)
        const mockData = {
          status: 'ok',
          trending: [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35, volume: '45.2M', exchange: 'NASDAQ' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -1.23, changePercent: -0.49, volume: '38.5M', exchange: 'NASDAQ' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 0.87, changePercent: 0.61, volume: '22.1M', exchange: 'NASDAQ' },
            { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 1.45, changePercent: 0.38, volume: '28.7M', exchange: 'NASDAQ' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.20, change: -0.67, changePercent: -0.43, volume: '18.9M', exchange: 'NASDAQ' },
            { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.30, change: 3.21, changePercent: 0.67, volume: '15.3M', exchange: 'NASDAQ' },
          ]
        }
        return parse(TrendingResponse, mockData)
      }
    },
    staleTime: 2 * 60 * 1000,
  })
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
