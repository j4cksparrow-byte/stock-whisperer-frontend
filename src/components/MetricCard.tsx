import { Card } from './ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  subtitle?: string
  className?: string
}

export default function MetricCard({ title, value, change, subtitle, className = '' }: MetricCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold">{value}</div>
        {change && (
          <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </Card>
  )
}
