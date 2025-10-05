import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface KeyRotationState {
  activeKeyIndex: number
  exhaustionTimestamps: { [key: number]: number }
  lastRotation: number
}

const CACHE_KEY = 'gemini_key_rotation_state'
const CACHE_EXPIRY_HOURS = 24
const QUOTA_ERROR_KEYWORDS = ['quota', 'limit', 'exceeded', 'resource_exhausted', 'too many requests']

export class GeminiKeyManager {
  private keys: string[]
  private supabase: any
  private state: KeyRotationState

  constructor() {
    const key1 = Deno.env.get('GEMINI_API_KEY')
    const key2 = Deno.env.get('GEMINI_API_KEY_2')
    
    this.keys = [key1, key2].filter(Boolean) as string[]
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    this.supabase = createClient(supabaseUrl, supabaseKey)
    
    this.state = {
      activeKeyIndex: 0,
      exhaustionTimestamps: {},
      lastRotation: Date.now()
    }
  }

  async initialize(): Promise<void> {
    try {
      const { data } = await this.supabase.rpc('get_cache_value', {
        _cache_key: CACHE_KEY,
        _user_id: null
      })

      if (data) {
        this.state = data as KeyRotationState
        console.log('[Gemini Key Manager] Loaded state from cache:', this.state)
      }
    } catch (error) {
      console.error('[Gemini Key Manager] Error loading state:', error)
    }
  }

  async getActiveKey(): Promise<string> {
    await this.initialize()
    
    // Check if current key is exhausted
    const currentTime = Date.now()
    const exhaustedTime = this.state.exhaustionTimestamps[this.state.activeKeyIndex]
    
    // If exhausted and less than 24 hours have passed, try next key
    if (exhaustedTime && (currentTime - exhaustedTime) < (24 * 60 * 60 * 1000)) {
      console.log(`[Gemini Key Manager] Key ${this.state.activeKeyIndex} is exhausted, switching...`)
      await this.switchToNextKey()
    }

    const activeKey = this.keys[this.state.activeKeyIndex]
    console.log(`[Gemini Key Manager] Using key index: ${this.state.activeKeyIndex}`)
    return activeKey
  }

  async handleQuotaError(error: any): Promise<boolean> {
    const errorString = JSON.stringify(error).toLowerCase()
    const isQuotaError = error.status === 429 || 
                        QUOTA_ERROR_KEYWORDS.some(keyword => errorString.includes(keyword))

    if (isQuotaError) {
      console.error(`[Gemini Key Manager] Quota error detected for key ${this.state.activeKeyIndex}`)
      
      // Mark current key as exhausted
      this.state.exhaustionTimestamps[this.state.activeKeyIndex] = Date.now()
      
      // Switch to next key if available
      if (this.keys.length > 1) {
        await this.switchToNextKey()
        return true // Indicate that we switched keys
      }
    }

    return false // No key switch occurred
  }

  private async switchToNextKey(): Promise<void> {
    const nextIndex = (this.state.activeKeyIndex + 1) % this.keys.length
    
    // Check if next key is also exhausted
    const exhaustedTime = this.state.exhaustionTimestamps[nextIndex]
    const currentTime = Date.now()
    
    if (exhaustedTime && (currentTime - exhaustedTime) < (24 * 60 * 60 * 1000)) {
      console.error('[Gemini Key Manager] All keys are exhausted!')
      throw new Error('All Gemini API keys have reached their quota limits. Please try again later.')
    }

    this.state.activeKeyIndex = nextIndex
    this.state.lastRotation = currentTime
    
    console.log(`[Gemini Key Manager] Switched to key index: ${nextIndex}`)
    
    await this.saveState()
  }

  private async saveState(): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + CACHE_EXPIRY_HOURS)

      await this.supabase.rpc('set_cache_value', {
        _cache_key: CACHE_KEY,
        _cache_value: this.state,
        _expires_at: expiresAt.toISOString(),
        _user_id: null
      })

      console.log('[Gemini Key Manager] State saved to cache')
    } catch (error) {
      console.error('[Gemini Key Manager] Error saving state:', error)
    }
  }

  async resetDailyQuota(): Promise<void> {
    const currentTime = Date.now()
    const hoursSinceLastRotation = (currentTime - this.state.lastRotation) / (1000 * 60 * 60)
    
    if (hoursSinceLastRotation >= 24) {
      console.log('[Gemini Key Manager] 24 hours passed, resetting quota tracking')
      this.state.exhaustionTimestamps = {}
      this.state.lastRotation = currentTime
      await this.saveState()
    }
  }
}
