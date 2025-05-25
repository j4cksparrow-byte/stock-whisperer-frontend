
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  summary: string;
}

export const fetchFinanceNews = async (symbol: string): Promise<NewsItem[]> => {
  try {
    console.log(`Fetching news for symbol: ${symbol}`);
    
    // Using a free RSS to JSON converter API for Yahoo Finance news
    const rssUrl = `https://finance.yahoo.com/rss/headline?s=${symbol}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    console.log(`Making request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Error fetching news data from RSS service');
    }
    
    // Check if items exist and is an array
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('No news items found in response');
      return [];
    }
    
    const newsItems = data.items.map((item: any) => ({
      title: item.title || 'No title available',
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      source: item.source || 'Yahoo Finance',
      summary: item.description?.replace(/<[^>]*>?/gm, '') || 'No summary available' // Strip HTML tags from summary
    }));
    
    console.log(`Successfully fetched ${newsItems.length} news items`);
    return newsItems;
    
  } catch (error) {
    console.error('Error fetching finance news:', error);
    
    // Return mock news data as fallback
    const mockNews: NewsItem[] = [
      {
        title: `${symbol} Stock Analysis - Market Update`,
        link: '#',
        pubDate: new Date().toISOString(),
        source: 'Mock Finance News',
        summary: `Latest market analysis and trends for ${symbol}. Stay informed about stock performance and market movements.`
      },
      {
        title: 'Market Outlook and Investment Strategies',
        link: '#',
        pubDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        source: 'Mock Finance News',
        summary: 'Expert insights on current market conditions and recommended investment approaches for retail investors.'
      },
      {
        title: 'Financial Markets Daily Roundup',
        link: '#',
        pubDate: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        source: 'Mock Finance News',
        summary: 'Daily summary of major market movements, sector performance, and key economic indicators.'
      }
    ];
    
    console.log('Returning mock news data due to API failure');
    return mockNews;
  }
};
