import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { AnalysisComponent } from '@/types/stockAnalysis';

interface FundamentalAnalysisPanelProps {
  data: AnalysisComponent;
}

const FundamentalAnalysisPanel: React.FC<FundamentalAnalysisPanelProps> = ({ data }) => {
  const getPERatioColor = (pe: number) => {
    if (pe < 15) return 'text-green-500';
    if (pe > 25) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getPEGRatioColor = (peg: number) => {
    if (peg < 1) return 'text-green-500';
    if (peg > 2) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getROEColor = (roe: number) => {
    if (roe > 15) return 'text-green-500';
    if (roe < 10) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getDebtToEquityColor = (debtEquity: number) => {
    if (debtEquity < 0.5) return 'text-green-500';
    if (debtEquity > 1) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-yellow-500';
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <Card className="bg-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Fundamental Analysis</span>
          <Badge variant="outline" className="border-green-500 text-green-400">
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

        {data.metrics && (
          <>
            {/* Valuation Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Valuation</h4>
              
              {/* P/E Ratio */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">P/E Ratio</span>
                  <span className={`text-sm font-bold ${getPERatioColor(data.metrics.peRatio)}`}>
                    {data.metrics.peRatio.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPERatioColor(data.metrics.peRatio)}>
                    {data.metrics.peRatio < 15 ? 'Undervalued' : 
                     data.metrics.peRatio > 25 ? 'Overvalued' : 'Fair Value'}
                  </Badge>
                </div>
              </div>

              {/* PEG Ratio */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">PEG Ratio</span>
                  <span className={`text-sm font-bold ${getPEGRatioColor(data.metrics.pegRatio)}`}>
                    {data.metrics.pegRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPEGRatioColor(data.metrics.pegRatio)}>
                    {data.metrics.pegRatio < 1 ? 'Undervalued' : 
                     data.metrics.pegRatio > 2 ? 'Overvalued' : 'Fair Value'}
                  </Badge>
                </div>
              </div>

              {/* Market Cap */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Market Cap</span>
                  <span className="text-sm font-bold text-white">
                    {formatMarketCap(data.metrics.marketCap)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profitability Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Profitability</h4>
              
              {/* ROE */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Return on Equity</span>
                  <span className={`text-sm font-bold ${getROEColor(data.metrics.roe)}`}>
                    {data.metrics.roe.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getROEColor(data.metrics.roe)}>
                    {data.metrics.roe > 15 ? 'Excellent' : 
                     data.metrics.roe > 10 ? 'Good' : 'Poor'}
                  </Badge>
                </div>
              </div>

              {/* Profit Margin */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Profit Margin</span>
                  <span className={`text-sm font-bold ${getGrowthColor(data.metrics.profitMargin)}`}>
                    {data.metrics.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Dividend Yield */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Dividend Yield</span>
                  <span className="text-sm font-bold text-green-400">
                    {data.metrics.dividendYield.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Health */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Financial Health</h4>
              
              {/* Debt to Equity */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Debt to Equity</span>
                  <span className={`text-sm font-bold ${getDebtToEquityColor(data.metrics.debtToEquity)}`}>
                    {data.metrics.debtToEquity.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getDebtToEquityColor(data.metrics.debtToEquity)}>
                    {data.metrics.debtToEquity < 0.5 ? 'Low Debt' : 
                     data.metrics.debtToEquity > 1 ? 'High Debt' : 'Moderate Debt'}
                  </Badge>
                </div>
              </div>

              {/* Current Ratio */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Current Ratio</span>
                  <span className={`text-sm font-bold ${data.metrics.currentRatio > 1.5 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {data.metrics.currentRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={data.metrics.currentRatio > 1.5 ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}>
                    {data.metrics.currentRatio > 1.5 ? 'Strong' : 'Adequate'}
                  </Badge>
                </div>
              </div>

              {/* Quick Ratio */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Quick Ratio</span>
                  <span className={`text-sm font-bold ${data.metrics.quickRatio > 1 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {data.metrics.quickRatio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Growth</h4>
              
              {/* Revenue Growth */}
              <div className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Revenue Growth</span>
                  <span className={`text-sm font-bold ${getGrowthColor(data.metrics.revenueGrowth)}`}>
                    {formatPercentage(data.metrics.revenueGrowth)}
                  </span>
                </div>
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

export default FundamentalAnalysisPanel; 