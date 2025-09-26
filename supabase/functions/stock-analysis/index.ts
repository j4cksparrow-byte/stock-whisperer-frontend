import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
const geminiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log('Stock analysis request received:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.pathname.split('/').pop()?.toUpperCase();
    const timeframe = url.searchParams.get('timeframe') || '1M';
    const mode = url.searchParams.get('mode') || 'normal';
    const bypassCache = url.searchParams.get('bypassCache') === 'true';

    console.log('Analysis parameters:', { symbol, timeframe, mode, bypassCache });

    if (!symbol) {
      return new Response(JSON.stringify({ error: 'Symbol is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const { data: cachedResult } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('symbol', symbol)
        .eq('duration', timeframe)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cachedResult) {
        console.log('Returning cached result for', symbol);
        return new Response(JSON.stringify({
          status: 'ok',
          analysis: formatAnalysisResponse(cachedResult)
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch fresh analysis data
    console.log('Fetching fresh analysis data for', symbol);
    const analysisResult = await performStockAnalysis(symbol, timeframe);
    
    // Save to cache
    const { error: insertError } = await supabase
      .from('analysis_results')
      .upsert({
        symbol,
        exchange: 'NASDAQ', // Default, could be improved
        duration: timeframe,
        analysis_type: mode,
        ...analysisResult,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour cache
      });

    if (insertError) {
      console.error('Cache insert error:', insertError);
    }

    return new Response(JSON.stringify({
      status: 'ok',
      analysis: formatAnalysisResponse(analysisResult)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stock-analysis function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      analysis: getMockAnalysis() // Fallback to mock data
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performStockAnalysis(symbol: string, timeframe: string) {
  console.log('Performing analysis for', symbol);

  // For now, return mock data with realistic structure
  // In production, this would integrate with Alpha Vantage and Gemini APIs
  const mockAnalysis = {
    technical_score: Math.floor(Math.random() * 40) + 30, // 30-70
    fundamental_score: Math.floor(Math.random() * 40) + 30,
    sentiment_score: Math.floor(Math.random() * 40) + 30,
    aggregate_score: 0, // Will be calculated
    technical_weight: 0.35,
    fundamental_weight: 0.35,
    sentiment_weight: 0.30,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100
    recommendation: 'HOLD',
    risk_level: 'MEDIUM',
    current_price: Math.random() * 200 + 50,
    price_change: (Math.random() - 0.5) * 10,
    price_change_percent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    technical_indicators: {
      rsi: Math.random() * 100,
      macd: (Math.random() - 0.5) * 2,
      bollinger_upper: Math.random() * 200 + 100,
      bollinger_lower: Math.random() * 100 + 50,
      moving_average_20: Math.random() * 200 + 50,
      moving_average_50: Math.random() * 200 + 50,
    },
    key_factors: [
      "Strong technical momentum",
      "Positive earnings trend",
      "Market sector performing well"
    ],
    risks: [
      "Market volatility",
      "Economic uncertainty",
      "Sector-specific challenges"
    ],
    ai_summary: `Analysis for ${symbol} shows mixed signals. Technical indicators suggest ${Math.random() > 0.5 ? 'bullish' : 'bearish'} momentum with current price action showing ${Math.random() > 0.5 ? 'strength' : 'weakness'}. Fundamental metrics indicate ${Math.random() > 0.5 ? 'solid' : 'concerning'} underlying performance.`
  };

  // Calculate aggregate score
  mockAnalysis.aggregate_score = Math.round(
    mockAnalysis.technical_score * mockAnalysis.technical_weight +
    mockAnalysis.fundamental_score * mockAnalysis.fundamental_weight +
    mockAnalysis.sentiment_score * mockAnalysis.sentiment_weight
  );

  // Determine recommendation based on aggregate score
  if (mockAnalysis.aggregate_score >= 70) {
    mockAnalysis.recommendation = 'BUY';
  } else if (mockAnalysis.aggregate_score <= 40) {
    mockAnalysis.recommendation = 'SELL';
  } else {
    mockAnalysis.recommendation = 'HOLD';
  }

  return mockAnalysis;
}

function formatAnalysisResponse(data: any) {
  return {
    score: data.aggregate_score || 50,
    recommendation: data.recommendation || 'HOLD',
    technical: {
      score: data.technical_score || 50,
      recommendation: data.recommendation || 'HOLD',
      indicators: data.technical_indicators || {},
      configuration: { weight: `${Math.round((data.technical_weight || 0.35) * 100)}%` }
    },
    fundamental: {
      score: data.fundamental_score || 50,
      recommendation: data.recommendation || 'HOLD',
      indicators: data.fundamental_metrics || {},
    },
    sentiment: {
      score: data.sentiment_score || 50,
      recommendation: data.recommendation || 'HOLD',
      indicators: data.sentiment_data || {},
    },
    summary: data.ai_summary || `Analysis for the requested symbol shows mixed market conditions.`,
    confidence: data.confidence || 75,
    keyFactors: data.key_factors || [],
    risks: data.risks || [],
    price: {
      current: data.current_price || 100,
      change: data.price_change || 0,
      changePercent: data.price_change_percent || 0,
    },
    volume: data.volume || 1000000,
    timestamp: data.created_at || new Date().toISOString(),
  };
}

function getMockAnalysis() {
  return formatAnalysisResponse({
    aggregate_score: 55,
    technical_score: 60,
    fundamental_score: 50,
    sentiment_score: 55,
    recommendation: 'HOLD',
    confidence: 75,
    current_price: 150,
    price_change: 2.5,
    price_change_percent: 1.7,
    volume: 2500000,
    ai_summary: "Mock analysis data - API integration pending",
    key_factors: ["Technical analysis pending", "Fundamental data pending"],
    risks: ["Data integration in progress"],
    technical_indicators: { rsi: 55, macd: 0.1 }
  });
}