export default function AISummary({ text }: { text?: string }) {
  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="font-medium mb-2 text-foreground">AI Insights</div>
      {text ? (
        <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">{text}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">AI analysis temporarily unavailable due to API limits. Check back soon.</p>
      )}
    </div>
  )
}
