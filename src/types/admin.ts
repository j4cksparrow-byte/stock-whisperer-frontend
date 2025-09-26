export interface HealthResponse {
  status: string
  environment: string
  uptime: number
  timestamp: string
}

export interface ConfigResponse {
  alpha_vantage_configured: boolean
  gemini_configured: boolean
  ready_for_development: boolean
  alpha_vantage: {
    ready: boolean
    status: string
  }
  gemini: {
    ready: boolean
    status: string
  }
  overall_status: string
}

export interface CacheResponse {
  cache: {
    size: number
    hits: number
    misses: number
    total: number
    valid: number
    expired: number
  }
}