import { useState } from 'react'
import { useTrending } from '../lib/queries'
import { TrendingResponse } from '../lib/types'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

const tabs = ['gainers', 'losers', 'mostActive'] as const

function getTrendingData(data: TrendingResponse | undefined, tab: typeof tabs[number]) {
  if (!data?.trending) return []

  // If data.trending is an array, it's a single-category response
  if (Array.isArray(data.trending)) {
    return data.trending
  }

  // If data.trending is an object, get the data for the current tab
  if (typeof data.trending === 'object' && data.trending[tab]) {
    return data.trending[tab] ?? []
  }
  
  return []
}

export default function TrendingTabs() {
  const [tab, setTab] = useState<typeof tabs[number]>('gainers')
  const { data, isLoading } = useTrending(tab)

  return (
    <div>
      <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {tabs.map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              t === tab 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading trending stocks...</span>
          </div>
        ) : data && getTrendingData(data, tab).length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {getTrendingData(data, tab).map((it) => (
              <div key={it.symbol} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer">
                <div className="font-medium text-gray-900 dark:text-white">{it.symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{it.name}</div>
                <div className="text-sm mt-1">
                  <span className="font-medium text-gray-900 dark:text-white">${it.price?.toFixed(2) ?? '—'}</span>
                  {it.change != null && (
                    <span className={`ml-2 ${it.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {it.change >= 0 ? '+' : ''}{it.change.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No trending data available"
            description="Unable to load trending stocks at this time"
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-gray-400 dark:text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  )
}
