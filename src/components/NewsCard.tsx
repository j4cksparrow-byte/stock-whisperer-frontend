import { Card } from './ui/card'

interface NewsItem {
  title: string
  date: string
  source?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

interface NewsCardProps {
  items: NewsItem[]
}

export default function NewsCard({ items }: NewsCardProps) {
  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'positive') return 'bg-green-500'
    if (sentiment === 'negative') return 'bg-red-500'
    return 'bg-gray-400'
  }

  if (!items || items.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4">News & Sentiment</h3>
        <p className="text-sm text-muted-foreground">No recent news available</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">News & Sentiment</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSentimentColor(item.sentiment)}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-tight">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.date} {item.source && `• ${item.source}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
