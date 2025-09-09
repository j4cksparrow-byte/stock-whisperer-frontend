
import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  exchange?: string;
  height?: number;
  width?: number;
  interval?: string;
  studies?: string[];
  hideTopToolbar?: boolean;
  hideSideToolbar?: boolean;
  withDateRanges?: boolean;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  exchange = 'NASDAQ',
  height = 300,
  width,
  interval = 'D',
  studies = ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
  hideTopToolbar = false,
  hideSideToolbar = false,
  withDateRanges = true,
  className = ''
}) => {
  const container = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Create the script element for TradingView Widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current && window.TradingView) {
        // Format the symbol correctly with exchange
        const formattedSymbol = symbol.includes(':') ? symbol : `${exchange}:${symbol}`;
        
        console.log('TradingView Widget initializing with symbol:', formattedSymbol);
        
        new window.TradingView.widget({
          width: width || '100%',
          height: height,
          symbol: formattedSymbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: resolvedTheme,
          style: '1',
          locale: 'en',
          toolbar_bg: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current.id,
          hide_top_toolbar: hideTopToolbar,
          hide_side_toolbar: hideSideToolbar,
          withdateranges: withDateRanges,
          studies: studies,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, exchange, height, width, interval, studies, hideTopToolbar, hideSideToolbar, withDateRanges, resolvedTheme]);

  return (
    <div 
      id={`tradingview_${symbol.replace(/[^\w]/g, '_')}`} 
      ref={container} 
      className={`w-full rounded-lg overflow-hidden ${className}`}
      style={{ height: `${height}px` }} 
    />
  );
};

export default TradingViewChart;
