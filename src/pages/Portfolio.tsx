import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  BarChart3, 
  Target,
  Plus,
  Settings,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

const Portfolio = () => {
  const [showValues, setShowValues] = useState(true);

  const portfolioData = {
    totalValue: 125430.50,
    totalChange: 2340.75,
    totalChangePercent: 1.91,
    dailyChange: 890.25,
    dailyChangePercent: 0.71
  };

  const holdings = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 25, avgPrice: 175.50, currentPrice: 185.92, value: 4648.00, change: 260.50, changePercent: 5.93 },
    { symbol: 'MSFT', name: 'Microsoft', shares: 15, avgPrice: 380.20, currentPrice: 415.26, value: 6228.90, change: 525.90, changePercent: 9.22 },
    { symbol: 'GOOGL', name: 'Alphabet', shares: 20, avgPrice: 140.80, currentPrice: 142.56, value: 2851.20, change: 35.20, changePercent: 1.25 },
    { symbol: 'AMZN', name: 'Amazon', shares: 30, avgPrice: 165.40, currentPrice: 178.12, value: 5343.60, change: 381.60, changePercent: 7.69 },
    { symbol: 'NVDA', name: 'NVIDIA', shares: 8, avgPrice: 850.00, currentPrice: 950.02, value: 7600.16, change: 800.16, changePercent: 11.78 }
  ];

  const assetAllocation = [
    { category: 'Technology', percentage: 45, value: 56443.86, color: 'bg-finance-primary' },
    { category: 'Healthcare', percentage: 20, value: 25086.10, color: 'bg-finance-success' },
    { category: 'Financial', percentage: 15, value: 18814.58, color: 'bg-finance-warning' },
    { category: 'Consumer', percentage: 12, value: 15051.66, color: 'bg-finance-accent' },
    { category: 'Other', percentage: 8, value: 10034.44, color: 'bg-finance-danger' }
  ];

  const performanceData = [
    { period: '1D', change: 890.25, changePercent: 0.71 },
    { period: '1W', change: 2340.75, changePercent: 1.91 },
    { period: '1M', change: 5670.50, changePercent: 4.73 },
    { period: '3M', change: 12340.25, changePercent: 10.89 },
    { period: '1Y', change: 23450.75, changePercent: 23.01 }
  ];

  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-finance-success" /> : 
      <TrendingDown className="h-4 w-4 text-finance-danger" />;
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-finance-success' : 'text-finance-danger';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-finance-primary/5 via-transparent to-finance-accent/5" />
        <div className="container-responsive py-12 sm:py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-finance-primary to-finance-accent rounded-2xl shadow-lg">
                <Wallet className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-responsive-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-finance-primary via-finance-accent to-finance-secondary">
              Portfolio Management
            </h1>
            
            <p className="max-w-3xl mx-auto text-responsive text-muted-foreground leading-relaxed">
              Track your investments, analyze performance, and optimize your portfolio with advanced tools and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Overview */}
      <section className="py-8 sm:py-12">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Portfolio Value */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Total Portfolio Value</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowValues(!showValues)}
                    className="h-8 w-8 p-0"
                  >
                    {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-foreground">
                    {showValues ? formatCurrency(portfolioData.totalValue) : '••••••'}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(portfolioData.totalChange)}
                    <span className={`text-lg font-medium ${getTrendColor(portfolioData.totalChange)}`}>
                      {formatCurrency(portfolioData.totalChange)} ({portfolioData.totalChangePercent}%)
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Today: {formatCurrency(portfolioData.dailyChange)} ({portfolioData.dailyChangePercent}%)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Asset Allocation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assetAllocation.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                        <span className="text-sm font-medium">{asset.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{asset.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          {showValues ? formatCurrency(asset.value) : '••••'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.map((perf, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{perf.period}</span>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getTrendColor(perf.change)}`}>
                          {formatCurrency(perf.change)}
                        </div>
                        <div className={`text-xs ${getTrendColor(perf.change)}`}>
                          {perf.changePercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Holdings and Analysis */}
      <section className="py-8 sm:py-12">
        <div className="container-responsive">
          <Tabs defaultValue="holdings" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </div>
            </div>

            <TabsContent value="holdings" className="space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle>Current Holdings</CardTitle>
                  <CardDescription>
                    Your current stock positions and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-finance-primary to-finance-accent rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{holding.symbol}</span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{holding.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {holding.shares} shares @ {formatCurrency(holding.avgPrice)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {showValues ? formatCurrency(holding.value) : '••••'}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(holding.change)}
                            <span className={`text-sm font-medium ${getTrendColor(holding.change)}`}>
                              {formatCurrency(holding.change)} ({holding.changePercent}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-glass">
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>Portfolio risk metrics and diversification</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Portfolio Beta</span>
                      <span className="font-medium">1.15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sharpe Ratio</span>
                      <span className="font-medium text-finance-success">1.85</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Max Drawdown</span>
                      <span className="font-medium text-finance-danger">-8.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Diversification Score</span>
                      <span className="font-medium text-finance-warning">7.2/10</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-glass">
                  <CardHeader>
                    <CardTitle>Allocation Chart</CardTitle>
                    <CardDescription>Visual breakdown of your portfolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assetAllocation.map((asset, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{asset.category}</span>
                            <span>{asset.percentage}%</span>
                          </div>
                          <Progress value={asset.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest buys, sells, and adjustments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: '2024-01-15', type: 'BUY', symbol: 'AAPL', shares: 5, price: 185.92, total: 929.60 },
                      { date: '2024-01-14', type: 'SELL', symbol: 'TSLA', shares: 10, price: 245.50, total: 2455.00 },
                      { date: '2024-01-13', type: 'BUY', symbol: 'NVDA', shares: 3, price: 950.02, total: 2850.06 },
                      { date: '2024-01-12', type: 'BUY', symbol: 'MSFT', shares: 8, price: 415.26, total: 3322.08 }
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant={transaction.type === 'BUY' ? 'default' : 'secondary'}>
                            {transaction.type}
                          </Badge>
                          <div>
                            <div className="font-medium">{transaction.symbol}</div>
                            <div className="text-sm text-muted-foreground">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{transaction.shares} shares</div>
                          <div className="text-sm text-muted-foreground">
                            @ {formatCurrency(transaction.price)}
                          </div>
                          <div className="font-medium">{formatCurrency(transaction.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Goals and Targets */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Investment Goals
            </h2>
            <p className="text-muted-foreground">
              Set and track your financial goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Retirement Fund', target: 1000000, current: 125430.50, deadline: '2040', icon: Target },
              { name: 'Emergency Fund', target: 50000, current: 35000, deadline: '2024', icon: Wallet },
              { name: 'House Down Payment', target: 100000, current: 45000, deadline: '2025', icon: Target }
            ].map((goal, index) => {
              const Icon = goal.icon;
              const progress = (goal.current / goal.target) * 100;
              
              return (
                <Card key={index} className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-finance-primary to-finance-accent rounded-xl">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-center mb-2">{goal.name}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      <div className="text-center space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(goal.current)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of {formatCurrency(goal.target)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Target: {goal.deadline}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio; 