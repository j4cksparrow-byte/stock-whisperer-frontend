
import React, { useState, useEffect } from 'react';
import { fetchFinanceNews, NewsItem } from '@/services/yahooFinanceService';
import NewsCard from './NewsCard';
import { Loader, Newspaper, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NewsFeedProps {
  symbol?: string;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ symbol = 'AAPL' }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const { toast } = useToast();

  const loadNews = async (tickerSymbol: string) => {
    if (!tickerSymbol) return;
    
    setLoading(true);
    setError(null);
    setIsMockData(false);
    
    try {
      console.log(`Loading news for: ${tickerSymbol}`);
      const newsData = await fetchFinanceNews(tickerSymbol);
      
      // Check if we got mock data (indicated by Mock Finance News source)
      const hasMockData = newsData.some(item => item.source === 'Mock Finance News');
      
      if (hasMockData) {
        setIsMockData(true);
        toast({
          title: "Using Sample News",
          description: "Live news feed is temporarily unavailable. Showing sample content.",
          variant: "default"
        });
      }
      
      setNews(newsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(errorMessage);
      setNews([]); // Clear any existing news
      
      toast({
        title: "Error loading news",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(symbol);
  }, [symbol]);

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-200">Latest Finance News</h2>
        {symbol && <span className="text-lg text-cyan-300 font-semibold ml-2">for {symbol}</span>}
      </div>

      {/* Mock data notice */}
      {isMockData && (
        <Alert className="mb-6 bg-amber-900/30 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            Live news feed is temporarily unavailable. Showing sample news content.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-10 h-10 text-blue-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading latest news...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-400">Unable to load news: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length > 0 ? (
            news.map((item, index) => (
              <NewsCard key={`${item.title}-${index}`} news={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400">No news available for {symbol}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
