import { z } from 'zod'

export const ScoreBlock = z.object({
  score: z.number().optional(),
  recommendation: z.string().optional(),
}).passthrough()

export const AnalysisResponse = z.object({
  status: z.string(),
  symbol: z.string(),
  analysis: z.object({
    mode: z.string(),
    timeframe: z.string(),
    timestamp: z.string().optional(),
    fundamental: ScoreBlock.optional(),
    technical: ScoreBlock.optional(),
    sentiment: ScoreBlock.optional(),
    overall: ScoreBlock.optional(),
    aiInsights: z.object({ summary: z.string().optional() }).optional(),
    meta: z.record(z.any()).optional()
  })
})

export type AnalysisResponse = z.infer<typeof AnalysisResponse>

export const IndicatorsResponse = z.object({
  status: z.string(),
  availableIndicators: z.record(z.array(z.string())).optional(),
  defaultConfig: z.record(z.any()).optional(),
})

export type IndicatorsResponse = z.infer<typeof IndicatorsResponse>

export const WeightsDefaultsResponse = z.object({
  status: z.string(),
  defaultWeights: z.record(z.number()),
  description: z.record(z.string()).optional(),
  examples: z.array(z.record(z.any())).optional()
})
export type WeightsDefaultsResponse = z.infer<typeof WeightsDefaultsResponse>

export const SearchResponseItem = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  region: z.string().optional(),
  type: z.string().optional(),
})

export const SearchResponse = z.object({
  status: z.string().optional(),
  results: z.array(SearchResponseItem).optional()
})
export type SearchResponse = z.infer<typeof SearchResponse>

export const TrendingBucket = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  price: z.number().optional(),
  change: z.number().optional()
})

export const TrendingResponse = z.object({
  status: z.string().optional(),
  lastUpdated: z.string().optional(),
  gainers: z.array(TrendingBucket).optional(),
  losers: z.array(TrendingBucket).optional(),
  mostActive: z.array(TrendingBucket).optional(),
})
export type TrendingResponse = z.infer<typeof TrendingResponse>
