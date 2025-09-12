import { useState, useEffect } from 'react'

type Props = {
  initial?: { fundamental?: number, technical?: number, sentiment?: number }
  onChange?: (w: { fundamental: number, technical: number, sentiment: number }) => void
}

export default function WeightsPanel({ initial, onChange }: Props) {
  const [fundamental, setF] = useState(initial?.fundamental ?? 40)
  const [technical, setT] = useState(initial?.technical ?? 35)
  const [sentiment, setS] = useState(initial?.sentiment ?? 25)

  useEffect(() => {
    const total = fundamental + technical + sentiment
    if (onChange) onChange({ fundamental: Math.round(fundamental/total*100), technical: Math.round(technical/total*100), sentiment: Math.round(sentiment/total*100) })
  }, [fundamental, technical, sentiment])

  return (
    <div className="grid gap-3">
      {[
        { label: 'Fundamental', value: fundamental, set: setF },
        { label: 'Technical', value: technical, set: setT },
        { label: 'Sentiment', value: sentiment, set: setS },
      ].map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between">
            <label className="text-sm">{row.label}</label>
            <span className="text-sm">{row.value}</span>
          </div>
          <input type="range" min={0} max={100} value={row.value} onChange={(e) => row.set(parseInt(e.target.value))} className="w-full" />
        </div>
      ))}
      <div className="text-xs text-slate-500">Weights auto-normalised to 100% on request.</div>
    </div>
  )
}
