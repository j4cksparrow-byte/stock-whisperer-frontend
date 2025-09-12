import IndicatorsPanel from '../components/IndicatorsPanel'
import { useState } from 'react'

export default function Indicators() {
  const [config, setConfig] = useState<Record<string, any>>({})
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Indicators</h1>
      <IndicatorsPanel onChange={setConfig} />
      <div className="text-xs text-slate-500">Selected config (for reference): <pre className="mt-2 bg-slate-50 p-2 rounded">{JSON.stringify(config, null, 2)}</pre></div>
    </div>
  )
}
