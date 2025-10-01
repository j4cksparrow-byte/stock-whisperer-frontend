export default function AISummary({ text }: { text?: string }) {
  if (!text) return null
  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="font-medium mb-2 text-foreground">AI Insights</div>
      <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">{text}</p>
    </div>
  )
}
