interface CircularGaugeProps {
  score: number
  verdict: string
  confidence: string
}

export default function CircularGauge({ score, verdict, confidence }: CircularGaugeProps) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  
  const getVerdictColor = () => {
    if (verdict === 'BUY') return 'text-green-600'
    if (verdict === 'SELL') return 'text-red-600'
    return 'text-yellow-600'
  }

  const getStrokeColor = () => {
    if (score >= 70) return '#10b981'
    if (score >= 50) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="45"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="80"
            cy="80"
            r="45"
            stroke={getStrokeColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold">{score}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">Verdict:</div>
        <div className={`text-2xl font-bold ${getVerdictColor()}`}>{verdict}</div>
        <div className="text-sm text-muted-foreground mt-2">
          Confidence: <span className="font-semibold">{confidence}</span>
        </div>
      </div>
    </div>
  )
}
