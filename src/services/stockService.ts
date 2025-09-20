

export type StockAnalysisResponse = {
  url: string;
  text: string;
  symbol: string;
};

// Function to clean the analysis text by replacing <br> tags with newlines
const cleanAnalysisText = (text: string): string => {
  return text.replace(/<br\s*\/?>/gi, '\n');
};

// Supabase configuration
const SUPABASE_URL = 'https://egiiqbgumgltatfljbcs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaWlxYmd1bWdsdGF0ZmxqYmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzg2NjUsImV4cCI6MjA2MjgxNDY2NX0.ECaOGNSTRN5kWE4BImOPlfBemrmofzLR_wVFzH71j9o';

// Updated API configuration to use Supabase edge functions
const STOCK_DATA_SERVICE = `${SUPABASE_URL}/functions/v1/stock-data-service`;
const GEMINI_INSIGHTS_SERVICE = `${SUPABASE_URL}/functions/v1/gemini-insights-service`;

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchStockAnalysis = async (symbol: string, exchange: string): Promise<StockAnalysisResponse> => {
  const sanitizedSymbol = symbol.trim().replace(/[^\w.-]/g, '');
  const sanitizedExchange = exchange.trim().replace(/[^\w.-]/g, '');
  
  console.log('Fetching stock analysis for:', { symbol: sanitizedSymbol, exchange: sanitizedExchange });
  
  try {
    // Step 1: Get basic stock data
    console.log('Fetching stock data from Alpha Vantage...');
    const stockDataResponse = await fetch(STOCK_DATA_SERVICE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        symbol: sanitizedSymbol,
        exchange: sanitizedExchange
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!stockDataResponse.ok) {
      throw new Error(`Stock data service failed: ${stockDataResponse.status}`);
    }

    const stockData = await stockDataResponse.json();
    console.log('Stock data received:', stockData);
    
    // Step 2: Get AI insights from Gemini
    console.log('Getting AI insights from Gemini...');
    const insightsResponse = await fetch(GEMINI_INSIGHTS_SERVICE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        symbol: sanitizedSymbol,
        exchange: sanitizedExchange,
        stockData: stockData
      }),
      signal: AbortSignal.timeout(45000)
    });

    if (!insightsResponse.ok) {
      throw new Error(`Gemini insights service failed: ${insightsResponse.status}`);
    }

    const insights = await insightsResponse.json();
    console.log('Gemini insights received:', insights);
    
    return {
      url: `https://tradingview.com/symbols/${sanitizedExchange}-${sanitizedSymbol}/`,
      text: cleanAnalysisText(insights.analysis || insights.text || ''),
      symbol: sanitizedSymbol
    };
    
  } catch (error) {
    console.error('Error fetching stock analysis:', error);
    
    // Fallback: Try to get just Alpha Vantage data without Gemini
    try {
      console.log('Attempting fallback with Alpha Vantage only...');
      const fallbackResponse = await fetch(STOCK_DATA_SERVICE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          symbol: sanitizedSymbol,
          exchange: sanitizedExchange
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback data received:', fallbackData);
        
        return {
          url: `https://tradingview.com/symbols/${sanitizedExchange}-${sanitizedSymbol}/`,
          text: generateBasicAnalysis(fallbackData, sanitizedSymbol),
          symbol: sanitizedSymbol
        };
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    // Final fallback: Mock analysis
    return provideMockAnalysis(sanitizedSymbol, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Generate basic analysis from Alpha Vantage data when Gemini is unavailable
const generateBasicAnalysis = (stockData: any, symbol: string): string => {
  if (!stockData || (!stockData.overview && !stockData.news)) {
    return `# Basic Analysis for ${symbol}\n\n## Data Unavailable\n\nUnable to retrieve comprehensive data for analysis.`;
  }

  let analysis = `# Stock Analysis for ${symbol}\n\n`;
  
  if (stockData.overview) {
    const overview = stockData.overview;
    analysis += `## Company Overview\n\n`;
    analysis += `**${overview.Name || symbol}** (${overview.Exchange || 'N/A'})\n\n`;
    
    if (overview.Description) {
      analysis += `${overview.Description.slice(0, 300)}...\n\n`;
    }
    
    analysis += `### Key Metrics\n\n`;
    if (overview.MarketCapitalization) {
      const marketCap = (parseFloat(overview.MarketCapitalization) / 1000000000).toFixed(1);
      analysis += `- **Market Cap**: $${marketCap}B\n`;
    }
    if (overview.PERatio) analysis += `- **P/E Ratio**: ${overview.PERatio}\n`;
    if (overview.DividendYield) analysis += `- **Dividend Yield**: ${(parseFloat(overview.DividendYield) * 100).toFixed(2)}%\n`;
    if (overview.Beta) analysis += `- **Beta**: ${overview.Beta}\n`;
    
    analysis += `\n`;
  }
  
  if (stockData.news && stockData.news.feed && stockData.news.feed.length > 0) {
    analysis += `## Recent News Sentiment\n\n`;
    const recentNews = stockData.news.feed.slice(0, 3);
    
    recentNews.forEach((article: any, index: number) => {
      analysis += `${index + 1}. **${article.title}**\n`;
      if (article.summary) {
        analysis += `   ${article.summary.slice(0, 150)}...\n`;
      }
      analysis += `\n`;
    });
  }
  
  analysis += `\n*This is a basic analysis. Full AI-powered insights are temporarily unavailable.*`;
  
  return analysis;
};

// Provide mock analysis data for better user experience when APIs fail
const provideMockAnalysis = (symbol: string, reason: string): StockAnalysisResponse => {
  console.log('Providing mock analysis for symbol:', symbol, 'Reason:', reason);
  
  return {
    url: "https://placeholder-chart.com/error",
    text: `# Technical Analysis for ${symbol}\n\n## Service Temporarily Unavailable\n\nWe're currently experiencing issues with our analysis service.\n\n**Issue**: ${reason}\n\n### What's Happening\n\n- Our external analysis API is not responding\n- This could be due to high traffic or temporary maintenance\n- We're working to resolve this issue\n\n### What You Can Do\n\n1. **Try again in a few minutes** - The service may come back online\n2. **Check another stock** - The issue might be symbol-specific\n3. **Use the live chart above** - You can still view real-time price data\n4. **Contact support** if the issue persists\n\n### Alternative Analysis\n\nWhile our automated analysis is unavailable, you can:\n- Review the live TradingView chart above\n- Check recent news and market trends\n- Look at volume and price patterns\n- Consider fundamental analysis factors\n\n*This is a temporary fallback message. Our full analysis service will return shortly.*`,
    symbol: symbol
  };
};
