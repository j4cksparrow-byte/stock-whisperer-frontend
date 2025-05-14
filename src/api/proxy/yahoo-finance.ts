interface YahooFinanceError {
  code: string;
  message: string;
  details?: any;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'MISSING_QUERY',
          message: 'Query parameter is required',
        },
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  if (query.length < 2) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'QUERY_TOO_SHORT',
          message: 'Query must be at least 2 characters long',
        },
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&enableCb=true`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: YahooFinanceError = {
        code: `HTTP_${response.status}`,
        message: `Failed to fetch from Yahoo Finance (${response.status})`,
      };

      try {
        const errorData = await response.json();
        error.details = errorData;
      } catch {
        // Ignore JSON parsing errors for error response
      }

      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();

    // Validate response format
    if (!data.quotes || !Array.isArray(data.quotes)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Invalid response format from Yahoo Finance',
          },
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in Yahoo Finance proxy:', error);

    const errorResponse: YahooFinanceError = {
      code: 'UNKNOWN_ERROR',
      message: 'Failed to fetch stock data',
    };

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorResponse.code = 'TIMEOUT';
        errorResponse.message = 'Request timed out';
      } else if (error.message.includes('fetch')) {
        errorResponse.code = 'NETWORK_ERROR';
        errorResponse.message = 'Network error - please check your connection';
      }
    }

    return new Response(JSON.stringify({ error: errorResponse }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
} 