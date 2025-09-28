import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, Zap, TrendingUp } from 'lucide-react';

function DataSourceBanner() {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Enhanced Reliability
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
              New
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
              <Zap className="h-4 w-4" />
              <span>5+ Data Sources</span>
            </div>
            <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
              <TrendingUp className="h-4 w-4" />
              <span>Smart Fallbacks</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
          Now powered by multiple APIs including Twelve Data, Polygon.io, and Finnhub for 
          <strong className="mx-1">10x more daily requests</strong> and better reliability.
        </p>
      </CardContent>
    </Card>
  );
}

export default DataSourceBanner;