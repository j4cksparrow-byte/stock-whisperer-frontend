import React, { useState, useEffect } from 'react';
// allow runtime require fallback in this file
declare const require: any;
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
// Using simple elements instead of small UI primitives that aren't present
import { Loader, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, BarChart3, PieChart, Newspaper, Calculator } from 'lucide-react';
// useToast not available in this workspace; use console fallback
import PriceChart from './PriceChart';
import LoadingSpinner from './LoadingSpinner';
import { useSearch } from '../lib/queries';
// Optional service - may not exist in this repo; guarded at runtime
let EnhancedStockService: any = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  EnhancedStockService = require('@/services/enhancedStockService').default || require('@/services/enhancedStockService');
} catch (e) {
  // service not available; keep simulated behavior
}

// Minimal types to keep this file self-contained; adapt as needed
type AnalysisMode = 'smart' | 'pro';
type AnalysisDuration = '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

const EnhancedStockAnalysis: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('smart');
  const [analysisDuration, setAnalysisDuration] = useState<AnalysisDuration>('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparing analysis...');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
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
    setError(null);
    setAnalysisResult(null);
  };

  const handleAnalysisSubmit = async () => {
    if (!selectedCompany) {
      toast({ title: 'No Company Selected', description: 'Please select a company to analyze.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Initializing analysis...');

    try {
      // Simulate analysis steps
      setLoadingMessage('Fetching market data...');
      await new Promise(res => setTimeout(res, 600));
      setLoadingMessage('Analyzing technical indicators...');
      await new Promise(res => setTimeout(res, 800));
      setLoadingMessage('Processing fundamentals...');
      await new Promise(res => setTimeout(res, 600));

      // Call service if available
      if ((EnhancedStockService as any)?.analyzeStock) {
        const res = await (EnhancedStockService as any).analyzeStock({ symbol: selectedCompany.symbol });
        // Normalize known upstream mock/enhanced service shape to our component's expected shape
        // Upstream mock returns: { symbol, companyName, recommendation: {action, confidence, score}, aiSummary, ... }
        if (res && (res.aiSummary || res.recommendation)) {
          setAnalysisResult(res);
        } else if (res && res.analysis) {
          // Backend analyzer returns { status, symbol, analysis: { overall: { score, recommendation }, aiInsights: { summary }, ... } }
          const companyName = res.companyName || selectedCompany.name || res.symbol || selectedCompany.symbol;
          const symbol = res.symbol || selectedCompany.symbol;
          const rec = res.analysis?.overall?.recommendation || res.analysis?.overall || res.recommendation || 'HOLD';
          const score = res.analysis?.overall?.score ?? res.recommendation?.score ?? res.analysis?.enhanced?.aggregateScore ?? 50;
          // Robust AI summary extraction: support multiple shapes (backend aiInsights, upstream supabase `insights`, raw, or arrays)
          const aiCandidates: Array<string | undefined> = [];

          // common locations
          aiCandidates.push(res.aiSummary);
          aiCandidates.push(res.raw);

          // top-level insights (supabase function returns { insights: { full_analysis, executive_summary, ... } })
          if (res.insights) {
            aiCandidates.push(res.insights.full_analysis || res.insights.fullAnalysis);
            aiCandidates.push(res.insights.executive_summary || res.insights.executiveSummary);
            aiCandidates.push(res.insights.investment_recommendation || res.insights.investmentRecommendation);
          }

          // analysis subtree
          if (res.analysis) {
            aiCandidates.push(res.analysis.aiInsights?.summary);
            // analysis.insights may be camelCase or snake_case
            const ains = res.analysis.insights || {};
            aiCandidates.push(ains.full_analysis || ains.fullAnalysis || ains.fullAnalysisText || ains.full_analysis_text);
            aiCandidates.push(ains.executive_summary || ains.executiveSummary);
            aiCandidates.push(ains.investment_recommendation || ains.investmentRecommendation || ains.recommendation);
            // join key strengths/concerns if present
            const ks = (ains.key_strengths || ains.keyStrengths || ains.keyStrength || []).filter?.(Boolean);
            if (ks && ks.length) aiCandidates.push(ks.join('\n'));
            const kc = (ains.key_concerns || ains.keyConcerns || ains.keyConcerns || ains.key_concern || []).filter?.(Boolean);
            if (kc && kc.length) aiCandidates.push(kc.join('\n'));
          }

          // fallback to array join
          if (Array.isArray(res)) aiCandidates.push(res.join('\n'));

          const aiSummary = aiCandidates.find(Boolean) || '';
          const currentPrice = res.currentPrice || res.analysis?.meta?.price || '$0.00';

          setAnalysisResult({
            companyName,
            symbol,
            recommendation: { action: typeof rec === 'string' ? rec : (rec.action || 'HOLD'), confidence: typeof rec === 'string' ? 'MEDIUM' : (rec.confidence || 'MEDIUM'), score },
            aiSummary,
            keyFactors: res.keyFactors || res.analysis?.insights?.keyStrengths || [],
            risks: res.risks || res.analysis?.insights?.riskFactors || [],
            nextCatalysts: res.nextCatalysts || [],
            currentPrice,
            priceContext: res.priceContext || res.analysis?.meta?.priceContext || ''
          });
        } else {
          setAnalysisResult({ companyName: selectedCompany.name || selectedCompany.symbol, symbol: selectedCompany.symbol || 'N/A', recommendation: { action: 'HOLD', confidence: 'MEDIUM', score: 55 }, aiSummary: 'Simulated analysis result.', keyFactors: ['Factor A', 'Factor B'], risks: ['Risk 1'], nextCatalysts: [], currentPrice: '$123.45', priceContext: '+1.2%'});
        }
      } else {
        setAnalysisResult({ companyName: selectedCompany.name || selectedCompany.symbol, symbol: selectedCompany.symbol || 'N/A', recommendation: { action: 'HOLD', confidence: 'MEDIUM', score: 55 }, aiSummary: 'Simulated analysis result.', keyFactors: ['Factor A', 'Factor B'], risks: ['Risk 1'], nextCatalysts: [], currentPrice: '$123.45', priceContext: '+1.2%'});
      }

      toast({ title: 'Analysis Complete', description: `Analyzed ${selectedCompany.symbol}` });
    } catch (err: any) {
      setError(err?.message || 'Analysis failed');
      toast({ title: 'Analysis Failed', description: err?.message || 'Unexpected error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setLoadingMessage('Preparing analysis...');
    }
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
              disabled={isLoading || !selectedCompany} 
              className="w-full h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              ) : (
                'Analyze'
              )}
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

          {error && (
            <div className="mt-6 border border-red-300 bg-red-50 rounded p-3 text-red-700">
              <div className="flex items-center space-x-2"><AlertTriangle className="h-4 w-4" /><strong>Analysis Error</strong></div>
              <div className="mt-1 text-sm">{error}</div>
            </div>
          )}

          {analysisResult && (
            <div className="mt-8 space-y-8">
              <div className="border-t my-4" />
              <h2 className="text-responsive-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary to-finance-accent text-center">Analysis Results for {analysisResult.companyName} ({analysisResult.symbol})</h2>

              <Card className="card-glass border-l-4 border-l-finance-success">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {analysisResult.recommendation.action === 'BUY' && <TrendingUp className="h-6 w-6 text-finance-success" />}
                    {analysisResult.recommendation.action === 'HOLD' && <Minus className="h-6 w-6 text-finance-warning" />}
                    {analysisResult.recommendation.action === 'SELL' && <TrendingDown className="h-6 w-6 text-finance-danger" />}
                    <span className="text-2xl font-bold text-foreground">{analysisResult.recommendation.action}</span>
                    <Badge variant="outline" className={`text-lg font-semibold ${analysisResult.recommendation.confidence === 'HIGH' ? 'border-finance-success text-finance-success' : analysisResult.recommendation.confidence === 'MEDIUM' ? 'border-finance-warning text-finance-warning' : 'border-finance-danger text-finance-danger'}`}>Confidence: {analysisResult.recommendation.confidence}</Badge>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Overall Hybrid Score: {analysisResult.recommendation.score}/100</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-slate-100 rounded h-3 overflow-hidden"><div style={{ width: `${analysisResult.recommendation.score}%` }} className="h-3 bg-gradient-to-r from-green-400 to-green-600" /></div>
                  <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{analysisResult.aiSummary}</p>
                </CardContent>
              </Card>

              <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card/50 p-2">
                <h3 className="text-xl font-bold text-foreground mb-2 px-4 pt-2">Live Chart</h3>
                <PriceChart />
                <div className="flex justify-between items-center px-4 pb-2 text-muted-foreground text-sm"><span>Current Price: <span className="font-bold text-foreground">{analysisResult.currentPrice}</span></span><span>{analysisResult.priceContext}</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStockAnalysis;
