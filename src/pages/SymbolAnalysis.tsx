import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAnalysis } from '../lib/queries'
import WeightsPanel from '../components/WeightsPanel'
import IndicatorsPanel from '../components/IndicatorsPanel'
import PriceChart from '../components/PriceChart'
import ScoreBadge from '../components/ScoreBadge'
import RecommendationChip from '../components/RecommendationChip'
import AISummary from '../components/AISummary'
import HeadlineList from '../components/HeadlineList'
import LoadingSpinner from '../components/LoadingSpinner'
import { encodeState, decodeState } from '../lib/urlState'

const timeframes = ['1D','1W','1M','3M','6M','1Y','2Y'] as const
const modes = ['normal','advanced'] as const

export default function SymbolAnalysis() {
  const { symbol = '' } = useParams()
  const [sp, setSP] = useSearchParams()
  const [timeframe, setTimeframe] = useState(sp.get('tf') ?? '1M')
  const [mode, setMode] = useState<'normal'|'advanced'>((sp.get('mode') as any) ?? 'normal')
  const [weights, setWeights] = useState({ fundamental: 40, technical: 35, sentiment: 25 })
  const [indConfig, setIndConfig] = useState<Record<string, any>>(decodeState(sp.get('ind') ) ?? {})

  const includeHeadlines = sp.get('headlines') !== 'false'
  const bypassCache = sp.get('refresh') === '1'

  const { data, isFetching, refetch, error } = useAnalysis({
    symbol, timeframe, mode,
    weights: mode === 'advanced' ? weights : undefined,
    indicators: Object.keys(indConfig).length ? indConfig : undefined,
    includeHeadlines, bypassCache
  })

  function syncURL() {
    const ind = encodeState(indConfig)
    const params = new URLSearchParams(sp)
    params.set('tf', timeframe)
    params.set('mode', mode)
    if (ind) params.set('ind', ind)
    setSP(params, { replace: true })
  }

  // Format technical indicators for display
  const formatIndicatorValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (Array.isArray(value) && value.length > 0) {
      const lastValue = value[value.length - 1];
      return typeof lastValue === 'number' ? lastValue.toFixed(2) : String(lastValue);
    }
    return String(value);
  };

  // Get technical indicators data
  const technicalIndicators = data?.analysis?.technical?.indicators || {};
  const patterns = technicalIndicators.patterns || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">{symbol}</h1>
        <select className="border rounded px-2 py-1" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
          {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={mode} onChange={e => setMode(e.target.value as any)}>
          {modes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button 
          className="ml-auto px-3 py-2 rounded bg-slate-900 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
          onClick={() => { syncURL(); refetch() }}
          disabled={isFetching}
        >
          {isFetching && <LoadingSpinner size="sm" />}
          {isFetching ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {mode === 'advanced' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-3 bg-white">
            <div className="font-medium mb-2">Weights</div>
            <WeightsPanel initial={weights} onChange={setWeights} />
          </div>
          <div className="border rounded-md p-3 bg-white">
            <div className="font-medium mb-2">Indicators</div>
            <IndicatorsPanel 
              onChange={setIndConfig} 
              initialConfig={indConfig}
            />
          </div>
        </div>
      )}

      <PriceChart />

      {error && (
        <div className="border border-red-200 rounded-md p-4 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error loading analysis</span>
          </div>
          <p className="text-red-700 text-sm mt-1">Please try again or check if the symbol is valid.</p>
        </div>
      )}

      {data?.analysis && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-md p-3 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Fundamental</div>
              <ScoreBadge score={data.analysis.fundamental?.score} />
            </div>
            <div className="text-sm">Rec: <RecommendationChip rec={data.analysis.fundamental?.recommendation} /></div>
            <div className="text-xs text-slate-500">
              Weight: {data.analysis.fundamental?.weight || '40%'}
            </div>
          </div>
          <div className="border rounded-md p-3 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Technical</div>
              <ScoreBadge score={data.analysis.technical?.score} />
            </div>
            <div className="text-sm">Rec: <RecommendationChip rec={data.analysis.technical?.recommendation} /></div>
            <div className="text-xs text-slate-500">
              Weight: {data.analysis.technical?.configuration?.weight || '35%'}
            </div>
          </div>
          <div className="border rounded-md p-3 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Sentiment</div>
              <ScoreBadge score={data.analysis.sentiment?.score} />
            </div>
            <div className="text-sm">Rec: <RecommendationChip rec={data.analysis.sentiment?.recommendation} /></div>
            <div className="text-xs text-slate-500">
              Weight: {data.analysis.sentiment?.weight || '25%'}
            </div>
          </div>
        </div>
      )}

      {data?.analysis?.overall && (
        <div className="border rounded-md p-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="font-medium">Overall</div>
            <ScoreBadge score={data.analysis.overall?.score} />
            <RecommendationChip rec={data.analysis.overall?.recommendation} />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Weights: F:{data?.analysis?.meta?.weightsUsed?.fundamental || 40}% 
            T:{data?.analysis?.meta?.weightsUsed?.technical || 35}% 
            S:{data?.analysis?.meta?.weightsUsed?.sentiment || 25}%
          </div>
        </div>
      )}

      {mode === 'advanced' && Object.keys(technicalIndicators).length > 0 && (
        <div className="border rounded-md p-3 bg-white">
          <h3 className="font-medium mb-2">Technical Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(technicalIndicators).map(([key, value]) => {
              // Skip patterns as they're displayed separately
              if (key === 'patterns') return null;
              
              return (
                <div key={key} className="border rounded p-2">
                  <div className="font-medium text-sm">{key}</div>
                  {typeof value === 'object' && value !== null ? (
                    <div className="text-xs space-y-1 mt-1">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex justify-between">
                          <span className="text-slate-600">{subKey}:</span>
                          <span className="font-mono">{formatIndicatorValue(subValue)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="font-mono text-sm mt-1">{formatIndicatorValue(value)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {patterns.length > 0 && (
        <div className="border rounded-md p-3 bg-white">
          <h3 className="font-medium mb-2">Pattern Recognition</h3>
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern: any, index: number) => (
              <div 
                key={index} 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pattern.direction === 'bullish' 
                    ? 'bg-green-100 text-green-800' 
                    : pattern.direction === 'bearish' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {pattern.pattern} ({pattern.confidence}%)
              </div>
            ))}
          </div>
        </div>
      )}

      <AISummary text={data?.analysis?.aiInsights?.summary} />
    </div>
  )
}
