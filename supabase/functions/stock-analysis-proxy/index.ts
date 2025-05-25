
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, user-agent, origin, x-requested-with, accept",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log(`Processing ${req.method} request from origin: ${req.headers.get('origin')}`);
    
    // Parse request body
    let symbol, exchange;
    try {
      const body = await req.json();
      symbol = body.symbol;
      exchange = body.exchange;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing request for symbol: ${symbol}, exchange: ${exchange}`);
    
    if (!symbol || !exchange) {
      return new Response(
        JSON.stringify({ error: "Symbol and exchange are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the project URL and service_role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return provideMockResponse(symbol, "Missing database configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Check if we have a cached result (less than 1 hour old)
    const { data: cachedData, error: cacheError } = await supabaseAdmin
      .from('stock_analysis_cache')
      .select('*')
      .eq('symbol', symbol)
      .eq('exchange', exchange)
      .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cacheError) {
      console.warn("Cache lookup failed:", cacheError);
    }

    if (cachedData) {
      console.log("Serving cached analysis for", symbol);
      return new Response(
        JSON.stringify({
          url: cachedData.chart_url,
          text: cachedData.analysis_text,
          symbol: symbol
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Make the API call with improved error handling
    const apiUrl = "https://raichen.app.n8n.cloud/webhook/stock-chart-analysis";
    console.log(`Making API call to: ${apiUrl} for ${symbol}:${exchange}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    let apiResponse;
    try {
      apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Supabase-Edge-Function/1.0"
        },
        body: JSON.stringify({ symbol, exchange }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Fetch error:", fetchError);
      return provideMockResponse(symbol, `Network error: ${fetchError.message}`);
    }

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      console.error(`API responded with status: ${apiResponse.status}`);
      return provideMockResponse(symbol, `API error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log(`Successfully received data for ${symbol}`);
    
    // Cache the result in Supabase
    try {
      const { error: insertError } = await supabaseAdmin.from('stock_analysis_cache').insert({
        symbol: symbol,
        exchange: exchange,
        chart_url: data.url,
        analysis_text: data.text,
      });
      
      if (insertError) {
        console.warn("Failed to cache result:", insertError);
      } else {
        console.log(`Cached analysis for ${symbol}`);
      }
    } catch (cacheError) {
      console.warn("Cache insert failed:", cacheError);
      // Continue even if caching fails
    }

    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error in edge function:", error);
    return provideMockResponse("unknown", `Unexpected error: ${error.message}`);
  }
});

function provideMockResponse(symbol: string, errorDetails: string) {
  const mockResponse = {
    url: "https://placeholder-chart.com/error",
    text: `# Mock Analysis for ${symbol}\n\n## API Connection Issue\n\nError: ${errorDetails}\n\nWe're experiencing difficulties connecting to our analysis service. Please try again later.\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes\n\n### Technical Details\n\nThe issue appears to be with our external API connectivity. Our team is working to resolve this.`,
    symbol: symbol
  };
  
  return new Response(
    JSON.stringify(mockResponse),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 
    }
  );
}
