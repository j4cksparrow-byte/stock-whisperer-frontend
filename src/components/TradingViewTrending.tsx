import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Activity, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import tradingViewService from '../services/tradingViewService'

// TradingView widget types
declare global {
  interface Window {
    TradingView: any;
  }
}

const tabs = ['gainers', 'losers', 'mostActive'] as const

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  exchange: string;
}

interface MarketOverview {
  totalGainers: number;
  totalLosers: number;
  totalUnchanged: number;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
}

export default function TradingViewTrending() {
  const [tab, setTab] = useState<typeof tabs[number]>('gainers')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stocks, setStocks] = useState<TrendingStock[]>([])
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "NASDAQ:AAPL", title: "Apple Inc." },
        { proName: "NASDAQ:MSFT", title: "Microsoft Corporation" },
        { proName: "NASDAQ:GOOGL", title: "Alphabet Inc." },
        { proName: "NASDAQ:AMZN", title: "Amazon.com Inc." },
        { proName: "NASDAQ:META", title: "Meta Platforms Inc." },
        { proName: "NASDAQ:NVDA", title: "NVIDIA Corporation" },
        { proName: "NASDAQ:TSLA", title: "Tesla Inc." },
        { proName: "NASDAQ:NFLX", title: "Netflix Inc." },
      ],
      showSymbolLogo: true,
      colorTheme: "light",
      isTransparent: false,
      displayMode: "adaptive",
      locale: "en"
    })
    
    document.head.appendChild(script)
    
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Load data from TradingView service
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const [stocksData, overviewData] = await Promise.all([
          tradingViewService.getTrendingStocks(tab),
          tradingViewService.getMarketOverview()
        ])
        
        setStocks(stocksData)
        setMarketOverview(overviewData)
        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load trending data:', err)
        setError('Failed to load trending data. Please try again.')
        setIsLoading(false)
      }
    }

    loadData()
  }, [tab])

  // Auto-refresh every 30 seconds for live data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        const loadData = async () => {
          try {
            const [stocksData, overviewData] = await Promise.all([
              tradingViewService.getTrendingStocks(tab),
              tradingViewService.getMarketOverview()
            ])
            
            setStocks(stocksData)
            setMarketOverview(overviewData)
            setLastUpdated(new Date())
          } catch (err) {
            console.warn('Auto-refresh failed:', err)
          }
        }
        loadData()
      }
    }, 30 * 1000) // 30 seconds for live data

    return () => clearInterval(interval)
  }, [tab, isLoading])

  const getTrendIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [stocksData, overviewData] = await Promise.all([
        tradingViewService.getTrendingStocks(tab),
        tradingViewService.getMarketOverview()
      ])
      
      setStocks(stocksData)
      setMarketOverview(overviewData)
      setLastUpdated(new Date())
      setIsLoading(false)
    } catch (err) {
      console.error('Refresh failed:', err)
      setError('Failed to refresh data. Please try again.')
      setIsLoading(false)
    }
  }

  const getMarketStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 dark:text-green-400'
      case 'pre-market': return 'text-yellow-600 dark:text-yellow-400'
      case 'after-hours': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getMarketStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      case 'pre-market': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'after-hours': return <Clock className="h-4 w-4 text-orange-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Overview & TradingView Ticker Tape */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Live Market Data
              </h3>
              {marketOverview && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {getMarketStatusIcon(marketOverview.marketStatus)}
                    <span className={`font-medium ${getMarketStatusColor(marketOverview.marketStatus)}`}>
                      Market {marketOverview.marketStatus.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-gray-500 dark:text-gray-400">
                    <span>Gainers: <span className="font-semibold text-green-600 dark:text-green-400">{marketOverview.totalGainers}</span></span>
                    <span>Losers: <span className="font-semibold text-red-600 dark:text-red-400">{marketOverview.totalLosers}</span></span>
                    <span>Unchanged: <span className="font-semibold text-gray-600 dark:text-gray-400">{marketOverview.totalUnchanged}</span></span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="h-16 flex items-center">
          <div className="tradingview-widget-container w-full h-full">
            <div className="tradingview-widget-container__widget w-full h-full"></div>
          </div>
        </div>
      </div>

      {/* Trending Tabs */}
      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                t === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
            >
              {t === 'gainers' && '📈 Gainers'}
              {t === 'losers' && '📉 Losers'}
              {t === 'mostActive' && '🔥 Most Active'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading {tab} data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load data</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <div
                key={stock.symbol}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{stock.symbol}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.name}</p>
                    </div>
                    {getTrendIcon(stock.change)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${stock.price.toFixed(2)}
                      </span>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${getTrendColor(stock.change)}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </div>
                        <div className={`text-xs ${getTrendColor(stock.change)}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Vol: {stock.volume}</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                          {stock.exchange}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">
                        {tab === 'gainers' ? '📈 Gaining' : tab === 'losers' ? '📉 Losing' : '🔥 Active'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
