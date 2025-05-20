
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

    // Forward to the n8n webhook API
    const apiUrl = "https://raichen.app.n8n.cloud/webhook/stock-chart-analysis";
    
    console.log(`Fetching from ${apiUrl} for symbol ${symbol}, exchange ${exchange}`);
    
    try {
      // Set up fetch with increased timeout and detailed logging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "StockAnalysisApp/1.0"
        },
        body: JSON.stringify({ symbol, exchange }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log(`API responded with status: ${apiResponse.status}`);
      
      if (!apiResponse.ok) {
        // Try to read the error response
        let errorText = "Unknown error";
        try {
          errorText = await apiResponse.text();
        } catch (e) {
          console.error("Couldn't read error response:", e);
        }
        
        console.error(`API error (${apiResponse.status}): ${errorText}`);
        throw new Error(`API responded with status: ${apiResponse.status}. Details: ${errorText}`);
      }

      let responseText;
      try {
        responseText = await apiResponse.text();
        console.log("Raw API response:", responseText.substring(0, 200) + "...");
      } catch (textError) {
        console.error("Failed to get response text:", textError);
        throw new Error("Failed to read API response");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        throw new Error("Invalid JSON response from API: " + responseText.substring(0, 100));
      }
      
      if (!data || !data.text) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from API");
      }
      
      // Cache the result in Supabase
      await supabaseAdmin.from('stock_analysis_cache').insert({
        symbol: symbol,
        exchange: exchange,
        analysis_text: data.text,
      });

      return new Response(
        JSON.stringify({
          text: data.text,
          symbol: symbol
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (apiError) {
      console.error("API Error:", apiError.message);
      throw apiError; // Rethrow to be caught by outer try/catch
    }
  } catch (error) {
    console.error("Error:", error.message);
    
    // Return mock data on error with more informative message
    return new Response(
      JSON.stringify({
        text: `# Mock Analysis\n\n## Due to API Connection Issues\n\nWe're currently experiencing difficulties connecting to our analysis service. Please try again later.\n\n### Technical Details\n\nError: ${error.message}\n\n### What You Can Do\n\n- Try refreshing the page\n- Check your internet connection\n- Try again in a few minutes`,
        symbol: "error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
