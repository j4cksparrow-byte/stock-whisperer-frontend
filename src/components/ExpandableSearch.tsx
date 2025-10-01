import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSearch } from '../lib/queries'
import LoadingSpinner from './LoadingSpinner'

export default function ExpandableSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
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
      setIsExpanded(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setIsExpanded(false)
      setQuery('')
      setIsOpen(false)
    }
  }

  const handleResultClick = (symbol: string) => {
    handleSearch(symbol)
  }

  const handleSearchIconClick = () => {
    setIsExpanded(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleClose = () => {
    setIsExpanded(false)
    setQuery('')
    setIsOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded && !query.trim()) {
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExpanded, query])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Icon (when collapsed) */}
      {!isExpanded && (
        <button
          onClick={handleSearchIconClick}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
        >
          <Search className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}

      {/* Expanded Search Bar - stays within navbar */}
      {isExpanded && (
        <div className="w-full transition-all duration-300">
          <div className="relative bg-background border border-border rounded-lg p-1 w-full">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground ml-2" />
              <Input
                ref={inputRef}
                placeholder="Search stocks, companies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyPress={handleKeyPress}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 text-foreground placeholder:text-muted-foreground"
              />
              {isLoading && (
                <div className="mr-2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-6 h-6 rounded hover:bg-accent transition-colors mr-1"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            
            {/* Search Results Dropdown - floating with blur */}
            {isOpen && debouncedQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl max-h-80 overflow-auto z-50 min-w-80">
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-muted-foreground">
                    <LoadingSpinner size="sm" className="mx-auto mb-2" />
                    <div className="text-sm">Searching...</div>
                  </div>
                ) : searchResults?.results?.length ? (
                  <div className="py-1">
                    {searchResults.results.slice(0, 8).map((result) => (
                      <button
                        key={result.symbol}
                        onClick={() => handleResultClick(result.symbol)}
                        className="w-full text-left px-4 py-2 hover:bg-accent transition-colors border-b border-border last:border-b-0 group"
                      >
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {result.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.name ?? ('type' in result ? result.type : '') ?? ''}
                        </div>
                        {result.region && (
                          <div className="text-xs text-muted-foreground">
                            {result.region}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center text-muted-foreground text-sm">
                    No results found for "{debouncedQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
