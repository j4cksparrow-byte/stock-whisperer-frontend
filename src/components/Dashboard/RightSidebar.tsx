import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AggregateResult } from '@/types/stockTypes';

interface RightSidebarProps {
  result: AggregateResult | null;
}

export const RightSidebar = ({ result }: RightSidebarProps) => {
  const weights = result?.weights || {
    fundamental: 40,
    sentiment: 20,
    technical: 40
  };

  return (
    <div className="w-64 bg-card border-l border-border p-4 space-y-4">
      {/* Alert Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">ALERT RULES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-xs">
            <div>
              <div className="font-medium">1. SMA crossover with</div>
              <div className="text-muted-foreground">Sentiment positive</div>
            </div>
            
            <div>
              <div className="font-medium">2. Fundamentalscore below 50</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weights Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fundamental */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fundamental</span>
              <span className="font-medium">{weights.fundamental}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${weights.fundamental}%` }}
              />
            </div>
          </div>

          {/* Sentiment */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sentiment</span>
              <span className="font-medium">{weights.sentiment}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${weights.sentiment}%` }}
              />
            </div>
          </div>

          {/* Technical */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Technical</span>
              <span className="font-medium">{weights.technical}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${weights.technical}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-muted-foreground">
        <div>Last updated: Apr 24 • KA • Hugging Face</div>
      </div>
    </div>
  );
};