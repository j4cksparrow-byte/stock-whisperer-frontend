import { Card } from './ui/card'

interface FundamentalsTableProps {
  data: {
    peRatio?: number
    pegRatio?: number
    dividendYield?: number
    marketCap?: string
  }
}

export default function FundamentalsTable({ data }: FundamentalsTableProps) {
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A'
    return value
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Fundamentals</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">P/E Ratio</div>
          <div className="text-lg font-semibold">{formatValue(data.peRatio)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">PEG Ratio</div>
          <div className="text-lg font-semibold">{formatValue(data.pegRatio)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Dividend Yield</div>
          <div className="text-lg font-semibold">{formatValue(data.dividendYield)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="text-lg font-semibold">{formatValue(data.marketCap)}</div>
        </div>
      </div>
    </Card>
  )
}
