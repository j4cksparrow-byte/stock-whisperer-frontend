import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSearch } from '../lib/queries'
import LoadingSpinner from './LoadingSpinner'

export default function NavbarSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])
  
  const { data: searchResults, isLoading } = useSearch(debouncedQuery)

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/symbol/${encodeURIComponent(searchQuery.trim())}`)
      setQuery('')
      setIsOpen(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  const handleResultClick = (symbol: string) => {
    handleSearch(symbol)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search stocks, companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyPress={handleKeyPress}
          className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {isOpen && debouncedQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="sm" className="mx-auto mb-2" />
              <div className="text-sm">Searching...</div>
            </div>
          ) : searchResults?.results?.length ? (
            <div className="py-1">
              {searchResults.results.slice(0, 8).map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleResultClick(result.symbol)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                >
                  <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {result.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {result.name ?? ('type' in result ? result.type : '') ?? ''}
                  </div>
                  {result.region && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {result.region}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
              No results found for "{debouncedQuery}"
            </div>
          )}
        </div>
      )}
      
      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
