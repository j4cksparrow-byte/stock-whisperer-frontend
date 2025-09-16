import { useIndicators } from '../lib/queries'
import { useState, useEffect } from 'react'

type Props = {
  onChange?: (config: Record<string, any>) => void
  initialConfig?: Record<string, any>
}

export default function IndicatorsPanel({ onChange, initialConfig }: Props) {
  const { data, isLoading } = useIndicators()
  const [config, setConfig] = useState<Record<string, any>>(initialConfig ?? {})
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
    }
  }, [initialConfig])

  useEffect(() => {
    onChange?.(config)
  }, [config, onChange])

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const toggleIndicator = (indicator: string) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      if (newConfig[indicator]) {
        // Disable indicator
        newConfig[indicator] = { enabled: false }
      } else {
        // Enable with default config or just true
        newConfig[indicator] = data?.defaultConfig?.[indicator] || { enabled: true }
      }
      return newConfig
    })
  }

  const updateIndicatorConfig = (indicator: string, key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      if (!newConfig[indicator]) {
        newConfig[indicator] = {}
      }
      newConfig[indicator][key] = value
      return newConfig
    })
  }

  if (isLoading) return <div>Loading indicators…</div>

  const availableIndicators = data?.availableIndicators ?? {}
  const defaultConfig = data?.defaultConfig ?? {}

  return (
    <div className="grid gap-3">
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-600">Available Indicators</div>
        <button
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={() => setConfig(defaultConfig)}
        >
          Reset to defaults
        </button>
      </div>
      
      <div className="space-y-2">
        {Object.entries(availableIndicators).map(([group, indicators]) => (
          <div key={group} className="border rounded-md bg-white">
            <button
              className="w-full px-3 py-2 text-left flex justify-between items-center"
              onClick={() => toggleGroup(group)}
            >
              <span className="font-medium text-sm capitalize">{group}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedGroups[group] ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedGroups[group] && (
              <div className="px-3 pb-3 space-y-2">
                {indicators.map(indicator => {
                  const isEnabled = config[indicator]?.enabled !== false
                  const indicatorConfig = config[indicator] || defaultConfig[indicator] || {}
                  
                  return (
                    <div key={indicator} className="border rounded p-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => toggleIndicator(indicator)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">{indicator}</span>
                        </label>
                      </div>
                      
                      {isEnabled && defaultConfig[indicator] && (
                        <div className="mt-2 pl-6 space-y-2">
                          {Object.entries(defaultConfig[indicator]).map(([key, defaultValue]) => (
                            <div key={key} className="flex items-center justify-between">
                              <label className="text-xs text-slate-600 capitalize">{key}:</label>
                              <input
                                type="number"
                                value={indicatorConfig[key] ?? defaultValue}
                                onChange={(e) => updateIndicatorConfig(indicator, key, Number(e.target.value))}
                                className="w-16 text-xs border rounded px-1 py-0.5"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-slate-500">
        Select which indicators to calculate and customize their parameters.
      </div>
    </div>
  )
}
