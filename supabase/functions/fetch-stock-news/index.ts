import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch news from Alpha Vantage News API (or any other news API)
    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY')
    
    if (!ALPHA_VANTAGE_KEY) {
      console.warn('ALPHA_VANTAGE_API_KEY not configured, returning mock data')
      // Return mock news data
      const mockNews = [
        {
          title: `${symbol} reports strong quarterly earnings`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          source: 'Financial Times',
          sentiment: 'positive'
        },
        {
          title: `Analysts upgrade ${symbol} stock rating`,
          date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          source: 'Bloomberg',
          sentiment: 'positive'
        },
        {
          title: `Market watch: ${symbol} faces new challenges`,
          date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          source: 'Reuters',
          sentiment: 'neutral'
        }
      ]
      
      return new Response(
        JSON.stringify({ status: 'success', news: mockNews }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch real news from Alpha Vantage
    const newsUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    const newsResponse = await fetch(newsUrl)
    const newsData = await newsResponse.json()

    if (newsData.feed) {
      const formattedNews = newsData.feed.slice(0, 5).map((item: any) => {
        const sentimentScore = parseFloat(item.overall_sentiment_score || 0)
        let sentiment = 'neutral'
        if (sentimentScore > 0.15) sentiment = 'positive'
        else if (sentimentScore < -0.15) sentiment = 'negative'

        return {
          title: item.title,
          date: new Date(item.time_published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          source: item.source,
          sentiment,
          url: item.url
        }
      })

      return new Response(
        JSON.stringify({ status: 'success', news: formattedNews }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ status: 'success', news: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching news:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
