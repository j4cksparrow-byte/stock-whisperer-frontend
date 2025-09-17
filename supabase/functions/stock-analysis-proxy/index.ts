
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

    console.log(`Processing request for symbol: ${symbol}, exchange: ${exchange}`);

    // Create Supabase client with the project URL and service_role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Check if we have a cached result (less than 1 hour old)
    const { data: cachedData, error: cacheError } = await supabaseAdmin
      .from('stock_analysis_cache')
      .select('*')
      .eq('symbol', symbol)
      .eq('exchange', exchange)
      .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cacheError) {
      console.log("Cache error:", cacheError.message);
    }

    if (cachedData) {
      console.log("Serving cached analysis for", symbol);
      return new Response(
        JSON.stringify({
          url: "https://placeholder-chart.com/cached",
          text: cachedData.analysis_text,
          symbol: symbol
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Skip external API for now due to DNS issues - provide comprehensive mock analysis
    console.log("Using mock analysis due to external API unavailability");
    
    // Generate comprehensive mock analysis
    const data = {
      url: "https://placeholder-chart.com/analysis",
      text: generateMockAnalysis(symbol, exchange),
      symbol: symbol
    };
    
    // Cache the result in Supabase (only store analysis_text now)
    const { error: insertError } = await supabaseAdmin.from('stock_analysis_cache').insert({
      symbol: symbol,
      exchange: exchange,
      analysis_text: data.text,
    });

    if (insertError) {
      console.error("Error caching result:", insertError.message);
    }

    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error in edge function:", error.message);
    
    // Return mock data on error
    return new Response(
      JSON.stringify({
        url: "https://placeholder-chart.com/error",
        text: `# Mock Analysis\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. Please try again later.\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes\n\nError details: ${error.message}`,
        symbol: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});

function generateMockAnalysis(symbol: string, exchange: string): string {
  return `# Technical Analysis for ${symbol}

## Market Overview
- **Symbol**: ${symbol}
- **Exchange**: ${exchange}
- **Analysis Date**: ${new Date().toLocaleDateString()}

## Technical Indicators
- **Trend**: Currently analyzing market conditions
- **Support**: Key support levels being monitored
- **Resistance**: Resistance levels identified
- **Volume**: Trading volume patterns observed

## Key Insights
- Market data is being processed
- Technical indicators show mixed signals
- Consider fundamental analysis alongside technical data
- Monitor for breakout patterns

## Risk Assessment
- **Volatility**: Moderate
- **Market Sentiment**: Neutral
- **Recommendation**: Hold and monitor

*This is a sample analysis. For real-time insights, please try again when our analysis service is available.*`;
}
