import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

type Props = {
  onChange?: (indicators: string[]) => void;
  initialIndicators?: string[];
  maxSelection?: number;
};

// Common technical indicators with descriptions
const AVAILABLE_INDICATORS = [
  { id: 'RSI', name: 'RSI (Relative Strength Index)', description: 'Momentum oscillator measuring speed and magnitude of price changes' },
  { id: 'MACD', name: 'MACD', description: 'Trend-following momentum indicator showing relationship between two moving averages' },
  { id: 'SMA', name: 'Simple Moving Average', description: 'Average price over a specific time period' },
  { id: 'EMA', name: 'Exponential Moving Average', description: 'Weighted moving average giving more importance to recent prices' },
  { id: 'BB', name: 'Bollinger Bands', description: 'Volatility bands placed above and below a moving average' },
  { id: 'STOCH', name: 'Stochastic Oscillator', description: 'Momentum indicator comparing closing price to price range' },
  { id: 'ADX', name: 'ADX (Average Directional Index)', description: 'Measures strength of a trend' },
  { id: 'ATR', name: 'ATR (Average True Range)', description: 'Market volatility indicator' },
  { id: 'OBV', name: 'On-Balance Volume', description: 'Relates volume to price change' },
  { id: 'CCI', name: 'Commodity Channel Index', description: 'Identifies cyclical trends' },
];

export default function ProIndicatorsSelector({ onChange, initialIndicators = [], maxSelection = 5 }: Props) {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(initialIndicators);

  useEffect(() => {
    onChange?.(selectedIndicators);
  }, [selectedIndicators, onChange]);

  const toggleIndicator = (id: string) => {
    setSelectedIndicators(prev => {
      if (prev.includes(id)) {
        // Remove if already selected
        return prev.filter(i => i !== id);
      } else if (prev.length < maxSelection) {
        // Add if under limit
        return [...prev, id];
      }
      return prev; // Can't add more if at max
    });
  };

  const resetToDefaults = () => {
    setSelectedIndicators(['RSI', 'MACD', 'SMA', 'BB', 'STOCH']);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">Available Indicators</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Select which indicators to calculate and customize their parameters.
          </div>
        </div>
        <button
          onClick={resetToDefaults}
          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Reset to default
        </button>
      </div>

      {/* Selection count */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {selectedIndicators.length} of {maxSelection} indicators selected
      </div>

      {/* Indicators grid */}
      <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
        {AVAILABLE_INDICATORS.map(indicator => {
          const isSelected = selectedIndicators.includes(indicator.id);
          const canSelect = selectedIndicators.length < maxSelection || isSelected;

          return (
            <button
              key={indicator.id}
              onClick={() => canSelect && toggleIndicator(indicator.id)}
              disabled={!canSelect}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }
                ${canSelect 
                  ? 'hover:border-primary hover:shadow-sm cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className={`
                  flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                  ${isSelected 
                    ? 'bg-primary border-primary' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Indicator info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {indicator.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {indicator.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Max selection warning */}
      {selectedIndicators.length >= maxSelection && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
          Maximum {maxSelection} indicators selected. Deselect one to choose another.
        </div>
      )}
    </div>
  );
}
