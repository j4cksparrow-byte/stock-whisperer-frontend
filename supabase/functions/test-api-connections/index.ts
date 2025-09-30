import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = await Promise.allSettled([
      testAlphaVantage(),
      testGemini(),
      testTwelveData(),
      testPolygon(),
      testFinnhub(),
      testFMP(),
    ]);

    const [alphaVantage, gemini, twelveData, polygon, finnhub, fmp] = results;

    const response = {
      timestamp: new Date().toISOString(),
      apis: {
        alphaVantage: getResult(alphaVantage),
        gemini: getResult(gemini),
        twelveData: getResult(twelveData),
        polygon: getResult(polygon),
        finnhub: getResult(finnhub),
        fmp: getResult(fmp),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error testing API connections:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getResult(result: PromiseSettledResult<any>) {
  if (result.status === 'fulfilled') {
    return result.value;
  } else {
    return {
      status: 'error',
      configured: false,
      connected: false,
      error: result.reason?.message || 'Connection failed',
    };
  }
}

async function testAlphaVantage() {
  const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  
  if (!apiKey) {
    return {
      name: 'Alpha Vantage',
      status: 'not_configured',
      configured: false,
      connected: false,
      message: 'API key not configured',
    };
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=IBM&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    const data = await response.json();
    
    if (data['Error Message']) {
      return {
        name: 'Alpha Vantage',
        status: 'error',
        configured: true,
        connected: false,
        message: 'Invalid API key or rate limit exceeded',
      };
    }

    return {
      name: 'Alpha Vantage',
      status: 'connected',
      configured: true,
      connected: true,
      message: 'Successfully connected',
    };
  } catch (error) {
    return {
      name: 'Alpha Vantage',
      status: 'error',
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function testGemini() {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!apiKey) {
    return {
      name: 'Google Gemini',
      status: 'not_configured',
      configured: false,
      connected: false,
      message: 'API key not configured',
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }]
        }),
        signal: AbortSignal.timeout(5000)
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return {
        name: 'Google Gemini',
        status: 'error',
        configured: true,
        connected: false,
        message: data.error.message || 'Invalid API key',
      };
    }

    return {
      name: 'Google Gemini',
      status: 'connected',
      configured: true,
      connected: true,
      message: 'Successfully connected',
    };
  } catch (error) {
    return {
      name: 'Google Gemini',
      status: 'error',
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function testTwelveData() {
  const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
  
  if (!apiKey) {
    return {
      name: 'Twelve Data',
      status: 'not_configured',
      configured: false,
      connected: false,
      message: 'API key not configured',
    };
  }

  try {
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=1&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    const data = await response.json();
    
    if (data.status === 'error') {
      return {
        name: 'Twelve Data',
        status: 'error',
        configured: true,
        connected: false,
        message: data.message || 'Invalid API key',
      };
    }

    return {
      name: 'Twelve Data',
      status: 'connected',
      configured: true,
      connected: true,
      message: 'Successfully connected',
    };
  } catch (error) {
    return {
      name: 'Twelve Data',
      status: 'error',
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function testPolygon() {
  const apiKey = Deno.env.get('POLYGON_API_KEY');
  
  if (!apiKey) {
    return {
      name: 'Polygon.io',
      status: 'not_configured',
      configured: false,
      connected: false,
      message: 'API key not configured',
    };
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02?apiKey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    const data = await response.json();
    
    if (data.status === 'ERROR') {
      return {
        name: 'Polygon.io',
        status: 'error',
        configured: true,
        connected: false,
        message: data.error || 'Invalid API key',
      };
    }

    return {
      name: 'Polygon.io',
      status: 'connected',
      configured: true,
      connected: true,
      message: 'Successfully connected',
    };
  } catch (error) {
    return {
      name: 'Polygon.io',
      status: 'error',
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function testFinnhub() {
  const apiKey = Deno.env.get('FINNHUB_API_KEY');
  
  if (!apiKey) {
    return {
      name: 'Finnhub',
      status: 'not_configured',
      configured: false,
      connected: false,
      message: 'API key not configured',
    };
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    const data = await response.json();
    
    if (data.error) {
      return {
        name: 'Finnhub',
        status: 'error',
        configured: true,
        connected: false,
        message: 'Invalid API key',
      };
    }

    return {
      name: 'Finnhub',
      status: 'connected',
      configured: true,
      connected: true,
      message: 'Successfully connected',
    };
  } catch (error) {
    return {
      name: 'Finnhub',
      status: 'error',
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function testFMP() {
  const apiKey = Deno.env.get('FMP_API_KEY');
  
  if (!apiKey) {
    return {
      name: 'Financial Modeling Prep',
      status: 'not_configured',
      configured: false,
      connected: false,
      message: 'API key not configured',
    };
  }

  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    const data = await response.json();
    
    if (data.Error) {
      return {
        name: 'Financial Modeling Prep',
        status: 'error',
        configured: true,
        connected: false,
        message: 'Invalid API key',
      };
    }

    return {
      name: 'Financial Modeling Prep',
      status: 'connected',
      configured: true,
      connected: true,
      message: 'Successfully connected',
    };
  } catch (error) {
    return {
      name: 'Financial Modeling Prep',
      status: 'error',
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
