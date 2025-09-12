import api from '../lib/api'
import { useQuery } from '@tanstack/react-query'

function useEndpoint<T>(url: string) {
  return useQuery({
    queryKey: ['admin', url],
    queryFn: async () => (await api.get<T>(url)).data,
    refetchOnWindowFocus: false
  })
}

export default function Admin() {
  const health = useEndpoint('/health')
  const keys = useEndpoint('/test-keys')
  const conn = useEndpoint('/test-connections')
  const cache = useEndpoint('/cache/status')

  async function clearCache() { await api.post('/cache/clear'); cache.refetch() }
  async function cleanupCache() { await api.post('/cache/cleanup'); cache.refetch() }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Diagnostics</h1>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-md p-3 bg-white">
          <div className="font-medium mb-2">Health</div>
          <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(health.data, null, 2)}</pre>
        </div>
        <div className="border rounded-md p-3 bg-white">
          <div className="font-medium mb-2">Keys</div>
          <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(keys.data, null, 2)}</pre>
        </div>
        <div className="border rounded-md p-3 bg-white">
          <div className="font-medium mb-2">Connections</div>
          <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(conn.data, null, 2)}</pre>
        </div>
        <div className="border rounded-md p-3 bg-white">
          <div className="font-medium mb-2">Cache</div>
          <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(cache.data, null, 2)}</pre>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm" onClick={clearCache}>Clear</button>
            <button className="px-3 py-2 rounded-md bg-slate-100 border text-sm" onClick={cleanupCache}>Cleanup</button>
          </div>
        </div>
      </section>
    </div>
  )
}
