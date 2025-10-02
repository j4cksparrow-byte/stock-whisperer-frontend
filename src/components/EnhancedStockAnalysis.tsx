import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import PriceChart from './PriceChart';
import LoadingSpinner from './LoadingSpinner';
import { useSearch } from '../lib/queries';
import api from '../lib/api';

// Minimal types to keep this file self-contained; adapt as needed
type AnalysisMode = 'smart' | 'pro';
type AnalysisDuration = '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

const EnhancedStockAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('smart');
  const [analysisDuration, setAnalysisDuration] = useState<AnalysisDuration>('1M');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data: searchResults, isLoading: isSearching } = useSearch(debouncedQuery);

  const toast = (opts: any) => console.log('TOAST:', opts);

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setSearchQuery(company.symbol);
  };

  const handleAnalysisSubmit = () => {
    if (!selectedCompany) {
      toast({ title: 'No Company Selected', description: 'Please select a company to analyze.', variant: 'destructive' });
      return;
    }

    // Navigate to the symbol analysis page with query parameters
    const params = new URLSearchParams();
    params.set('tf', analysisDuration);
    params.set('mode', analysisMode === 'smart' ? 'normal' : 'advanced');
    
    navigate(`/symbol/${selectedCompany.symbol}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
        
        <CardHeader className="relative bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 text-center mb-2">
            Hybrid Analysis
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base max-w-xl mx-auto">
            Get intelligent insights combining technical, fundamental, and sentiment analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Mode and Duration - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Analysis Mode</label>
              <Tabs value={analysisMode} onValueChange={(v: any) => setAnalysisMode(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 h-9">
                  <TabsTrigger 
                    value="smart" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-md text-xs font-medium transition-all duration-200"
                  >
                    Smart
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pro" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-md text-xs font-medium transition-all duration-200"
                  >
                    Pro
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Duration</label>
              <Select value={analysisDuration} onValueChange={(v: any) => setAnalysisDuration(v)}>
                <SelectTrigger className="w-full h-9 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
                  <SelectItem value="1W" className="text-sm py-2">1 Week</SelectItem>
                  <SelectItem value="1M" className="text-sm py-2">1 Month</SelectItem>
                  <SelectItem value="3M" className="text-sm py-2">3 Months</SelectItem>
                  <SelectItem value="6M" className="text-sm py-2">6 Months</SelectItem>
                  <SelectItem value="1Y" className="text-sm py-2">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar - Middle */}
          <div className="space-y-2">
            <label htmlFor="company-search" className="block text-sm font-semibold text-gray-900 dark:text-white">Search Company</label>
            <div className="relative">
              <Input
                className="text-sm pr-10 h-10 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
                placeholder="Search for a symbol (e.g., AAPL, TSLA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Action Button - Below Search Bar */}
          <div className="space-y-2">
            <Button 
              onClick={handleAnalysisSubmit} 
              disabled={!selectedCompany} 
              className="w-full h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Analyze
            </Button>
          </div>

          {/* Search Results - Bottom */}
          {debouncedQuery && (
            <div className="space-y-2">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 max-h-48 overflow-auto shadow-lg">
                {isSearching ? (
                  <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    <LoadingSpinner size="sm" className="mx-auto mb-2" />
                    <div className="text-xs font-medium">Searching...</div>
                  </div>
                ) : searchResults?.results?.length ? (
                  searchResults.results.map((r) => (
                    <button
                      key={r.symbol}
                      onClick={() => handleCompanySelect(r)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">{r.symbol}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.name ?? ('type' in r ? r.type : '') ?? ''}</div>
                      {r.region && <div className="text-xs text-gray-400 dark:text-gray-500">{r.region}</div>}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                    No results found for "{debouncedQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStockAnalysis;
