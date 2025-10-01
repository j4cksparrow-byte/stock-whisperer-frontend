import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiStatus {
  name: string;
  status: 'connected' | 'error' | 'not_configured';
  configured: boolean;
  connected: boolean;
  message: string;
}

interface ApiConnectionsResponse {
  timestamp: string;
  apis: {
    alphaVantage: ApiStatus;
    gemini: ApiStatus;
    twelveData: ApiStatus;
    polygon: ApiStatus;
    finnhub: ApiStatus;
    fmp: ApiStatus;
  };
}

export default function ApiStatus() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['api-connections'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('test-api-connections');
      if (error) throw error;
      return data as ApiConnectionsResponse;
    },
    staleTime: 30000, // 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'not_configured':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-600">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'not_configured':
        return <Badge variant="secondary">Not Configured</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Connection Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor the connectivity status of all configured external APIs
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Testing API Connections...</CardTitle>
            <CardDescription>This may take a few moments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-muted rounded" />
                    <div className="w-32 h-4 bg-muted rounded" />
                  </div>
                  <div className="w-20 h-6 bg-muted rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to test API connections</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Last Tested</CardTitle>
              <CardDescription>
                {new Date(data.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
          </Card>

          {Object.entries(data.apis).map(([key, api]) => (
            <Card key={key} className={api.status === 'error' ? 'border-destructive' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(api.status)}
                    <div>
                      <CardTitle className="text-lg">{api.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {api.message}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(api.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">API Key:</span>
                    <span className={`ml-2 font-medium ${api.configured ? 'text-green-600' : 'text-orange-600'}`}>
                      {api.configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Connection:</span>
                    <span className={`ml-2 font-medium ${api.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {api.connected ? 'Active' : 'Failed'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">About API Testing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-300">
          <p>
            This page tests the connectivity of all configured financial data APIs. 
            Each API is tested with a lightweight request to verify that:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>The API key is properly configured</li>
            <li>The API endpoint is accessible</li>
            <li>Authentication is successful</li>
            <li>Basic data retrieval works</li>
          </ul>
          <p className="mt-3">
            If an API shows as "Not Configured", you need to add its API key in the Supabase secrets.
            If an API shows as "Error", check the error message for details on what went wrong.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
