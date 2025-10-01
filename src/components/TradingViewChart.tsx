import React, { useEffect, useRef } from 'react'
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

const formatSymbolForTradingView = (symbol: string): string => {
  // Handle different symbol formats
  if (symbol.includes(':')) {
    return symbol // Already formatted
  }
  
  // Default to NASDAQ for most symbols
  const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'NFLX']
  if (commonSymbols.includes(symbol)) {
    return `NASDAQ:${symbol}`
  }
  
  // For market indices, use appropriate exchanges
  if (symbol === 'S&P500') return 'SPX'
  if (symbol === 'DOW') return 'DOW'
  if (symbol === 'RUSSELL') return 'RUT'
  if (symbol === 'NASDAQ') return 'NASDAQ'
  
  // Default to NASDAQ
  return `NASDAQ:${symbol}`
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

    const containerId = `tradingview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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

    // Cleanup function
    return () => {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }
      } catch (error) {
        console.warn('Chart cleanup error:', error)
      }
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
