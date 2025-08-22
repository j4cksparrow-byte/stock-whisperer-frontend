import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface AlertRulesProps {
  alerts: Array<{
    id: string;
    type: 'crossover' | 'score' | 'news';
    title: string;
    description: string;
    status: 'active' | 'triggered' | 'inactive';
    date?: string;
  }>;
}

export const AlertRules = ({ alerts }: AlertRulesProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'crossover':
        return <TrendingUp className="w-4 h-4" />;
      case 'score':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'triggered':
        return <Badge variant="destructive">Triggered</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Alert Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                  {getStatusBadge(alert.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                {alert.date && (
                  <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};