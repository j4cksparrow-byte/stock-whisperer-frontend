// services/sentimentService.js
const apiTrackingService = require('./apiTrackingService');

async function fetchAlphaVantageNewsSentiment(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) throw new Error('ALPHA_VANTAGE_KEY missing');
  
  const startTime = Date.now();
  let success = false;

  try {
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${encodeURIComponent(symbol)}&sort=LATEST&limit=50&apikey=${apiKey}`;
    apiTrackingService.logAPICall('Alpha Vantage', 'NEWS_SENTIMENT', symbol, null, true, 0);
    
    const res = await fetch(url);
    const responseTime = Date.now() - startTime;
    success = true;
    
    if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
    const data = await res.json();

    const feed = Array.isArray(data.feed) ? data.feed : [];
    if (feed.length === 0) {
      apiTrackingService.logAPICall('Alpha Vantage', 'NEWS_SENTIMENT', symbol, null, true, responseTime);
      return { score: 50, source: 'Alpha Vantage News', summary: `No recent news for ${symbol}.` };
    }

    // Average overall_sentiment_score (-1..+1) → 0..100
    const avg = feed.reduce((a, item) => a + (Number(item.overall_sentiment_score) || 0), 0) / feed.length;
    const score = Math.round((avg + 1) * 50);

    // Keep a brief headline sample for transparency
    const headlines = feed.slice(0, 8).map(i => ({
      title: i.title,
      publisher: i.source,
      score: i.overall_sentiment_score
    }));

    apiTrackingService.logAPICall('Alpha Vantage', 'NEWS_SENTIMENT', symbol, null, true, responseTime);
    return {
      score,
      source: 'Alpha Vantage News',
      summary: `Avg sentiment score ${avg.toFixed(2)} across ${feed.length} articles.`,
      headlines
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    apiTrackingService.logAPICall('Alpha Vantage', 'NEWS_SENTIMENT', symbol, null, false, responseTime);
    throw error;
  }
}

module.exports = { fetchAlphaVantageNewsSentiment };
