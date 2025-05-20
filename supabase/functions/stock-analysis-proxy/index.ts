
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, exchange } = await req.json();
    
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
          text: cachedData.analysis_text,
          symbol: symbol
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward to the new API endpoint
    const apiUrl = "https://raichen.app.n8n.cloud/webhook/stock-chart-analysis";
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, exchange }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    // Cache the result in Supabase
    await supabaseAdmin.from('stock_analysis_cache').insert({
      symbol: symbol,
      exchange: exchange,
      chart_url: data.url, // Keep storing this in case we need it later
      analysis_text: data.text,
    });

    // But return only text and symbol to the client
    return new Response(JSON.stringify({
      text: data.text,
      symbol: symbol
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error:", error.message);
    
    // Return mock data on error, without url
    return new Response(
      JSON.stringify({
        text: `# Mock Analysis\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. Please try again later.\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes`,
        symbol: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
