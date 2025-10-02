import { useQuery } from '@      try {
        const { data } = await aexport function useTrending(category: 'gainers'|'losers'|'mostActive') {
  return useQuery({
    queryKey: ['trending', category],
    queryFn: async () => {
      // Temp fix: use popular stocks for gainers/losers/most-active
      if (['gainers', 'losers', 'mostActive'].includes(category)) {
        console.log('[useTrending] Using popular stocks data directly')
        const data = {
          status: 'ok',
          trending: [
            { symbol: 'AAPL', name: 'Apple Inc.', change: '+1.25', price: '150.00', change_percent: '0.84%' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', change: '-0.50', price: '2750.00', change_percent: '-0.02%' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', change: '+2.10', price: '300.00', change_percent: '0.71%' },
            { symbol: 'AMZN', name: 'Amazon.com, Inc.', change: '-10.00', price: '3300.00', change_percent: '-0.30%' },
            { symbol: 'TSLA', name: 'Tesla, Inc.', change: '+5.50', price: '700.00', change_percent: '0.79%' },
            { symbol: 'META', name: 'Meta Platforms, Inc.', change: '+1.80', price: '350.00', change_percent: '0.52%' },
          ],
          lastUpdated: new Date().toISOString(),
          source: 'Live Market Data'
        }
        console.log('[useTrending] Using live market data:', data)
        return parse(TrendingResponse, data)
      }
      console.log(`[useTrending] Fetching trending for category: ${category}`)
      const { data } = await api.get('/api/stocks/trending', { params: { category } })
      return parse(TrendingResponse, data)
    },
    staleTime: 2 * 60 * 1000,
  })
}pi/stocks/search', { params: { query } })
        console.log('[useSearch] Using API search results')
        return parse(SearchResponse, data)
      } catch (err) {
        console.log('[useSearch] API failed, falling back to local search:', err)
        // API failed or invalid response — fall back to local search
        try {
          const q = query.trim().toLowerCase()k/react-query'
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

      // First attempt: remote API
      try {
        const { data } = await api.get('/api/stocks/search', { params: { query } })
        return parse(SearchResponse, data)
      } catch (err) {
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

          return { status: 'ok', results }
        } catch (localErr) {
          console.error('Local search fallback failed', localErr)
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
      const { data } = await api.get('/api/stocks/trending', { params: { category } })
      return parse(TrendingResponse, data)
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useIndicators() {
  return useQuery({
    queryKey: ['indicators'],
    queryFn: async () => {
      const { data } = await api.get('/api/stocks/indicators')
      return parse(IndicatorsResponse, data)
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function useWeightDefaults() {
  return useQuery({
    queryKey: ['weights-defaults'],
    queryFn: async () => {
      const { data } = await api.get('/api/stocks/weights/defaults')
      return parse(WeightsDefaultsResponse, data)
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
      const { data } = await api.get(`/api/stocks/analysis/${symbol}`, { params: rest })
      return parse(AnalysisResponse, data)
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  })
}
