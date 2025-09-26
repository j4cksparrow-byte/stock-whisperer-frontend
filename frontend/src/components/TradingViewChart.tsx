import { useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface TradingViewChartProps {
  symbol?: string
  height?: number
  width?: string
}

declare global {
  interface Window {
    TradingView: any;
  }
}

// Helper function to format symbol for TradingView
const formatSymbolForTradingView = (symbol: string): string => {
  if (!symbol) return 'NASDAQ:AAPL'
  
  // If symbol already has exchange prefix, return as is
  if (symbol.includes(':')) return symbol
  
  // Common exchange mappings for popular symbols
  const exchangeMap: Record<string, string> = {
    // Major US stocks
    'AAPL': 'NASDAQ:AAPL',
    'GOOGL': 'NASDAQ:GOOGL',
    'MSFT': 'NASDAQ:MSFT',
    'AMZN': 'NASDAQ:AMZN',
    'TSLA': 'NASDAQ:TSLA',
    'META': 'NASDAQ:META',
    'NFLX': 'NASDAQ:NFLX',
    'NVDA': 'NASDAQ:NVDA',
    'AMD': 'NASDAQ:AMD',
    // Major NYSE stocks
    'JPM': 'NYSE:JPM',
    'JNJ': 'NYSE:JNJ',
    'V': 'NYSE:V',
    'PG': 'NYSE:PG',
    'UNH': 'NYSE:UNH',
    'HD': 'NYSE:HD',
    'MA': 'NYSE:MA',
    'BAC': 'NYSE:BAC',
    'XOM': 'NYSE:XOM',
    'CVX': 'NYSE:CVX'
  }
  
  // Check if we have a specific mapping
  const upperSymbol = symbol.toUpperCase()
  if (exchangeMap[upperSymbol]) {
    return exchangeMap[upperSymbol]
  }
  
  // Default to NASDAQ for unknown symbols (most tech stocks)
  return `NASDAQ:${upperSymbol}`
}

export default function TradingViewChart({ 
  symbol = 'AAPL', 
  height = 400,
  width = '100%' 
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()
  const formattedSymbol = formatSymbolForTradingView(symbol)

  useEffect(() => {
    if (!containerRef.current) return

    const containerId = `tradingview_${Date.now()}`
    
    // Clean up any existing content
    containerRef.current.innerHTML = `
      <div id="${containerId}" style="height: ${height}px; width: 100%;">
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
          Loading chart...
        </div>
      </div>
    `

    // Create the TradingView widget script
    const widgetScript = document.createElement('script')
    widgetScript.type = 'text/javascript'
    widgetScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    widgetScript.async = true
    
    const widgetConfig = {
      "autosize": true,
      "symbol": formattedSymbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": resolvedTheme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    }
    
    widgetScript.innerHTML = JSON.stringify(widgetConfig)
    
    // Find the container and append the script
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = ''
      container.appendChild(widgetScript)
    }

  }, [formattedSymbol, resolvedTheme, height, width])

  return (
    <div className="w-full border rounded-md overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-2 border-b bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formattedSymbol} Chart
        </h3>
      </div>
      <div 
        ref={containerRef} 
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
