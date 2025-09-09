import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import TradingViewChart from '@/components/TradingViewChart';
import { ArrowLeft, Layers, LineChart, Sun } from 'lucide-react';

const AVAILABLE_STUDIES = [
  { id: 'RSI@tv-basicstudies', label: 'RSI' },
  { id: 'MACD@tv-basicstudies', label: 'MACD' },
  { id: 'BB@tv-basicstudies', label: 'Bollinger Bands' },
  { id: 'MASimple@tv-basicstudies', label: 'MA (Simple)' },
  { id: 'MAExp@tv-basicstudies', label: 'MA (Exponential)' },
];

const ChartPlayground = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();

  const [pendingInterval, setPendingInterval] = useState<'1' | '5' | '15' | '30' | '60' | '120' | '240' | 'D' | 'W' | 'M'>('D');
  const [pendingStudies, setPendingStudies] = useState<string[]>(['RSI@tv-basicstudies']);
  const [pendingTopToolbar, setPendingTopToolbar] = useState(true);
  const [pendingSideToolbar, setPendingSideToolbar] = useState(true);

  const [appliedInterval, setAppliedInterval] = useState<typeof pendingInterval>('D');
  const [appliedStudies, setAppliedStudies] = useState<string[]>(['RSI@tv-basicstudies']);
  const [appliedTopToolbar, setAppliedTopToolbar] = useState(true);
  const [appliedSideToolbar, setAppliedSideToolbar] = useState(true);

  const studiesArray = useMemo(() => appliedStudies, [appliedStudies]);
  const safeSymbol = decodeURIComponent(symbol || 'AMEX:SPY');

  const toggleStudyPending = (id: string) => {
    setPendingStudies((prev) => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const applyChanges = () => {
    setAppliedInterval(pendingInterval);
    setAppliedStudies(pendingStudies);
    setAppliedTopToolbar(pendingTopToolbar);
    setAppliedSideToolbar(pendingSideToolbar);
  };

  const resetChanges = () => {
    setPendingInterval(appliedInterval);
    setPendingStudies(appliedStudies);
    setPendingTopToolbar(appliedTopToolbar);
    setPendingSideToolbar(appliedSideToolbar);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container-responsive py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">Chart Playground</h1>
            <p className="text-sm text-muted-foreground">Advanced charting tools for {safeSymbol}</p>
          </div>
        </div>

        <Card className="card-glass shadow-xl border-0">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-finance-primary to-finance-accent rounded-lg flex items-center justify-center">
                  <LineChart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">Advanced Charting</span>
                  <div className="text-sm text-muted-foreground font-normal">Professional tools for technical analysis</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{safeSymbol}</div>
                <div className="text-xs text-muted-foreground">Real-time data</div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Controls */}
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center pb-4 border-b border-border/50">
                  <h3 className="font-semibold text-foreground mb-1">Chart Controls</h3>
                  <p className="text-xs text-muted-foreground">Customize your analysis</p>
                </div>
                
                <div className="space-y-4">
                  {/* Interval Control */}
                  <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                    <div className="text-sm font-medium mb-2 flex items-center text-foreground">
                      <LineChart className="h-4 w-4 mr-2 text-finance-primary" /> 
                      Interval
                    </div>
                    <Select value={pendingInterval} onValueChange={(v: any) => setPendingInterval(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1m</SelectItem>
                        <SelectItem value="5">5m</SelectItem>
                        <SelectItem value="15">15m</SelectItem>
                        <SelectItem value="60">1h</SelectItem>
                        <SelectItem value="D">1D</SelectItem>
                        <SelectItem value="W">1W</SelectItem>
                        <SelectItem value="M">1M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Indicators Control */}
                  <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                    <div className="text-sm font-medium mb-2 flex items-center text-foreground">
                      <Layers className="h-4 w-4 mr-2 text-finance-primary" /> 
                      Indicators
                    </div>
                    <div className="space-y-2">
                      {AVAILABLE_STUDIES.map((s) => (
                        <label key={s.id} className="flex items-center space-x-2 text-sm">
                          <Checkbox 
                            checked={pendingStudies.includes(s.id)} 
                            onCheckedChange={() => toggleStudyPending(s.id)} 
                          />
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Toolbars Control */}
                  <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                    <div className="text-sm font-medium mb-2 flex items-center text-foreground">
                      <Sun className="h-4 w-4 mr-2 text-finance-primary" /> 
                      Toolbars
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <Checkbox 
                          checked={pendingTopToolbar} 
                          onCheckedChange={() => setPendingTopToolbar(!pendingTopToolbar)} 
                        />
                        <span>Show Top Toolbar</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <Checkbox 
                          checked={pendingSideToolbar} 
                          onCheckedChange={() => setPendingSideToolbar(!pendingSideToolbar)} 
                        />
                        <span>Show Side Toolbar</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button size="sm" onClick={applyChanges} className="flex-1">
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetChanges} className="flex-1">
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - Chart */}
              <div className="lg:col-span-3">
                <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
                  <div className="p-2 bg-muted/20 border-b border-border/50">
                    <div className="text-xs text-muted-foreground text-center">
                      Interactive TradingView Chart • Use the left toolbar for drawing tools • Top toolbar for indicators and settings
                    </div>
                  </div>
                  <TradingViewChart
                    symbol={safeSymbol}
                    height={700}
                    interval={appliedInterval}
                    studies={studiesArray}
                    hideTopToolbar={!appliedTopToolbar}
                    hideSideToolbar={!appliedSideToolbar}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartPlayground; 