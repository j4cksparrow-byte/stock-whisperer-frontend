import React, { createContext, useContext, useState, useEffect } from 'react'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  addedAt: string
}

interface WatchlistContextType {
  watchlist: WatchlistItem[]
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void
  removeFromWatchlist: (symbol: string) => void
  isWatched: (symbol: string) => boolean
  clearWatchlist: () => void
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export const useWatchlist = () => {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}

interface WatchlistProviderProps {
  children: React.ReactNode
}

export const WatchlistProvider: React.FC<WatchlistProviderProps> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('stockviz_watchlist')
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored))
      } catch (error) {
        console.warn('Failed to parse watchlist from localStorage:', error)
        localStorage.removeItem('stockviz_watchlist')
      }
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockviz_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (item: Omit<WatchlistItem, 'addedAt'>) => {
    const newItem: WatchlistItem = {
      ...item,
      addedAt: new Date().toISOString()
    }
    
    setWatchlist(prev => {
      // Check if already exists
      const exists = prev.some(w => w.symbol === item.symbol)
      if (exists) return prev
      
      return [...prev, newItem]
    })
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol))
  }

  const isWatched = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol)
  }

  const clearWatchlist = () => {
    setWatchlist([])
  }

  const value: WatchlistContextType = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isWatched,
    clearWatchlist
  }

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}
