import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';
import { RiskAnalysis } from '@/types/stockAnalysis';

interface RiskAnalysisPanelProps {
  data: RiskAnalysis;
}

const RiskAnalysisPanel: React.FC<RiskAnalysisPanelProps> = ({ data }) => {
  const getRiskColor = (value: number, thresholds: { low: number; high: number }) => {
    if (value <= thresholds.low) return 'text-green-500';
    if (value >= thresholds.high) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getRiskLevel = (value: number, thresholds: { low: number; high: number }) => {
    if (value <= thresholds.low) return 'Low';
    if (value >= thresholds.high) return 'High';
    return 'Medium';
  };

  const getBetaColor = (beta: number) => {
    if (beta < 0.8) return 'text-green-500';
    if (beta > 1.2) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSharpeRatioColor = (sharpe: number) => {
    if (sharpe > 1) return 'text-green-500';
    if (sharpe < 0.5) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getCorrelationColor = (correlation: number) => {
    const absCorr = Math.abs(correlation);
    if (absCorr < 0.3) return 'text-green-500';
    if (absCorr > 0.7) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <Card className="bg-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Risk Analysis</span>
          <Badge variant="outline" className="border-orange-500 text-orange-400">
            Risk Assessment
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Beta */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Beta</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getBetaColor(data.beta)}`}>
                {data.beta.toFixed(2)}
              </span>
              <Badge variant="outline" className={getBetaColor(data.beta)}>
                {data.beta < 0.8 ? 'Low Volatility' : 
                 data.beta > 1.2 ? 'High Volatility' : 'Market Volatility'}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {data.beta < 0.8 ? 'Less volatile than the market' :
             data.beta > 1.2 ? 'More volatile than the market' :
             'Similar volatility to the market'}
          </div>
        </div>

        {/* Volatility */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Volatility</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getRiskColor(parseFloat(data.volatility), { low: 15, high: 25 })}`}>
                {data.volatility}
              </span>
              <Badge variant="outline" className={getRiskColor(parseFloat(data.volatility), { low: 15, high: 25 })}>
                {getRiskLevel(parseFloat(data.volatility), { low: 15, high: 25 })} Risk
              </Badge>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getRiskColor(parseFloat(data.volatility), { low: 15, high: 25 }).replace('text-', 'bg-')}`}
              style={{ width: `${Math.min(parseFloat(data.volatility) * 2, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Maximum Drawdown */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium">Max Drawdown</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getRiskColor(Math.abs(parseFloat(data.maxDrawdown)), { low: 10, high: 20 })}`}>
                {data.maxDrawdown}
              </span>
              <Badge variant="outline" className={getRiskColor(Math.abs(parseFloat(data.maxDrawdown)), { low: 10, high: 20 })}>
                {getRiskLevel(Math.abs(parseFloat(data.maxDrawdown)), { low: 10, high: 20 })} Risk
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Maximum historical decline from peak to trough
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Sharpe Ratio</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getSharpeRatioColor(data.sharpeRatio)}`}>
                {data.sharpeRatio.toFixed(2)}
              </span>
              <Badge variant="outline" className={getSharpeRatioColor(data.sharpeRatio)}>
                {data.sharpeRatio > 1 ? 'Excellent' : 
                 data.sharpeRatio > 0.5 ? 'Good' : 'Poor'} Risk-Adjusted Return
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Risk-adjusted return measure (higher is better)
          </div>
        </div>

        {/* Value at Risk (VaR) */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium">Value at Risk (95%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getRiskColor(Math.abs(parseFloat(data.var95)), { low: 5, high: 15 })}`}>
                {data.var95}
              </span>
              <Badge variant="outline" className={getRiskColor(Math.abs(parseFloat(data.var95)), { low: 5, high: 15 })}>
                {getRiskLevel(Math.abs(parseFloat(data.var95)), { low: 5, high: 15 })} Risk
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            95% confidence level maximum potential loss
          </div>
        </div>

        {/* Market Correlation */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Market Correlation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getCorrelationColor(data.correlation)}`}>
                {data.correlation.toFixed(2)}
              </span>
              <Badge variant="outline" className={getCorrelationColor(data.correlation)}>
                {Math.abs(data.correlation) < 0.3 ? 'Low Correlation' :
                 Math.abs(data.correlation) > 0.7 ? 'High Correlation' : 'Moderate Correlation'}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Correlation with market index (diversification benefit)
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Risk Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Primary Risk:</span>
              <div className="mt-1">
                {data.beta > 1.2 ? (
                  <span className="text-red-400">High Market Sensitivity</span>
                ) : parseFloat(data.volatility) > 25 ? (
                  <span className="text-red-400">High Volatility</span>
                ) : Math.abs(parseFloat(data.maxDrawdown)) > 20 ? (
                  <span className="text-red-400">Large Drawdown Risk</span>
                ) : (
                  <span className="text-green-400">Moderate Risk Profile</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Diversification:</span>
              <div className="mt-1">
                {Math.abs(data.correlation) < 0.3 ? (
                  <span className="text-green-400">Good Diversification</span>
                ) : Math.abs(data.correlation) > 0.7 ? (
                  <span className="text-red-400">Limited Diversification</span>
                ) : (
                  <span className="text-yellow-400">Moderate Diversification</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Recommendations */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-400 mb-2">Risk Recommendations</h4>
          <ul className="text-xs text-gray-300 space-y-1">
            {data.beta > 1.2 && (
              <li>• Consider position sizing due to high market sensitivity</li>
            )}
            {parseFloat(data.volatility) > 25 && (
              <li>• Monitor closely during market volatility</li>
            )}
            {Math.abs(parseFloat(data.maxDrawdown)) > 20 && (
              <li>• Set appropriate stop-loss levels</li>
            )}
            {data.sharpeRatio < 0.5 && (
              <li>• Evaluate risk-adjusted returns</li>
            )}
            {Math.abs(data.correlation) > 0.7 && (
              <li>• Consider portfolio diversification</li>
            )}
            {data.beta <= 0.8 && parseFloat(data.volatility) <= 15 && data.sharpeRatio > 1 && (
              <li>• Favorable risk profile for conservative investors</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAnalysisPanel; 