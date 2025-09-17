import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Newspaper, MessageCircle, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnalysisComponent } from '@/types/stockAnalysis';

interface SentimentAnalysisPanelProps {
  data: AnalysisComponent;
}

const SentimentAnalysisPanel: React.FC<SentimentAnalysisPanelProps> = ({ data }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.6) return 'text-green-500';
    if (sentiment < 0.4) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentStatus = (sentiment: number) => {
    if (sentiment > 0.6) return 'Positive';
    if (sentiment < 0.4) return 'Negative';
    return 'Neutral';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.6) return <TrendingUp className="h-4 w-4" />;
    if (sentiment < 0.4) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatSentiment = (sentiment: number) => {
    return `${(sentiment * 100).toFixed(0)}%`;
  };

  return (
    <Card className="bg-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5" />
          <span>Sentiment Analysis</span>
          <Badge variant="outline" className="border-purple-500 text-purple-400">
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

        {data.breakdown && (
          <>
            {/* News Sentiment */}
            <div className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Newspaper className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">News Sentiment</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(data.breakdown.newsSentiment)}
                  <span className={`text-sm font-bold ${getSentimentColor(data.breakdown.newsSentiment)}`}>
                    {formatSentiment(data.breakdown.newsSentiment)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getSentimentColor(data.breakdown.newsSentiment)}>
                  {getSentimentStatus(data.breakdown.newsSentiment)}
                </Badge>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSentimentColor(data.breakdown.newsSentiment).replace('text-', 'bg-')}`}
                    style={{ width: `${data.breakdown.newsSentiment * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Analyst Sentiment */}
            <div className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Analyst Sentiment</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(data.breakdown.analystSentiment)}
                  <span className={`text-sm font-bold ${getSentimentColor(data.breakdown.analystSentiment)}`}>
                    {formatSentiment(data.breakdown.analystSentiment)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getSentimentColor(data.breakdown.analystSentiment)}>
                  {getSentimentStatus(data.breakdown.analystSentiment)}
                </Badge>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSentimentColor(data.breakdown.analystSentiment).replace('text-', 'bg-')}`}
                    style={{ width: `${data.breakdown.analystSentiment * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Social Media Sentiment */}
            <div className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">Social Media</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(data.breakdown.socialSentiment)}
                  <span className={`text-sm font-bold ${getSentimentColor(data.breakdown.socialSentiment)}`}>
                    {formatSentiment(data.breakdown.socialSentiment)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getSentimentColor(data.breakdown.socialSentiment)}>
                  {getSentimentStatus(data.breakdown.socialSentiment)}
                </Badge>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSentimentColor(data.breakdown.socialSentiment).replace('text-', 'bg-')}`}
                    style={{ width: `${data.breakdown.socialSentiment * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Insider Sentiment */}
            <div className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium">Insider Activity</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(data.breakdown.insiderSentiment)}
                  <span className={`text-sm font-bold ${getSentimentColor(data.breakdown.insiderSentiment)}`}>
                    {formatSentiment(data.breakdown.insiderSentiment)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getSentimentColor(data.breakdown.insiderSentiment)}>
                  {getSentimentStatus(data.breakdown.insiderSentiment)}
                </Badge>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSentimentColor(data.breakdown.insiderSentiment).replace('text-', 'bg-')}`}
                    style={{ width: `${data.breakdown.insiderSentiment * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Options Flow Sentiment */}
            <div className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium">Options Flow</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(data.breakdown.optionsFlow)}
                  <span className={`text-sm font-bold ${getSentimentColor(data.breakdown.optionsFlow)}`}>
                    {formatSentiment(data.breakdown.optionsFlow)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getSentimentColor(data.breakdown.optionsFlow)}>
                  {getSentimentStatus(data.breakdown.optionsFlow)}
                </Badge>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getSentimentColor(data.breakdown.optionsFlow).replace('text-', 'bg-')}`}
                    style={{ width: `${data.breakdown.optionsFlow * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sentiment Summary */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Sentiment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Most Positive:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {data.breakdown.analystSentiment > data.breakdown.newsSentiment && 
                     data.breakdown.analystSentiment > data.breakdown.socialSentiment && 
                     data.breakdown.analystSentiment > data.breakdown.insiderSentiment && 
                     data.breakdown.analystSentiment > data.breakdown.optionsFlow ? (
                      <>
                        <Users className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Analyst Opinions</span>
                      </>
                    ) : data.breakdown.newsSentiment > data.breakdown.socialSentiment && 
                         data.breakdown.newsSentiment > data.breakdown.insiderSentiment && 
                         data.breakdown.newsSentiment > data.breakdown.optionsFlow ? (
                      <>
                        <Newspaper className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">News Coverage</span>
                      </>
                    ) : data.breakdown.socialSentiment > data.breakdown.insiderSentiment && 
                         data.breakdown.socialSentiment > data.breakdown.optionsFlow ? (
                      <>
                        <MessageCircle className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Social Media</span>
                      </>
                    ) : data.breakdown.insiderSentiment > data.breakdown.optionsFlow ? (
                      <>
                        <Users className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Insider Activity</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Options Flow</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Overall Mood:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getSentimentIcon((data.breakdown.newsSentiment + data.breakdown.analystSentiment + 
                                      data.breakdown.socialSentiment + data.breakdown.insiderSentiment + 
                                      data.breakdown.optionsFlow) / 5)}
                    <span className={getSentimentColor((data.breakdown.newsSentiment + data.breakdown.analystSentiment + 
                                                      data.breakdown.socialSentiment + data.breakdown.insiderSentiment + 
                                                      data.breakdown.optionsFlow) / 5)}>
                      {getSentimentStatus((data.breakdown.newsSentiment + data.breakdown.analystSentiment + 
                                         data.breakdown.socialSentiment + data.breakdown.insiderSentiment + 
                                         data.breakdown.optionsFlow) / 5)}
                    </span>
                  </div>
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

export default SentimentAnalysisPanel; 