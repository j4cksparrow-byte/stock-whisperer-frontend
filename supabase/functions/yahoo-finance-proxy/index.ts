import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');
    const range = url.searchParams.get('range') || '1y'; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    const interval = url.searchParams.get('interval') || '1d'; // 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching Yahoo Finance data for ${symbol} with range ${range} and interval ${interval}`);

    // Yahoo Finance v8 API (free alternative)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart?.error) {
      throw new Error(data.chart.error.description || 'Yahoo Finance API error');
    }

    const result = data.chart?.result?.[0];
    if (!result) {
      throw new Error('No data returned from Yahoo Finance');
    }

    // Extract the data we need
    const timestamps = result.timestamp || [];
    const prices = result.indicators?.quote?.[0] || {};
    const { open, high, low, close, volume } = prices;

    // Format the data similar to Alpha Vantage structure
    const formattedData: any = {
      'Meta Data': {
        '1. Information': 'Daily Prices and Volumes',
        '2. Symbol': symbol,
        '3. Last Refreshed': new Date().toISOString().split('T')[0],
        '4. Output Size': 'Compact',
        '5. Time Zone': 'US/Eastern'
      },
      'Time Series (Daily)': {}
    };

    // Convert to Alpha Vantage format
    for (let i = 0; i < timestamps.length; i++) {
      if (close?.[i] != null) {
        const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        formattedData['Time Series (Daily)'][date] = {
          '1. open': open?.[i]?.toString() || close[i].toString(),
          '2. high': high?.[i]?.toString() || close[i].toString(),
          '3. low': low?.[i]?.toString() || close[i].toString(),
          '4. close': close[i].toString(),
          '5. adjusted close': close[i].toString(),
          '6. volume': volume?.[i]?.toString() || '0',
          '7. dividend amount': '0.0000',
          '8. split coefficient': '1.0000'
        };
      }
    }

    console.log(`Successfully fetched ${Object.keys(formattedData['Time Series (Daily)']).length} days of data for ${symbol}`);

    return new Response(
      JSON.stringify(formattedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Yahoo Finance proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch data from Yahoo Finance',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})