
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, origin",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const { symbol, exchange } = await req.json();
    
    if (!symbol || !exchange) {
      return new Response(
        JSON.stringify({ error: "Symbol and exchange are required" }),
        { 
          status: 400, 
          headers: corsHeaders
        }
      );
    }

    console.log('Processing request for:', { symbol, exchange });

    // Create Supabase client with proper configuration
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
      .maybeSingle();

    if (cachedData) {
      console.log("Serving cached analysis for", symbol);
      return new Response(
        JSON.stringify({
          url: cachedData.chart_url,
          text: cachedData.analysis_text,
          symbol: symbol
        }),
        { headers: corsHeaders }
      );
    }

    // Forward to actual API with enhanced error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 second timeout

    try {
      const apiUrl = "https://raichen.app.n8n.cloud/webhook/stock-chart-analysis";
      console.log(`Calling external API for ${symbol}:${exchange}`);
      
      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "Supabase-Edge-Function/1.0"
        },
        body: JSON.stringify({ symbol, exchange }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!apiResponse.ok) {
        console.error(`External API responded with status: ${apiResponse.status}`);
        const errorText = await apiResponse.text();
        console.error('External API error details:', errorText);
        throw new Error(`External API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      console.log("External API response received successfully for", symbol);
      
      // Cache the result in Supabase
      try {
        await supabaseAdmin.from('stock_analysis_cache').insert({
          symbol: symbol,
          exchange: exchange,
          chart_url: data.url || "",
          analysis_text: data.text || "",
        });
        console.log("Result cached successfully for", symbol);
      } catch (cacheError) {
        console.error("Failed to cache result:", cacheError);
        // Continue without caching - don't fail the request
      }

      return new Response(JSON.stringify(data), { headers: corsHeaders });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("External API fetch error:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in stock-analysis-proxy:", error);
    
    // Return mock data on error with proper CORS headers
    const mockData = {
      url: "https://placeholder-chart.com/error",
      text: `# Mock Analysis\n\n## API Service Temporarily Unavailable\n\nWe're currently experiencing technical difficulties with our analysis service. This could be due to:\n\n- External API connectivity issues\n- SSL certificate problems\n- Service maintenance\n\n### What You Can Do\n\n- Try refreshing the page\n- Check back in a few minutes\n- Contact support if the issue persists\n\nThis is mock data provided for demonstration purposes.`,
      symbol: symbol || "UNKNOWN"
    };
    
    return new Response(
      JSON.stringify(mockData),
      { 
        headers: corsHeaders,
        status: 200 
      }
    );
  }
});
