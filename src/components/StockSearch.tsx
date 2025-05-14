import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { StockSearchService, StockSuggestion, StockSearchError } from '@/services/stockSearchService';

interface StockSearchProps {
  onSelect: (symbol: string, exchange: string) => void;
  placeholder?: string;
  minQueryLength?: number;
}

const StockSearch = ({ 
  onSelect, 
  placeholder = "Search stocks...",
  minQueryLength = 2
}: StockSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await StockSearchService.searchStocks(debouncedQuery);
        setSuggestions(data);
        setError(null);
      } catch (err) {
        if (err instanceof StockSearchError) {
          switch (err.code) {
            case 'EMPTY_QUERY':
            case 'QUERY_TOO_SHORT':
              setSuggestions([]);
              setError(null);
              break;
            case 'NETWORK_ERROR':
              setError('Network error - please check your connection');
              break;
            default:
              setError(err.message);
          }
        } else {
          setError('An unexpected error occurred');
        }
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout
    searchTimeoutRef.current = setTimeout(fetchSuggestions, 100);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedQuery, minQueryLength]);

  const handleSelect = (suggestion: StockSuggestion) => {
    setQuery(suggestion.symbol);
    setShowDropdown(false);
    setError(null);
    onSelect(suggestion.symbol, suggestion.exchange);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowDropdown(true);
    setError(null);

    if (newQuery.length < minQueryLength) {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-finance-primary focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? 'search-error' : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-finance-primary"></div>
          </div>
        )}
      </div>

      {error && (
        <div id="search-error" className="mt-1 text-sm text-red-500">
          {error}
        </div>
      )}

      {showDropdown && (query || suggestions.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.symbol}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{suggestion.symbol}</div>
                  <div className="text-sm text-gray-500">{suggestion.name}</div>
                </div>
                <div className="text-xs text-gray-400">{suggestion.exchange}</div>
              </div>
            ))
          ) : query.length >= minQueryLength ? (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          ) : (
            <div className="px-4 py-2 text-gray-500">
              Type at least {minQueryLength} characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch; 