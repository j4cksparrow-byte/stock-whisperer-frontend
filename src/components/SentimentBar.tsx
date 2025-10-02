interface SentimentBarProps {
  score: number
}

export default function SentimentBar({ score }: SentimentBarProps) {
  const bars = 7
  const filledBars = Math.round((score / 100) * bars)
  
  return (
    <div className="flex gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`h-6 w-8 rounded ${
            i < filledBars 
              ? 'bg-blue-500' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}
