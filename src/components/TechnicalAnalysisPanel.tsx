import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { AnalysisComponent } from '@/types/stockAnalysis';

interface TechnicalAnalysisPanelProps {
  data: AnalysisComponent;
}

const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({ data }) => {
  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-500';
    if (rsi < 30) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  };

  const getMACDStatus = (macd: string) => {
    if (macd.includes('bullish')) return { color: 'text-green-500', icon: <TrendingUp className="h-4 w-4" /> };
    if (macd.includes('bearish')) return { color: 'text-red-500', icon: <TrendingDown className="h-4 w-4" /> };
    return { color: 'text-gray-500', icon: <Minus className="h-4 w-4" /> };
  };

  const getMovingAverageStatus = (ma: string) => {
    if (ma.includes('above')) return { color: 'text-green-500', status: 'Bullish' };
    if (ma.includes('below')) return { color: 'text-red-500', status: 'Bearish' };
    return { color: 'text-gray-500', status: 'Mixed' };
  };

  const getTrendStrengthColor = (strength: number) => {
    if (strength > 0.7) return 'text-green-500';
    if (strength > 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="bg-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Technical Analysis</span>
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            Score: {data.score}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Score</span>
          <div className="flex items-center space-x-2">
            <Progress value={data.score} className="w-20" />
            <span className="text-sm font-medium">{data.score}/100</span>
          </div>
        </div>

        {data.indicators && (
          <>
            {/* RSI */}
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">RSI (14)</span>
                <span className={`text-sm font-bold ${getRSIColor(data.indicators.rsi)}`}>
                  {data.indicators.rsi.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getRSIColor(data.indicators.rsi)}>
                  {getRSIStatus(data.indicators.rsi)}
                </Badge>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getRSIColor(data.indicators.rsi).replace('text-', 'bg-')}`}
                    style={{ width: `${(data.indicators.rsi / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* MACD */}
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">MACD</span>
                <div className="flex items-center space-x-1">
                  {getMACDStatus(data.indicators.macd).icon}
                  <span className={`text-sm font-bold ${getMACDStatus(data.indicators.macd).color}`}>
                    {data.indicators.macd.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Moving Averages */}
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Moving Averages</span>
                <Badge variant="outline" className={getMovingAverageStatus(data.indicators.movingAverages).color}>
                  {getMovingAverageStatus(data.indicators.movingAverages).status}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">{data.indicators.movingAverages}</p>
            </div>

            {/* Support & Resistance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="text-sm font-medium text-green-400 mb-1">Support</div>
                <div className="text-lg font-bold">{data.indicators.supportLevel}</div>
              </div>
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="text-sm font-medium text-red-400 mb-1">Resistance</div>
                <div className="text-lg font-bold">{data.indicators.resistanceLevel}</div>
              </div>
            </div>

            {/* Volume Trend */}
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Volume Trend</span>
                <Badge variant="outline" className={
                  data.indicators.volumeTrend.includes('increasing') ? 'border-green-500 text-green-400' :
                  data.indicators.volumeTrend.includes('decreasing') ? 'border-red-500 text-red-400' :
                  'border-gray-500 text-gray-400'
                }>
                  {data.indicators.volumeTrend}
                </Badge>
              </div>
            </div>

            {/* Volatility */}
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Volatility</span>
                <span className="text-sm font-bold">{data.indicators.volatility.toFixed(2)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500"
                  style={{ width: `${Math.min(data.indicators.volatility * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Trend Strength */}
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Trend Strength</span>
                <span className={`text-sm font-bold ${getTrendStrengthColor(data.indicators.trendStrength)}`}>
                  {(data.indicators.trendStrength * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getTrendStrengthColor(data.indicators.trendStrength).replace('text-', 'bg-')}`}
                  style={{ width: `${data.indicators.trendStrength * 100}%` }}
                ></div>
              </div>
            </div>
          </>
        )}

        {/* Weight Contribution */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Weight Contribution</span>
            <span className="text-sm font-medium">{data.weight}%</span>
          </div>
          <Progress value={data.weight} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalAnalysisPanel; 