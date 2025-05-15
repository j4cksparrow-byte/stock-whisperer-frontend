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
    if (!symbol) return;

    // Create the script element for TradingView Widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current && window.TradingView) {
        try {
          new window.TradingView.widget({
            width: '100%',
            height: height,
            symbol: `${symbol}`,  // Remove NASDAQ: prefix
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',  // Changed to dark theme
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: false,
            hide_side_toolbar: true,
            container_id: container.current.id,
            autosize: true,
            studies: [],
            save_image: false,
            hideideas: true,
            withdateranges: true,
            hide_volume: false,
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            overrides: {
              "mainSeriesProperties.candleStyle.upColor": "#26a69a",
              "mainSeriesProperties.candleStyle.downColor": "#ef5350",
              "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
              "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
              "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
              "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
            }
          });
        } catch (error) {
          console.error('Error initializing TradingView widget:', error);
        }
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
      className="w-full rounded-lg shadow-lg overflow-hidden bg-gray-800"
    />
  );
};

export default TradingViewChart; 