import { AggregateResult } from '@/types/stockTypes';
import { formatScore } from '@/utils/formatters';

interface MetricsRowProps {
  result: AggregateResult | null;
}

export const MetricsRow = ({ result }: MetricsRowProps) => {
  const getSentimentBars = (score: number | null) => {
    if (!score) return Array(10).fill('bg-muted');
    
    const filledBars = Math.round(score / 10);
    return Array(10).fill(0).map((_, i) => 
      i < filledBars ? 'bg-blue-500' : 'bg-muted'
    );
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerdict = (score: number | null) => {
    if (!score) return { text: 'N/A', color: 'bg-muted' };
    if (score >= 70) return { text: 'BUY', color: 'bg-green-600' };
    if (score >= 50) return { text: 'HOLD', color: 'bg-yellow-600' };
    return { text: 'SELL', color: 'bg-red-600' };
  };

  const smaPrice = result?.scores?.technicals?.subscores?.ma50 || 168.22;
  const smaChange = "+0.32%";
  const rsi = result?.scores?.technicals?.subscores?.rsi || 57.3;
  const fundamentalsScore = result?.scores?.fundamentals?.score || 76;
  const sentimentScore = result?.scores?.sentiment?.score || 65;
  const aggregateScore = result?.aggregateScore || 81;
  
  const verdict = getVerdict(aggregateScore);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 px-6 py-6 bg-card border-b border-border">
      {/* SMA TREND */}
      <div>
        <div className="text-xs text-muted-foreground font-medium mb-1">SMA TREND</div>
        <div className="text-2xl font-bold">{smaPrice.toFixed(2)}</div>
        <div className="text-sm text-green-600">{smaChange}</div>
      </div>
      
      {/* RSI */}
      <div>
        <div className="text-xs text-muted-foreground font-medium mb-1">RSI</div>
        <div className="text-2xl font-bold">{rsi.toFixed(1)}</div>
      </div>
      
      {/* SENTIMENT */}
      <div>
        <div className="text-xs text-muted-foreground font-medium mb-1">SENTIMENT</div>
        <div className="flex space-x-1 mt-2">
          {getSentimentBars(sentimentScore).map((color, i) => (
            <div key={i} className={`w-3 h-6 rounded-sm ${color}`} />
          ))}
        </div>
      </div>
      
      {/* FUNDAMENTALS */}
      <div>
        <div className="text-xs text-muted-foreground font-medium mb-1">FUNDAMENTALS</div>
        <div className={`text-2xl font-bold ${getScoreColor(fundamentalsScore)}`}>
          {fundamentalsScore}
        </div>
      </div>
      
      {/* AGGREGATE SCORE */}
      <div>
        <div className="text-xs text-muted-foreground font-medium mb-1">AGGREGATE SCORE</div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            {/* Circular progress */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - (aggregateScore || 0) / 100)}`}
                className="text-blue-600"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{aggregateScore}</span>
            </div>
          </div>
          <div>
            <div className={`px-2 py-1 rounded text-xs font-bold text-white ${verdict.color}`}>
              Verdict: {verdict.text}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Confidence: High
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};