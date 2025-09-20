import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AggregateResult } from '@/types/stockTypes';

interface LeftSidebarProps {
  result: AggregateResult | null;
}

export const LeftSidebar = ({ result }: LeftSidebarProps) => {
  const fundamentalsData = result?.scores?.fundamentals?.data_used || {};
  
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (value > 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      return value.toFixed(2);
    }
    return value.toString();
  };

  const fundamentalItems = [
    { label: 'P/E Ratio', value: fundamentalsData.pe || 28.3, target: 21 },
    { label: 'PEG Ratio', value: fundamentalsData.peg || 2.1, target: 1.2 },
    { label: 'Dividend Yield', value: fundamentalsData.dividendYield || 0.55, target: 2.65, suffix: '%' },
    { label: 'Market Cap', value: fundamentalsData.marketCap || 3200000000000, target: null }
  ];

  return (
    <div className="w-64 bg-card border-r border-border p-4 space-y-4">
      {/* News & Sentiment Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">NEWS & SENTIMENT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Apple moves</div>
                <div>search on them</div>
              </div>
            </div>
            
            <div className="text-xs">
              <div>Beasts on hours</div>
              <div className="text-muted-foreground">Apr 24 • present</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fundamentals Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">FUNDAMENTALS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fundamentalItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <div className="text-right">
                <div className="font-medium">
                  {formatValue(item.value)}{item.suffix || ''}
                </div>
                {item.target && (
                  <div className="text-xs text-muted-foreground">
                    {formatValue(item.target)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Sources */}
      <div className="text-xs text-muted-foreground">
        <div className="mb-1">Sources: Alpha Vantage, GNews, Hugging Face</div>
      </div>
    </div>
  );
};