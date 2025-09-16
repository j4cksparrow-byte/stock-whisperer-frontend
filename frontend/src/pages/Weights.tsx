import { useWeightDefaults } from '../lib/queries'
import WeightsPanel from '../components/WeightsPanel'
import { useState } from 'react'

export default function Weights() {
  const { data } = useWeightDefaults()
  const [weights, setWeights] = useState({ fundamental: 40, technical: 35, sentiment: 25 })
  const presets = data?.examples ?? []
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Weights</h1>
      
      <div className="prose max-w-none">
        <p className="text-slate-600">
          Customize how much weight to give each analysis component in your overall score. 
          The system automatically normalizes weights to total 100%.
        </p>
      </div>
      
      <div className="border rounded-md p-4 bg-white">
        <h2 className="text-lg font-medium mb-3">Analysis Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-medium text-blue-700 mb-2">Fundamental (40%)</h3>
            <p className="text-sm text-slate-600">
              Company financials, ratios, valuation metrics, and intrinsic value analysis.
            </p>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-medium text-green-700 mb-2">Technical (35%)</h3>
            <p className="text-sm text-slate-600">
              Price patterns, indicators, momentum, and market trends from chart analysis.
            </p>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-medium text-purple-700 mb-2">Sentiment (25%)</h3>
            <p className="text-sm text-slate-600">
              News sentiment, social media analysis, and market psychology indicators.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-3">Preset Weighting Strategies</h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {presets.map((p: any, i: number) => (
            <button
              key={i}
              className="px-3 py-2 rounded-md bg-white border text-sm hover:bg-slate-50"
              onClick={() => setWeights({ fundamental: p.fundamental, technical: p.technical, sentiment: p.sentiment })}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-500">
                F:{p.fundamental} T:{p.technical} S:{p.sentiment}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="border rounded-md p-3 bg-white">
        <WeightsPanel initial={weights} onChange={setWeights} />
      </div>
      
      <div className="border rounded-md p-4 bg-white">
        <h2 className="text-lg font-medium mb-3">Weighting Strategies Explained</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-slate-800">Conservative Value Investing</h3>
            <p className="text-sm text-slate-600">
              Focus on company fundamentals with 50% weight, technical analysis at 30%, and sentiment at 20%.
              Best for long-term investors who prioritize financial health over short-term market movements.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-800">Technical Trading</h3>
            <p className="text-sm text-slate-600">
              Emphasis on price action and technical indicators with 60% weight, fundamentals at 20%, and sentiment at 20%.
              Ideal for active traders who rely on chart patterns and momentum signals.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-800">Sentiment Momentum</h3>
            <p className="text-sm text-slate-600">
              Follow market psychology and news sentiment with 45% weight, technical analysis at 30%, and fundamentals at 25%.
              Suited for traders who capitalize on market hype and news-driven movements.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-800">Balanced Multi-Factor</h3>
            <p className="text-sm text-slate-600">
              Equal consideration of all factors with 40% fundamentals, 35% technicals, and 25% sentiment.
              Provides a well-rounded approach for most investment styles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
