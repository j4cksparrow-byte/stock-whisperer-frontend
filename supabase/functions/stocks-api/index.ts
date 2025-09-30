import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/stocks-api', '');
    
    // Search endpoint
    if (path === '/search') {
      const query = url.searchParams.get('query') || '';
      console.log(`🔍 [STOCKS-API] Search request for: "${query}"`);
      const searchResults = await searchSymbols(query);
      console.log(`📊 [STOCKS-API] Search returned ${searchResults.length} results`);
      
      // Return in the expected format: { status: 'ok', results: [...] }
      return new Response(JSON.stringify({ 
        status: 'ok', 
        results: searchResults 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Trending endpoint
    if (path === '/trending') {
      const category = url.searchParams.get('category') || 'gainers';
      const trendingData = await getTrending(category);
      return new Response(JSON.stringify(trendingData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Indicators endpoint
    if (path === '/indicators') {
      console.log(`📊 [STOCKS-API] Fetching indicators`);
      const indicators = getAvailableIndicators();
      return new Response(JSON.stringify({ status: 'ok', ...indicators }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Default weights endpoint
    if (path === '/weights/defaults') {
      console.log(`⚖️ [STOCKS-API] Fetching default weights`);
      const weights = getDefaultWeights();
      return new Response(JSON.stringify({ status: 'ok', defaultWeights: weights }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in stocks-api:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function searchSymbols(query: string) {
  const ALPHA_VANTAGE_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY");
  
  if (!query || query.length < 1) {
    console.log(`⚠️ [SEARCH] Empty query provided`);
    return [];
  }

  console.log(`🔎 [SEARCH] Searching for: "${query}"`);

  try {
    if (!ALPHA_VANTAGE_KEY) {
      console.warn(`⚠️ [SEARCH] Alpha Vantage API key not configured, using fallback`);
      return getFallbackSearchResults(query);
    }

    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_KEY}`;
    console.log(`📡 [SEARCH] Calling Alpha Vantage...`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📊 [SEARCH] Alpha Vantage response:`, JSON.stringify(data).substring(0, 200));
    
    if (data.bestMatches && Array.isArray(data.bestMatches) && data.bestMatches.length > 0) {
      const results = data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));
      console.log(`✅ [SEARCH] Found ${results.length} results from Alpha Vantage`);
      return results;
    }
    
    console.log(`⚠️ [SEARCH] No matches from Alpha Vantage, using fallback`);
    return getFallbackSearchResults(query);
  } catch (error) {
    console.error("❌ [SEARCH] Error:", error);
    return getFallbackSearchResults(query);
  }
}

async function getTrending(category: string) {
  const ALPHA_VANTAGE_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY");
  
  console.log(`Fetching trending stocks for category: ${category}`);
  
  try {
    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`;
    console.log(`Calling Alpha Vantage API: ${url.replace(ALPHA_VANTAGE_KEY || '', 'REDACTED')}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Alpha Vantage response:`, JSON.stringify(data).substring(0, 200));
    
    let rawData: any[] = [];
    
    // Map category names to Alpha Vantage response keys
    if (category === 'gainers' && data.top_gainers) {
      rawData = data.top_gainers.slice(0, 10);
    } else if (category === 'losers' && data.top_losers) {
      rawData = data.top_losers.slice(0, 10);
    } else if (category === 'mostActive' && data.most_actively_traded) {
      rawData = data.most_actively_traded.slice(0, 10);
    }
    
    if (rawData.length > 0) {
      // Transform Alpha Vantage format to our frontend format
      const trending = rawData.map((item: any) => ({
        symbol: item.ticker,
        name: item.ticker, // Alpha Vantage doesn't provide full names in this endpoint
        price: parseFloat(item.price),
        change: parseFloat(item.change_amount),
        changePercent: parseFloat(item.change_percentage?.replace('%', '') || '0'),
        volume: item.volume,
        exchange: 'US' // Default to US market
      }));
      
      console.log(`Returning ${trending.length} trending stocks`);
      return { status: 'ok', trending };
    }
    
    console.log('No data from Alpha Vantage, using fallback');
    return getFallbackTrending(category);
  } catch (error) {
    console.error("Trending error:", error);
    return getFallbackTrending(category);
  }
}

function getAvailableIndicators() {
  return {
    categories: {
      trend: ["SMA", "EMA", "MACD"],
      momentum: ["RSI", "Stochastic", "CCI"],
      volatility: ["Bollinger Bands", "ATR"],
      volume: ["OBV", "Volume SMA"]
    },
    defaultConfig: {
      sma: { period: 20 },
      ema: { period: 12 },
      rsi: { period: 14 },
      macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      bollingerBands: { period: 20, stdDev: 2 }
    }
  };
}

function getDefaultWeights() {
  return {
    fundamental: 35,
    technical: 40,
    sentiment: 25,
    examples: {
      conservative: { fundamental: 50, technical: 30, sentiment: 20 },
      balanced: { fundamental: 35, technical: 40, sentiment: 25 },
      aggressive: { fundamental: 20, technical: 50, sentiment: 30 }
    }
  };
}

function getFallbackSearchResults(query: string) {
  const popular = [
    { symbol: "AAPL", name: "Apple Inc.", type: "Equity", region: "United States", currency: "USD" },
    { symbol: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", currency: "USD" },
    { symbol: "GOOGL", name: "Alphabet Inc.", type: "Equity", region: "United States", currency: "USD" },
    { symbol: "AMZN", name: "Amazon.com Inc.", type: "Equity", region: "United States", currency: "USD" },
    { symbol: "TSLA", name: "Tesla Inc.", type: "Equity", region: "United States", currency: "USD" }
  ];
  
  const lowerQuery = query.toLowerCase();
  return popular.filter(s => 
    s.symbol.toLowerCase().includes(lowerQuery) || 
    s.name.toLowerCase().includes(lowerQuery)
  );
}

function getFallbackTrending(category: string) {
  console.log(`Using fallback data for category: ${category}`);
  
  const fallbackData: Record<string, any[]> = {
    gainers: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35, volume: '45.2M', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 5.67, changePercent: 1.52, volume: '28.7M', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 1.23, changePercent: 0.87, volume: '22.1M', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.02, change: 12.34, changePercent: 1.32, volume: '32.1M', exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.30, change: 8.45, changePercent: 1.77, volume: '15.3M', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.20, change: 2.89, changePercent: 1.90, volume: '18.9M', exchange: 'NASDAQ' },
    ],
    losers: [
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.21, changePercent: -1.27, volume: '38.5M', exchange: 'NASDAQ' },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 425.67, change: -5.43, changePercent: -1.26, volume: '12.8M', exchange: 'NASDAQ' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 98.45, change: -1.89, changePercent: -1.88, volume: '25.6M', exchange: 'NASDAQ' },
      { symbol: 'INTC', name: 'Intel Corporation', price: 42.18, change: -0.67, changePercent: -1.56, volume: '19.2M', exchange: 'NASDAQ' },
      { symbol: 'CRM', name: 'Salesforce Inc.', price: 198.34, change: -2.45, changePercent: -1.22, volume: '8.7M', exchange: 'NYSE' },
      { symbol: 'ADBE', name: 'Adobe Inc.', price: 445.78, change: -4.12, changePercent: -0.92, volume: '11.4M', exchange: 'NASDAQ' },
    ],
    mostActive: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35, volume: '45.2M', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.21, changePercent: -1.27, volume: '38.5M', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 950.02, change: 12.34, changePercent: 1.32, volume: '32.1M', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.85, change: 5.67, changePercent: 1.52, volume: '28.7M', exchange: 'NASDAQ' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 98.45, change: -1.89, changePercent: -1.88, volume: '25.6M', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: 1.23, changePercent: 0.87, volume: '22.1M', exchange: 'NASDAQ' },
    ]
  };
  
  return {
    status: 'ok',
    trending: fallbackData[category] || fallbackData.gainers
  };
}
