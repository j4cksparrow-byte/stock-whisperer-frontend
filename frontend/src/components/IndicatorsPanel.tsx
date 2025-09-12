import { useIndicators } from '../lib/queries'

type Props = {
  onChange?: (config: Record<string, any>) => void
}

export default function IndicatorsPanel({ onChange }: Props) {
  const { data, isLoading } = useIndicators()
  if (isLoading) return <div>Loading indicators…</div>
  const cfg = data?.defaultConfig ?? {}
  // For stub: just show a list and emit the default config
  return (
    <div className="grid gap-2">
      <div className="text-sm text-slate-600">Available Indicators</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(data?.availableIndicators ?? {}).map(([group, arr]) => (
          <div key={group} className="border rounded-md p-2 bg-white">
            <div className="font-medium text-sm mb-1">{group}</div>
            <ul className="text-xs text-slate-600 list-disc pl-4">
              {arr.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <button
        className="mt-2 inline-flex items-center px-3 py-2 rounded-md bg-slate-900 text-white text-sm"
        onClick={() => onChange?.(cfg as any)}
      >Use default config</button>
    </div>
  )
}
