import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'

interface PriceChartProps {
  symbol?: string
  priceData?: Array<{ time: string; open: number; high: number; low: number; close: number; volume?: number }>
  currentPrice?: number
  isLoading?: boolean
}

export default function PriceChart({ symbol, priceData, currentPrice, isLoading }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Create chart
    const chart = createChart(containerRef.current, { 
      height: 300, 
      layout: { 
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      timeScale: {
        borderColor: '#ddd',
      },
    })
    chartRef.current = chart

    const series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // Set data if available
    if (priceData && priceData.length > 0) {
      series.setData(priceData)
    }

    const handle = () => chart.timeScale().fitContent()
    window.addEventListener('resize', handle)
    handle()

    return () => {
      window.removeEventListener('resize', handle)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (chartRef.current && priceData && priceData.length > 0) {
      const series = chartRef.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })
      series.setData(priceData)
      chartRef.current.timeScale().fitContent()
    }
  }, [priceData])

  return (
    <div className="border rounded-md bg-white">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-sm text-slate-600">Loading chart data...</div>
        </div>
      )}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="font-medium">{symbol || 'Stock Price'}</div>
          {currentPrice && (
            <div className="text-lg font-semibold text-slate-900">${currentPrice.toFixed(2)}</div>
          )}
        </div>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
