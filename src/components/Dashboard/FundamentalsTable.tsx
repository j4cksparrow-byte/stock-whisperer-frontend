import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FundamentalsTableProps {
  data: {
    peRatio?: number;
    pegRatio?: number;
    dividendYield?: number;
    marketCap?: number;
    evEbitda?: number;
    roe?: number;
    operatingMargin?: number;
    revenueGrowth?: number;
  };
}

export const FundamentalsTable = ({ data }: FundamentalsTableProps) => {
  const formatValue = (value: number | undefined, type: 'ratio' | 'percentage' | 'currency') => {
    if (value === undefined || value === null) return "N/A";
    
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      case 'currency':
        return value >= 1e12 ? `${(value / 1e12).toFixed(2)}T` :
               value >= 1e9 ? `${(value / 1e9).toFixed(2)}B` :
               value >= 1e6 ? `${(value / 1e6).toFixed(2)}M` :
               value.toLocaleString();
      default:
        return value.toFixed(2);
    }
  };

  const metrics = [
    { label: "P/E Ratio", value: formatValue(data.peRatio, 'ratio') },
    { label: "PEG Ratio", value: formatValue(data.pegRatio, 'ratio') },
    { label: "Dividend Yield", value: formatValue(data.dividendYield, 'percentage') },
    { label: "Market Cap", value: formatValue(data.marketCap, 'currency') },
    { label: "EV/EBITDA", value: formatValue(data.evEbitda, 'ratio') },
    { label: "ROE", value: formatValue(data.roe, 'percentage') },
    { label: "Operating Margin", value: formatValue(data.operatingMargin, 'percentage') },
    { label: "Revenue Growth", value: formatValue(data.revenueGrowth, 'percentage') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Fundamentals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="text-sm font-medium">{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};