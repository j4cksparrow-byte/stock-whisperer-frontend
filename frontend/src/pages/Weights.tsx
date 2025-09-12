import { useWeightDefaults } from '../lib/queries'
import WeightsPanel from '../components/WeightsPanel'
import { useState } from 'react'

export default function Weights() {
  const { data } = useWeightDefaults()
  const [weights, setWeights] = useState({ fundamental: 40, technical: 35, sentiment: 25 })
  const presets = data?.examples ?? []
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Weights</h1>
      <div className="flex gap-2 flex-wrap">
        {presets.map((p: any, i: number) => (
          <button
            key={i}
            className="px-3 py-2 rounded-md bg-white border text-sm"
            onClick={() => setWeights({ fundamental: p.fundamental, technical: p.technical, sentiment: p.sentiment })}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className="border rounded-md p-3 bg-white">
        <WeightsPanel initial={weights} onChange={setWeights} />
      </div>
    </div>
  )
}
