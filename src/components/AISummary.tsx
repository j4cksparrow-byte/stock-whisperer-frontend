export default function AISummary({ text }: { text?: string }) {
  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="font-medium mb-2 text-foreground">AI Insights</div>
      {text ? (
        <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">{text}</p>
      ) : (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-amber-600 dark:text-amber-500 mb-1">⚠️ API Quota Exhausted</p>
          <p>The AI analysis service has reached its daily quota limit. Please try again after some time.</p>
        </div>
      )}
    </div>
  )
}
