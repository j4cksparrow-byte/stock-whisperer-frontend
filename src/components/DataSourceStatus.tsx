import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Activity, Database, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface DataSource {
  name: string;
  hasApiKey: boolean;
  usage: number;
  limit: number;
  available: boolean;
}

interface DataSourcesStatus {
  sources: DataSource[];
  priorityOrder: Record<string, string[]>;
  cacheStats: {
    total: number;
    valid: number;
    expired: number;
    timeout: number;
  };
}

function DataSourceStatus() {
  const { data: status, isLoading, error } = useQuery({
    queryKey: ['data-sources-status'],
    queryFn: async () => {
      const { data } = await api.get('/api/stocks/data-sources/status');
      return data.dataSources as DataSourcesStatus;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Data is fresh for 15 seconds
  });

  const getSourceIcon = (sourceName: string) => {
    switch (sourceName.toLowerCase()) {
      case 'alphavantage':
        return <Database className="h-4 w-4" />;
      case 'twelvedata':
        return <TrendingUp className="h-4 w-4" />;
      case 'polygon':
        return <Activity className="h-4 w-4" />;
      case 'finnhub':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (source: DataSource) => {
    if (!source.hasApiKey) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        No API Key
      </Badge>;
    }
    
    if (!source.available) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Limit Reached
      </Badge>;
    }
    
    const usagePercent = (source.usage / source.limit) * 100;
    if (usagePercent > 80) {
      return <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-600">
        <AlertCircle className="h-3 w-3" />
        {usagePercent.toFixed(0)}% Used
      </Badge>;
    }
    
    return <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
      <CheckCircle className="h-3 w-3" />
      Available ({usagePercent.toFixed(0)}%)
    </Badge>;
  };

  const formatSourceName = (name: string) => {
    const nameMap: Record<string, string> = {
      'alphaVantage': 'Alpha Vantage',
      'twelveData': 'Twelve Data',
      'polygon': 'Polygon.io',
      'finnhub': 'Finnhub',
      'fmp': 'Financial Modeling Prep',
      'yahooFinance': 'Yahoo Finance'
    };
    return nameMap[name] || name;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Data Sources Status
          </CardTitle>
          <CardDescription>
            Loading API status information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-muted rounded" />
                  <div className="w-24 h-4 bg-muted rounded" />
                </div>
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Data Sources Status
          </CardTitle>
          <CardDescription>
            Failed to load API status information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">Error: Unable to fetch status</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Data Sources Status
        </CardTitle>
        <CardDescription>
          Multi-source API integration with intelligent fallbacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Sources */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">API Sources</h4>
          {status?.sources.map((source) => (
            <div key={source.name} className="flex justify-between items-center p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getSourceIcon(source.name)}
                <div>
                  <p className="font-medium">{formatSourceName(source.name)}</p>
                  <p className="text-sm text-muted-foreground">
                    {source.usage}/{source.limit} requests today
                  </p>
                </div>
              </div>
              {getStatusBadge(source)}
            </div>
          ))}
        </div>

        {/* Priority Order */}
        {status?.priorityOrder && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Data Source Priority</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(status.priorityOrder).map(([dataType, sources]) => (
                <div key={dataType} className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm capitalize mb-2">{dataType.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <div className="flex flex-wrap gap-1">
                    {sources.map((source, index) => (
                      <Badge key={source} variant={index === 0 ? "default" : "secondary"} className="text-xs">
                        {formatSourceName(source)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Statistics */}
        {status?.cacheStats && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Cache Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.cacheStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{status.cacheStats.valid}</p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{status.cacheStats.expired}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{Math.round(status.cacheStats.timeout / 1000 / 60)}</p>
                <p className="text-sm text-muted-foreground">TTL (min)</p>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Smart Fallback System:</strong> When one API reaches its limit or fails, 
            the system automatically switches to the next available source to ensure uninterrupted service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataSourceStatus;