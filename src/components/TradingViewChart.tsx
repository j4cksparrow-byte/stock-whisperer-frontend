import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
  height?: number;
}

const TradingViewChart = ({ symbol, height = 300 }: TradingViewChartProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create the script element for TradingView Widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current && window.TradingView) {
        new window.TradingView.widget({
          width: '100%',
          height: height,
          symbol: `NASDAQ:${symbol}`,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: false,
          hide_side_toolbar: true,
          container_id: container.current.id,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [symbol, height]);

  return (
    <div 
      id={`tradingview_${symbol}`} 
      ref={container} 
      className="w-full rounded-lg shadow-lg overflow-hidden"
    />
  );
};

export default TradingViewChart; 