import { useParams, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAnalysis } from '../lib/queries'
import { useStockNews } from '../lib/newsQueries'
import WeightsPanel from '../components/WeightsPanel'
import TradingViewChart from '../components/TradingViewChart'
import AISummary from '../components/AISummary'
import LoadingSpinner from '../components/LoadingSpinner'
import CircularGauge from '../components/CircularGauge'
import MetricCard from '../components/MetricCard'
import SentimentBar from '../components/SentimentBar'
import NewsCard from '../components/NewsCard'
import FundamentalsTable from '../components/FundamentalsTable'
import { Card } from '../components/ui/card'
import { encodeState, decodeState } from '../lib/urlState'

export default function SymbolAnalysis() {
  const { symbol = '' } = useParams()
  const [sp] = useSearchParams()
  
  // Decode Pro mode parameters from URL
  const weightsParam = sp.get('weights')
  const indicatorsParam = sp.get('indicators')
  const decodedWeights = weightsParam ? decodeState(weightsParam) : null
  const decodedIndicators = indicatorsParam ? decodeState(indicatorsParam) : null
  
  const [weights, setWeights] = useState(
    decodedWeights || { fundamental: 40, technical: 35, sentiment: 25 }
  )

  const timeframe = sp.get('tf') ?? '1M'
  const mode = (sp.get('mode') as 'normal' | 'advanced') ?? 'normal'
  const includeHeadlines = sp.get('headlines') !== 'false'
  const bypassCache = sp.get('refresh') === '1'

  const { data, isFetching, error } = useAnalysis({
    symbol,
    timeframe,
    mode,
    weights: mode === 'advanced' ? weights : undefined,
    indicators: mode === 'advanced' && decodedIndicators ? decodedIndicators : undefined,
    includeHeadlines,
    bypassCache
  })

  // Fetch news
  const { data: newsData } = useStockNews(symbol)

  // Extract analysis data
  const technicalScore = data?.analysis?.technical?.score ?? 0
  const fundamentalScore = data?.analysis?.fundamental?.score ?? 0
  const sentimentScore = data?.analysis?.sentiment?.score ?? 0
  const overallScore = data?.analysis?.overall?.score ?? 0
  const recommendation = data?.analysis?.overall?.recommendation ?? 'HOLD'
  const aiSummary = data?.analysis?.aiInsights?.summary
  const currentPrice = data?.currentPrice ?? 0
  const priceHistory = data?.priceHistory || []
  const priceChange = priceHistory.length >= 2 
    ? priceHistory[priceHistory.length - 1].close - priceHistory[priceHistory.length - 2].close 
    : 0
  const priceChangePercent = priceHistory.length >= 2 && priceHistory[priceHistory.length - 2].close > 0
    ? ((priceChange / priceHistory[priceHistory.length - 2].close) * 100)
    : 0

  // Technical indicators
  const technicalIndicators = data?.analysis?.technical?.indicators || {}
  const rsi = Array.isArray(technicalIndicators.RSI) 
    ? technicalIndicators.RSI[technicalIndicators.RSI.length - 1] 
    : technicalIndicators.RSI ?? 0
  const sma = Array.isArray(technicalIndicators.SMA)
    ? technicalIndicators.SMA[technicalIndicators.SMA.length - 1]
    : technicalIndicators.SMA ?? 0

  // Calculate SMA change (mock for now)
  const smaChange = '+0.32%'

  // Confidence level
  const confidence = overallScore >= 70 ? 'High' : overallScore >= 50 ? 'Medium' : 'Low'

  // Get news from API or fallback to mock
  const newsItems = newsData?.news || [
    { title: `${symbol} latest market updates`, date: 'Today', sentiment: 'neutral' as const },
  ]

  // Fundamentals data (mock - replace with actual data from API)
  const fundamentalsData = {
    peRatio: 28.3,
    pegRatio: 2.1,
    dividendYield: 0.55,
    marketCap: '2.65T'
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          Error loading analysis: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{symbol}</h1>
          <p className="text-muted-foreground">Market Open</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            ${typeof currentPrice === 'number' ? currentPrice.toFixed(2) : currentPrice}
          </div>
          <div className={`text-lg font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{typeof priceChange === 'number' ? priceChange.toFixed(2) : priceChange} 
            ({priceChange >= 0 ? '+' : ''}{typeof priceChangePercent === 'number' ? priceChangePercent.toFixed(2) : priceChangePercent}%)
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="SMA TREND" 
          value={typeof sma === 'number' ? sma.toFixed(2) : sma} 
          change={smaChange}
        />
        <MetricCard 
          title="RSI" 
          value={typeof rsi === 'number' ? rsi.toFixed(1) : rsi}
        />
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">SENTIMENT</div>
          <SentimentBar score={sentimentScore} />
        </Card>
        <MetricCard 
          title="FUNDAMENTALS" 
          value={fundamentalScore}
        />
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="text-sm font-medium text-muted-foreground mb-1">AGGREGATE SCORE</div>
          <div className="text-center">
            <div className="text-4xl font-bold">{overallScore}</div>
            <div className={`text-lg font-semibold mt-1 ${
              recommendation === 'BUY' ? 'text-green-600' : 
              recommendation === 'SELL' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              Verdict: {recommendation}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Confidence: {confidence}</div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Chart & Fundamentals */}
        <div className="lg:col-span-2 space-y-6">
          <TradingViewChart symbol={symbol} height={500} />
          <FundamentalsTable data={fundamentalsData} />
          
          {/* AI Summary */}
          <AISummary text={aiSummary} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Verdict Gauge */}
          <Card>
            <CircularGauge 
              score={overallScore} 
              verdict={recommendation} 
              confidence={confidence}
            />
          </Card>

          {/* Weights Panel */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Weights</h3>
            <WeightsPanel initial={weights} onChange={setWeights} />
          </Card>

          {/* News & Sentiment */}
          <NewsCard items={newsItems} />
        </div>
      </div>

    </div>
  )
}
