import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TradingViewChart from './TradingViewChart'

interface ChartExpandModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: string
  name: string
  value: string
  change: string
  trend: 'up' | 'down'
}

export default function ChartExpandModal({
  isOpen,
  onClose,
  symbol,
  name,
  value,
  change,
  trend
}: ChartExpandModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {name}
            </DialogTitle>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{symbol}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
              <span className={`text-lg font-semibold ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {change}
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <div className="h-full w-full">
            <TradingViewChart 
              symbol={symbol} 
              height={600}
              width="100%"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
