import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWatchlist } from '../contexts/WatchlistContext';
import ChartExpandModal from '../components/ChartExpandModal';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Globe, 
  BookOpen, 
  Play, 
  Maximize2,
  Info,
  Lightbulb,
  Target,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  DollarSign,
  Users,
  Zap,
  Eye
} from 'lucide-react';

const Market = () => {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isWatched } = useWatchlist();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedChart, setSelectedChart] = useState('NASDAQ');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<{
    isOpen: boolean;
    symbol: string;
    name: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>({
    isOpen: false,
    symbol: '',
    name: '',
    value: '',
    change: '',
    trend: 'up'
  });

  useEffect(() => {
    // Simulate initial loading to prevent race conditions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">We're sorry, but something unexpected happened.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const marketIndices = [
    { symbol: 'NASDAQ', name: 'NASDAQ Composite', value: '16,742.38', change: '+0.85%', trend: 'up', volume: '2.1B' },
    { symbol: 'S&P500', name: 'S&P 500', value: '5,234.18', change: '+0.32%', trend: 'up', volume: '3.8B' },
    { symbol: 'DOW', name: 'Dow Jones', value: '39,807.37', change: '-0.12%', trend: 'down', volume: '1.2B' },
    { symbol: 'RUSSELL', name: 'Russell 2000', value: '2,108.05', change: '+1.23%', trend: 'up', volume: '890M' },
  ];

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '254.63', change: '+0.20', trend: 'up' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: '517.95', change: '+0.65', trend: 'up' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '142.56', change: '+0.87', trend: 'up' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '219.57', change: '-2.60', trend: 'down' },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: '485.58', change: '+3.21', trend: 'up' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '186.58', change: '+4.73', trend: 'up' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '248.50', change: '-1.23', trend: 'down' },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: '485.30', change: '+2.15', trend: 'up' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: '145.67', change: '+1.89', trend: 'up' },
    { symbol: 'INTC', name: 'Intel Corporation', price: '45.23', change: '-0.45', trend: 'down' },
    { symbol: 'ORCL', name: 'Oracle Corporation', price: '125.34', change: '+1.23', trend: 'up' },
    { symbol: 'CRM', name: 'Salesforce Inc.', price: '285.67', change: '-2.15', trend: 'down' },
  ];


  const educationalContent = [
    {
      title: "Understanding Technical Analysis",
      description: "Learn how to read charts and identify patterns",
      icon: BarChart3,
      difficulty: "Beginner",
      duration: "15 min"
    },
    {
      title: "Market Indicators Explained",
      description: "RSI, MACD, Moving Averages and more",
      icon: Activity,
      difficulty: "Intermediate",
      duration: "20 min"
    },
    {
      title: "Risk Management Strategies",
      description: "Protect your investments with proper risk management",
      icon: Target,
      difficulty: "Advanced",
      duration: "25 min"
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  // Error boundary for component-level errors
  const handleError = (error: Error) => {
    console.error('Market component error:', error);
    setError(error.message);
  };

  // Handle analyze button click
  const handleAnalyze = (symbol: string) => {
    navigate(`/symbol/${symbol}`);
  };

  // Handle watch button click
  const handleWatch = (stock: any) => {
    if (isWatched(stock.symbol)) {
      removeFromWatchlist(stock.symbol);
      toast.success(`${stock.symbol} removed from watchlist`);
    } else {
      addToWatchlist({
        symbol: stock.symbol,
        name: stock.name,
        price: parseFloat(stock.price),
        change: parseFloat(stock.change.replace('%', '')),
        changePercent: parseFloat(stock.change.replace('%', ''))
      });
      toast.success(`${stock.symbol} added to watchlist`);
    }
  };

  // Handle chart expand
  const handleChartExpand = (index: any) => {
    setExpandedChart({
      isOpen: true,
      symbol: index.symbol,
      name: index.name,
      value: index.value,
      change: index.change,
      trend: index.trend
    });
  };

  // Close expanded chart
  const handleCloseChart = () => {
    setExpandedChart(prev => ({ ...prev, isOpen: false }));
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 leading-tight">
              StockViz Market Overview
            </h1>
            
            <p className="max-w-4xl mx-auto text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              Explore real-time market data, interactive charts, and educational content. 
              Learn while you analyze with our comprehensive market tools.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mt-8 sm:mt-12">
              {marketIndices.map((index) => (
                <Card key={index.symbol} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <Badge variant="outline" className="text-xs sm:text-sm font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                        {index.symbol}
                      </Badge>
                      {getTrendIcon(index.trend)}
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{index.value}</p>
                      <p className={`text-sm sm:text-base font-semibold ${getTrendColor(index.trend)}`}>
                        {index.change}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Vol: {index.volume}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Market Data Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4">
              Real-time Market Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
              Live market updates and trending stocks with real-time price movements
            </p>
          </div>

          {/* Market Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Market Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Market Status</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-300">Open</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Next Close</p>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-300">4:00 PM EST</p>
                  </div>
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Market Sentiment</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bullish</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Neutral</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bearish</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Charts Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4">
              Interactive Market Charts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
              Explore different timeframes and instruments. Click on any chart to expand and analyze in detail.
            </p>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe:</span>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-24 h-8 bg-transparent border-0 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="1D" className="text-sm">1D</SelectItem>
                  <SelectItem value="1W" className="text-sm">1W</SelectItem>
                  <SelectItem value="1M" className="text-sm">1M</SelectItem>
                  <SelectItem value="3M" className="text-sm">3M</SelectItem>
                  <SelectItem value="1Y" className="text-sm">1Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
              <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart:</span>
              <Select value={selectedChart} onValueChange={setSelectedChart}>
                <SelectTrigger className="w-32 h-8 bg-transparent border-0 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="NASDAQ" className="text-sm">NASDAQ</SelectItem>
                  <SelectItem value="S&P500" className="text-sm">S&P 500</SelectItem>
                  <SelectItem value="DOW" className="text-sm">Dow Jones</SelectItem>
                  <SelectItem value="AAPL" className="text-sm">Apple</SelectItem>
                  <SelectItem value="MSFT" className="text-sm">Microsoft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" className="h-8 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {marketIndices.slice(0, 4).map((index) => (
              <Card key={index.symbol} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative pb-4 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{index.name}</CardTitle>
                      <CardDescription className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{index.symbol}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs sm:text-sm font-semibold px-3 py-1 ${
                          index.trend === 'up' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
                        }`}
                      >
                        {index.change}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        onClick={() => handleChartExpand(index)}
                      >
                        <Maximize2 className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0">
                  <div 
                    className="h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200"
                    onClick={() => handleChartExpand(index)}
                  >
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 mb-1">Interactive Chart</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Click to expand and analyze</p>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Volume</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{index.volume}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Value</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{index.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Stocks Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 mb-4">
              Popular Stocks
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Track the most actively traded stocks with real-time data and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {popularStocks.map((stock) => (
              <Card key={stock.symbol} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stock.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stock.symbol}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(stock.trend)}
                      <Badge 
                        className={`text-xs sm:text-sm font-semibold px-3 py-1 ${
                          stock.trend === 'up' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {stock.change}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">${stock.price}</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Change</p>
                        <p className={`text-sm font-semibold ${getTrendColor(stock.trend)}`}>
                          {stock.change}
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-32 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-400 dark:text-gray-500 mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mini Chart</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
                        variant="default"
                        onClick={() => handleAnalyze(stock.symbol)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analyze
                      </Button>
                      <Button 
                        className={`w-full h-10 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                          isWatched(stock.symbol)
                            ? 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-600'
                            : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                        variant="outline"
                        onClick={() => handleWatch(stock)}
                      >
                        {isWatched(stock.symbol) ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Watching
                          </>
                        ) : (
                          <>
                            <TrendingUpIcon className="mr-2 h-4 w-4" />
                            Watch
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Summary */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <DollarSign className="h-6 w-6 mr-3 text-green-500" />
                Market Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Gainers</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300">+1,234</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Losers</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-300">-567</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Unchanged</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">89</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-500" />
                Active Traders
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Now</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">12,456</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Volume</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">$2.4B</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Active</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">AAPL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Learn & Explore
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enhance your trading knowledge with our educational content and interactive lessons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationalContent.map((content, index) => {
              const Icon = content.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-center mb-2">{content.title}</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">{content.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <Badge variant="outline" className="text-xs">
                        {content.difficulty}
                      </Badge>
                      <span>{content.duration}</span>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      <Play className="mr-2 h-4 w-4" />
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Insights */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Market Insights
            </h2>
            <p className="text-muted-foreground">
              Stay informed with the latest market analysis and trends
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Today's Market Sentiment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Bullish</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Neutral</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Bearish</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span>Key Market Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { time: "9:30 AM", event: "Market Open", status: "completed" },
                  { time: "10:00 AM", event: "Fed Chair Speech", status: "upcoming" },
                  { time: "2:00 PM", event: "Earnings: AAPL", status: "upcoming" },
                  { time: "4:00 PM", event: "Market Close", status: "upcoming" }
                ].map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      event.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium">{event.time}</span>
                    <span className="text-sm text-muted-foreground flex-1">{event.event}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chart Expand Modal */}
      <ChartExpandModal
        isOpen={expandedChart.isOpen}
        onClose={handleCloseChart}
        symbol={expandedChart.symbol}
        name={expandedChart.name}
        value={expandedChart.value}
        change={expandedChart.change}
        trend={expandedChart.trend}
      />
    </div>
    );
  } catch (error) {
    console.error('Market component render error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">We're sorry, but something unexpected happened.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default Market;
