import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StrategyConfig {
  symbol: string;
  mode: 'basic' | 'advanced' | 'llm';
  indicators: {
    sma: { enabled: boolean; period: number };
    ema: { enabled: boolean; period: number };
    rsi: { enabled: boolean; period: number };
  };
  fundamentals: {
    peRange: { min: number; max: number };
    peg: number;
    dividendYieldMin: number;
    marketCapMin: string;
    debtToEquityMax: number;
  };
  weights: {
    technical: number;
    fundamental: number;
    sentiment: number;
  };
}

const StrategySetup = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<StrategyConfig>({
    symbol: 'TSLA',
    mode: 'basic',
    indicators: {
      sma: { enabled: true, period: 20 },
      ema: { enabled: false, period: 12 },
      rsi: { enabled: true, period: 14 }
    },
    fundamentals: {
      peRange: { min: 15, max: 25 },
      peg: 1,
      dividendYieldMin: 2.0,
      marketCapMin: 'small',
      debtToEquityMax: 1.5
    },
    weights: {
      technical: 33,
      fundamental: 33,
      sentiment: 20
    }
  });

  const [activeTab, setActiveTab] = useState('Analyze');
  const tabs = ['Dashboard', 'Analyze', 'Watchlist', 'Alerts', 'Settings'];

  const isValidSymbol = config.symbol.length >= 1 && config.symbol.length <= 5;

  const handleRunAnalysis = () => {
    if (isValidSymbol) {
      // Navigate to dashboard with the configuration
      navigate('/', { state: { config } });
    }
  };

  const handleReset = () => {
    setConfig({
      symbol: '',
      mode: 'basic',
      indicators: {
        sma: { enabled: false, period: 20 },
        ema: { enabled: false, period: 12 },
        rsi: { enabled: false, period: 14 }
      },
      fundamentals: {
        peRange: { min: 10, max: 30 },
        peg: 1,
        dividendYieldMin: 0,
        marketCapMin: 'small',
        debtToEquityMax: 2.0
      },
      weights: {
        technical: 33,
        fundamental: 33,
        sentiment: 33
      }
    });
  };

  const mockPreviewData = {
    technical: 65,
    fundamental: 70,
    sentiment: 40,
    aggregate: 60
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
              <span className="font-semibold">Build Strategy — Input</span>
            </div>
            
            <nav className="flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    activeTab === tab 
                      ? 'text-primary border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        {/* Strategy Setup */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Symbol */}
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <div className="relative">
                  <Input
                    id="symbol"
                    value={config.symbol}
                    onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className={!isValidSymbol && config.symbol ? 'border-red-500' : ''}
                  />
                  {!isValidSymbol && config.symbol && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Invalid symbol
                    </div>
                  )}
                </div>
              </div>

              {/* Mode */}
              <div className="space-y-3">
                <Label>Mode</Label>
                <div className="flex gap-4">
                  <Select value="basic" onValueChange={() => {}}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="1w" onValueChange={() => {}}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1w">1W</SelectItem>
                      <SelectItem value="1m">1M</SelectItem>
                      <SelectItem value="3m">3M</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="3m" onValueChange={() => {}}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">3M</SelectItem>
                      <SelectItem value="6m">6M</SelectItem>
                      <SelectItem value="1y">1Y</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="1y" onValueChange={() => {}}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1y">1Y</SelectItem>
                      <SelectItem value="2y">2Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <RadioGroup
                  value={config.mode}
                  onValueChange={(value: 'basic' | 'advanced' | 'llm') => 
                    setConfig(prev => ({ ...prev, mode: value }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Basic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="llm" id="llm" />
                    <Label htmlFor="llm">LLM</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Indicators */}
              <div className="space-y-3">
                <Label>Indicators</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.indicators.sma.enabled}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({
                            ...prev,
                            indicators: { ...prev.indicators, sma: { ...prev.indicators.sma, enabled: !!checked }}
                          }))
                        }
                      />
                      <Label>SMA</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config.indicators.sma.period}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            indicators: { ...prev.indicators, sma: { ...prev.indicators.sma, period: parseInt(e.target.value) }}
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">30.6</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.indicators.ema.enabled}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({
                            ...prev,
                            indicators: { ...prev.indicators, ema: { ...prev.indicators.ema, enabled: !!checked }}
                          }))
                        }
                      />
                      <Label>EMA</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config.indicators.ema.period}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            indicators: { ...prev.indicators, ema: { ...prev.indicators.ema, period: parseInt(e.target.value) }}
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">12.28</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.indicators.rsi.enabled}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({
                            ...prev,
                            indicators: { ...prev.indicators, rsi: { ...prev.indicators.rsi, enabled: !!checked }}
                          }))
                        }
                      />
                      <Label>RSI</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config.indicators.rsi.period}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            indicators: { ...prev.indicators, rsi: { ...prev.indicators.rsi, period: parseInt(e.target.value) }}
                          }))
                        }
                        className="w-16 h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fundamentals */}
              <div className="space-y-4">
                <Label>Fundamentals</Label>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>PE Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config.fundamentals.peRange.min}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            fundamentals: { 
                              ...prev.fundamentals, 
                              peRange: { ...prev.fundamentals.peRange, min: parseInt(e.target.value) }
                            }
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={config.fundamentals.peRange.max}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            fundamentals: { 
                              ...prev.fundamentals, 
                              peRange: { ...prev.fundamentals.peRange, max: parseInt(e.target.value) }
                            }
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">15 %</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>PEG</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={config.fundamentals.peg}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            fundamentals: { ...prev.fundamentals, peg: parseFloat(e.target.value) }
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Dividend Yield Min</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={config.fundamentals.dividendYieldMin}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            fundamentals: { ...prev.fundamentals, dividendYieldMin: parseFloat(e.target.value) }
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Market Cap Min</Label>
                    <Select
                      value={config.fundamentals.marketCapMin}
                      onValueChange={(value) => 
                        setConfig(prev => ({
                          ...prev,
                          fundamentals: { ...prev.fundamentals, marketCapMin: value }
                        }))
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Debt-to-Equity Max</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={config.fundamentals.debtToEquityMax}
                        onChange={(e) => 
                          setConfig(prev => ({
                            ...prev,
                            fundamentals: { ...prev.fundamentals, debtToEquityMax: parseFloat(e.target.value) }
                          }))
                        }
                        className="w-16 h-8"
                      />
                      <span className="text-sm text-muted-foreground">1 %</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weights */}
              <div className="space-y-4">
                <Label>Weights</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Label className="text-sm">Technical</Label>
                    <div className="mt-2 text-lg font-semibold">{config.weights.technical}</div>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm">Fundamental</Label>
                    <div className="mt-2 text-lg font-semibold">{config.weights.fundamental}</div>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm">Sentiment</Label>
                    <div className="mt-2 text-lg font-semibold">{config.weights.sentiment}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Save</Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
                  <span className="text-xs text-muted-foreground self-center">act</span>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
                  <Button size="sm" onClick={handleRunAnalysis} disabled={!isValidSymbol}>
                    Run Analysis
                  </Button>
                  <Button variant="outline" size="sm">
                    <span className="text-blue-600">📊 Analysis</span>
                  </Button>
                  <Button variant="outline" size="sm">Preview</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="w-80">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{config.symbol}</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Technical</span>
                  <span className="font-semibold">{mockPreviewData.technical}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${mockPreviewData.technical}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Fundamental</span>
                  <span className="font-semibold">{mockPreviewData.fundamental}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${mockPreviewData.fundamental}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Sentiment</span>
                  <span className="font-semibold">{mockPreviewData.sentiment}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${mockPreviewData.sentiment}%` }}
                  />
                </div>
              </div>

              <div className="text-center pt-4">
                <div className="text-sm text-muted-foreground mb-2">Aggregate</div>
                <div className="relative inline-block">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - mockPreviewData.aggregate / 100)}`}
                      className="text-blue-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{mockPreviewData.aggregate}</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">Data quality</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">Request budget</Badge>
                  </div>
                  <div className="text-sm font-medium">Expected vs <span className="font-bold">Hold</span></div>
                  <div className="text-xs text-muted-foreground">Last updated 2 min. ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StrategySetup;