import IndicatorsPanel from '../components/IndicatorsPanel'
import { useState } from 'react'
import { useIndicators } from '../lib/queries'

export default function Indicators() {
  const [config, setConfig] = useState<Record<string, any>>({})
  const { data } = useIndicators()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Indicators</h1>
      
      <div className="prose max-w-none">
        <p className="text-slate-600">
          Select which technical indicators to calculate during advanced analysis. 
          You can customize the parameters for each indicator to match your trading strategy.
        </p>
      </div>
      
      <IndicatorsPanel onChange={setConfig} />
      
      <div className="border rounded-md p-4 bg-white">
        <h2 className="text-lg font-medium mb-3">About Technical Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Trend Indicators</h3>
            <p className="text-sm text-slate-600">
              Trend indicators help identify the direction and strength of price movements. 
              Examples include Moving Averages and MACD.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Momentum Indicators</h3>
            <p className="text-sm text-slate-600">
              Momentum indicators measure the speed and strength of price movements. 
              Examples include RSI and Stochastic Oscillator.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Volatility Indicators</h3>
            <p className="text-sm text-slate-600">
              Volatility indicators measure the degree of price variation. 
              Examples include Bollinger Bands and ATR.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Volume Indicators</h3>
            <p className="text-sm text-slate-600">
              Volume indicators analyze trading volume to confirm trends. 
              Examples include On-Balance Volume (OBV).
            </p>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-white">
        <h2 className="text-lg font-medium mb-3">Pattern Recognition</h2>
        <p className="text-slate-600 mb-3">
          The system automatically detects common candlestick patterns such as:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Hammer and Hanging Man</li>
          <li>Bullish and Bearish Engulfing</li>
          <li>Morning and Evening Star</li>
          <li>Doji and Spinning Tops</li>
        </ul>
        <p className="text-slate-600 mt-3">
          Patterns are detected with confidence scores to help you assess their reliability.
        </p>
      </div>
      
      <div className="text-xs text-slate-500">
        <div className="mb-2">Selected config (for reference):</div>
        <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </div>
  )
}
