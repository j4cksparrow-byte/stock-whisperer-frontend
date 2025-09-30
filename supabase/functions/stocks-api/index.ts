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
      const searchResults = await searchSymbols(query);
      return new Response(JSON.stringify(searchResults), {
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
      const indicators = getAvailableIndicators();
      return new Response(JSON.stringify(indicators), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Default weights endpoint
    if (path === '/weights/defaults') {
      const weights = getDefaultWeights();
      return new Response(JSON.stringify(weights), {
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
    return [];
  }

  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.bestMatches) {
      return data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Search error:", error);
    return getFallbackSearchResults(query);
  }
}

async function getTrending(category: string) {
  const ALPHA_VANTAGE_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY");
  
  try {
    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (category === 'gainers' && data.top_gainers) {
      return data.top_gainers.slice(0, 10);
    } else if (category === 'losers' && data.top_losers) {
      return data.top_losers.slice(0, 10);
    } else if (category === 'active' && data.most_actively_traded) {
      return data.most_actively_traded.slice(0, 10);
    }
    
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
  const mockData = [
    { ticker: "AAPL", price: "178.50", change_amount: "2.50", change_percentage: "1.42%", volume: "52341234" },
    { ticker: "MSFT", price: "378.25", change_amount: "5.75", change_percentage: "1.54%", volume: "28934567" },
    { ticker: "GOOGL", price: "142.80", change_amount: "1.90", change_percentage: "1.35%", volume: "31245678" }
  ];
  
  return mockData;
}
