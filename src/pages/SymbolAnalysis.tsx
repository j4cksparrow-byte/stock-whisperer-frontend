import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
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
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-3xl font-bold text-foreground">{symbol}</h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Timeframe:</label>
            <select 
              className="border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent" 
              value={timeframe} 
              onChange={e => setTimeframe(e.target.value)}
            >
              {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Mode:</label>
            <select 
              className="border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent" 
              value={mode} 
              onChange={e => setMode(e.target.value as any)}
            >
              {modes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <Button 
            className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={() => { syncURL(); refetch() }}
            disabled={isFetching}
          >
            {isFetching && <LoadingSpinner size="sm" className="mr-2" />}
            {isFetching ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>

        {mode === 'advanced' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-md p-4 bg-card">
              <div className="font-medium mb-3 text-foreground">Weights</div>
              <WeightsPanel initial={weights} onChange={setWeights} />
            </div>
            <div className="border border-border rounded-md p-4 bg-card">
              <div className="font-medium mb-3 text-foreground">Indicators</div>
              <IndicatorsPanel 
                onChange={setIndConfig} 
                initialConfig={indConfig}
              />
            </div>
          </div>
        )}

        <PriceChart />

        {error && (
          <div className="border border-destructive/50 rounded-md p-4 bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error loading analysis</span>
            </div>
            <p className="text-destructive/80 text-sm mt-1">Please try again or check if the symbol is valid.</p>
          </div>
        )}

        {data?.analysis && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border rounded-md p-4 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-foreground">Fundamental</div>
                <ScoreBadge score={data.analysis.fundamental?.score} />
              </div>
              <div className="text-sm text-muted-foreground">Rec: <RecommendationChip rec={data.analysis.fundamental?.recommendation} /></div>
              <div className="text-xs text-muted-foreground">
                Weight: {data.analysis.fundamental?.weight || '40%'}
              </div>
            </div>
            <div className="border border-border rounded-md p-4 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-foreground">Technical</div>
                <ScoreBadge score={data.analysis.technical?.score} />
              </div>
              <div className="text-sm text-muted-foreground">Rec: <RecommendationChip rec={data.analysis.technical?.recommendation} /></div>
              <div className="text-xs text-muted-foreground">
                Weight: {data.analysis.technical?.configuration?.weight || '35%'}
              </div>
            </div>
            <div className="border border-border rounded-md p-4 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-foreground">Sentiment</div>
                <ScoreBadge score={data.analysis.sentiment?.score} />
              </div>
              <div className="text-sm text-muted-foreground">Rec: <RecommendationChip rec={data.analysis.sentiment?.recommendation} /></div>
              <div className="text-xs text-muted-foreground">
                Weight: {data.analysis.sentiment?.weight || '25%'}
              </div>
            </div>
          </div>
        )}

        {data?.analysis?.overall && (
          <div className="border border-border rounded-md p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="font-medium text-foreground">Overall</div>
              <ScoreBadge score={data.analysis.overall?.score} />
              <RecommendationChip rec={data.analysis.overall?.recommendation} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Weights: F:{data?.analysis?.meta?.weightsUsed?.fundamental || 40}% 
              T:{data?.analysis?.meta?.weightsUsed?.technical || 35}% 
              S:{data?.analysis?.meta?.weightsUsed?.sentiment || 25}%
            </div>
          </div>
        )}

        {mode === 'advanced' && Object.keys(technicalIndicators).length > 0 && (
          <div className="border border-border rounded-md p-4 bg-card">
            <h3 className="font-medium mb-3 text-foreground">Technical Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(technicalIndicators).map(([key, value]) => {
              // Skip patterns as they're displayed separately
              if (key === 'patterns') return null;
              
              return (
                <div key={key} className="border border-border rounded p-3 bg-card">
                  <div className="font-medium text-sm text-foreground">{key}</div>
                  {typeof value === 'object' && value !== null ? (
                    <div className="text-xs space-y-1 mt-1">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex justify-between">
                          <span className="text-muted-foreground">{subKey}:</span>
                          <span className="font-mono text-foreground">{formatIndicatorValue(subValue)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="font-mono text-sm mt-1 text-foreground">{formatIndicatorValue(value)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

        {patterns.length > 0 && (
          <div className="border border-border rounded-md p-4 bg-card">
            <h3 className="font-medium mb-3 text-foreground">Pattern Recognition</h3>
            <div className="flex flex-wrap gap-2">
              {patterns.map((pattern: any, index: number) => (
                <div 
                  key={index} 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pattern.direction === 'bullish' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : pattern.direction === 'bearish' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
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
    </div>
  )
}
