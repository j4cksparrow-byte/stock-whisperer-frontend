import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EnhancedStockAnalysis from '@/components/EnhancedStockAnalysis';
import TradingViewChart from '@/components/TradingViewChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Globe, 
  BarChart3, 
  Users, 
  Zap,
  ArrowRight,
  Play,
  BookOpen,
  Wallet,
  Target,
  Lightbulb,
  Maximize2
} from 'lucide-react';
import { getTvSymbol } from '@/lib/marketSymbols';

const Index = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState('NASDAQ');

  const handleAnalysisComplete = (symbol: string) => {
    console.log(`Analysis completed for ${symbol}`);
  };

  const marketIndices = [
    { symbol: 'NASDAQ', name: 'NASDAQ Composite', value: '16,742.38', change: '+0.85%', trend: 'up', volume: '2.1B', description: 'Technology-heavy index tracking innovation stocks' },
    { symbol: 'S&P500', name: 'S&P 500', value: '5,234.18', change: '+0.32%', trend: 'up', volume: '3.8B', description: 'Broad market index representing 500 large US companies' },
    { symbol: 'DOW', name: 'Dow Jones', value: '39,807.37', change: '-0.12%', trend: 'down', volume: '1.2B', description: 'Price-weighted index of 30 major US companies' },
    { symbol: 'RUSSELL', name: 'Russell 2000', value: '2,108.05', change: '+1.23%', trend: 'up', volume: '890M', description: 'Small-cap index tracking 2000 smaller companies' },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Hybrid Analysis',
      description: 'Combines technical, fundamental, and sentiment analysis for comprehensive insights',
      color: 'from-finance-primary to-finance-accent',
      action: 'Start Analysis',
      route: '/'
    },
    {
      icon: Activity,
      title: 'Real-time Data',
      description: 'Live market data with advanced charting and technical indicators',
      color: 'from-finance-success to-emerald-400',
      action: 'Explore Market',
      route: '/market'
    },
    {
      icon: Users,
      title: 'Smart Recommendations',
      description: 'AI-powered buy/sell/hold recommendations with confidence levels',
      color: 'from-finance-warning to-orange-400',
      action: 'View Portfolio',
      route: '/portfolio'
    },
    {
      icon: Zap,
      title: 'Instant Insights',
      description: 'Get detailed analysis in seconds with customizable parameters',
      color: 'from-finance-danger to-pink-400',
      action: 'Learn More',
      route: '/learn'
    }
  ];

  const quickActions = [
    {
      title: 'Market Analysis',
      description: 'Analyze current market trends and opportunities',
      icon: BarChart3,
      route: '/market',
      color: 'from-finance-primary to-finance-accent'
    },
    {
      title: 'Portfolio Review',
      description: 'Review and optimize your investment portfolio',
      icon: Wallet,
      route: '/portfolio',
      color: 'from-finance-success to-emerald-400'
    },
    {
      title: 'Learning Center',
      description: 'Master trading strategies and market analysis',
      icon: BookOpen,
      route: '/learn',
      color: 'from-finance-warning to-orange-400'
    },
    {
      title: 'Goal Setting',
      description: 'Set and track your investment goals',
      icon: Target,
      route: '/portfolio',
      color: 'from-finance-danger to-pink-400'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-finance-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-finance-danger" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-finance-success';
      case 'down':
        return 'text-finance-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-finance-primary/5 via-transparent to-finance-accent/5" />
        <div className="container-responsive py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-finance-primary to-finance-accent rounded-2xl shadow-lg animate-pulse">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-responsive-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary via-finance-accent to-finance-secondary animate-fade-in">
              StockViz - Hybrid Stock Analysis Dashboard
            </h1>
            
            <p className="max-w-3xl mx-auto text-responsive text-muted-foreground leading-relaxed animate-slide-in">
              Intelligent analysis combining technical, fundamental, and sentiment data for informed investment decisions. 
              Get comprehensive insights with AI-powered recommendations and real-time market data.
            </p>

            {/* Interactive Market Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
              {marketIndices.map((index, idx) => {
                const tv = getTvSymbol(index.symbol) || getTvSymbol('NASDAQ');
                return (
                  <Dialog key={index.symbol}>
                    <DialogTrigger asChild>
                      <Card className="card-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {index.symbol}
                            </Badge>
                            {getTrendIcon(index.trend)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-bold">{index.value}</p>
                            <p className={`text-sm font-medium ${getTrendColor(index.trend)}`}>
                              {index.change}
                            </p>
                            <p className="text-xs text-muted-foreground">Vol: {index.volume}</p>
                          </div>
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>Click for details</span>
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl sm:max-w-6xl p-0">
                      <div className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Globe className="h-5 w-5" />
                            <span>{index.name} Overview</span>
                          </DialogTitle>
                          <DialogDescription>
                            {index.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold">{index.value}</div>
                            <div className="text-sm text-muted-foreground">Current Value</div>
                          </div>
                          <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className={`text-2xl font-bold ${getTrendColor(index.trend)}`}>
                              {index.change}
                            </div>
                            <div className="text-sm text-muted-foreground">Today's Change</div>
                          </div>
                        </div>
                        <div className="h-[50vh]">
                          <TradingViewChart
                            symbol={tv ? tv.tvSymbol : 'AMEX:SPY'}
                            height={500}
                            hideTopToolbar={false}
                            hideSideToolbar={false}
                          />
                        </div>
                        <Button className="w-full" onClick={() => navigate(`/chart/${encodeURIComponent(tv ? tv.tvSymbol : 'AMEX:SPY')}`)}>
                          <Maximize2 className="mr-2 h-4 w-4" />
                          View Full Analysis
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Powerful Features for Smart Investing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed investment decisions with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="card-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onClick={() => navigate(feature.route)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      {feature.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Analysis Section */}
      <section className="py-8 sm:py-12">
        <div className="container-responsive">
          <div className="text-center mb-8">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Start Your Analysis
            </h2>
            <p className="text-muted-foreground">
              Get comprehensive insights for any stock with our advanced analysis engine
            </p>
          </div>
          <EnhancedStockAnalysis onAnalysisComplete={handleAnalysisComplete} />
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Quick Actions
            </h2>
            <p className="text-muted-foreground">
              Jump into the most common tasks and features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="card-glass hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(action.route)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${action.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {action.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section className="py-12 sm:py-16">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Market Overview
            </h2>
            <p className="text-muted-foreground">
              Track major market indices and global economic indicators
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TradingView Chart */}
            <Card className="card-glass hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Global Market Chart</span>
                </CardTitle>
                <CardDescription>
                  Interactive chart showing major market indices performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradingViewChart
                  symbol={(getTvSymbol('S&P500')?.tvSymbol) || 'AMEX:SPY'}
                  height={300}
                  hideTopToolbar={false}
                  hideSideToolbar={false}
                />
              </CardContent>
            </Card>

            {/* Market Stats */}
            <div className="space-y-6">
              <Card className="card-glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>Market Statistics</CardTitle>
                  <CardDescription>Key market indicators and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {marketIndices.map((index) => (
                    <div key={index.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">{index.name}</p>
                        <p className="text-sm text-muted-foreground">{index.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{index.value}</p>
                        <p className={`text-sm font-medium ${getTrendColor(index.trend)}`}>
                          {index.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-muted/50 border-t border-border/50 mt-16">
        <div className="container-responsive py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-finance-primary" />
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary to-finance-accent">
                  StockViz
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligent stock analysis platform for informed investment decisions.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Globe className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <TrendingUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/market" className="text-muted-foreground hover:text-foreground transition-colors">Market</Link></li>
                <li><Link to="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link></li>
                <li><Link to="/learn" className="text-muted-foreground hover:text-foreground transition-colors">Learn</Link></li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/analysis" className="text-muted-foreground hover:text-foreground transition-colors">Stock Analysis</Link></li>
                <li><Link to="/chart/AMEX:SPY" className="text-muted-foreground hover:text-foreground transition-colors">Chart Playground</Link></li>
                <li><Link to="/market" className="text-muted-foreground hover:text-foreground transition-colors">Market Data</Link></li>
                <li><Link to="/learn" className="text-muted-foreground hover:text-foreground transition-colors">Trading Education</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 StockViz. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
              Made with ❤️ for smart investors
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;