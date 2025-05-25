
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, user-agent, origin",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, exchange } = await req.json();
    
    console.log(`Processing request for symbol: ${symbol}, exchange: ${exchange}`);
    
    if (!symbol || !exchange) {
      return new Response(
        JSON.stringify({ error: "Symbol and exchange are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the project URL and service_role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Check if we have a cached result (less than 1 hour old)
    const { data: cachedData } = await supabaseAdmin
      .from('stock_analysis_cache')
      .select('*')
      .eq('symbol', symbol)
      .eq('exchange', exchange)
      .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

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
    
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Supabase-Edge-Function/1.0"
      },
      body: JSON.stringify({ symbol, exchange }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      console.error(`API responded with status: ${apiResponse.status}`);
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log(`Successfully received data for ${symbol}`);
    
    // Cache the result in Supabase
    try {
      await supabaseAdmin.from('stock_analysis_cache').insert({
        symbol: symbol,
        exchange: exchange,
        chart_url: data.url,
        analysis_text: data.text,
      });
      console.log(`Cached analysis for ${symbol}`);
    } catch (cacheError) {
      console.warn("Failed to cache result:", cacheError);
      // Continue even if caching fails
    }

    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error in edge function:", error.message);
    
    // Return mock data on error with more specific error info
    const mockResponse = {
      url: "https://placeholder-chart.com/error",
      text: `# Mock Analysis\n\n## API Connection Issue\n\nError: ${error.message}\n\nWe're experiencing difficulties connecting to our analysis service. Please try again later.\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes`,
      symbol: "error"
    };
    
    return new Response(
      JSON.stringify(mockResponse),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  }
});
