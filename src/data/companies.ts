export interface Company {
  name: string;
  symbol: string;
  exchange: string;
}

export const COMPANIES: Company[] = [
  // NASDAQ Companies
  { name: "Apple Inc.", symbol: "AAPL", exchange: "NASDAQ" },
  { name: "Microsoft Corporation", symbol: "MSFT", exchange: "NASDAQ" },
  { name: "Alphabet Inc.", symbol: "GOOGL", exchange: "NASDAQ" },
  { name: "Amazon.com Inc.", symbol: "AMZN", exchange: "NASDAQ" },
  { name: "Meta Platforms Inc.", symbol: "META", exchange: "NASDAQ" },
  { name: "NVIDIA Corporation", symbol: "NVDA", exchange: "NASDAQ" },
  { name: "Tesla Inc.", symbol: "TSLA", exchange: "NASDAQ" },
  { name: "Netflix Inc.", symbol: "NFLX", exchange: "NASDAQ" },
  { name: "Adobe Inc.", symbol: "ADBE", exchange: "NASDAQ" },
  { name: "PayPal Holdings Inc.", symbol: "PYPL", exchange: "NASDAQ" },

  // NYSE Companies
  { name: "JPMorgan Chase & Co.", symbol: "JPM", exchange: "NYSE" },
  { name: "Visa Inc.", symbol: "V", exchange: "NYSE" },
  { name: "Walmart Inc.", symbol: "WMT", exchange: "NYSE" },
  { name: "Bank of America Corp.", symbol: "BAC", exchange: "NYSE" },
  { name: "Procter & Gamble Co.", symbol: "PG", exchange: "NYSE" },
  { name: "Walt Disney Co.", symbol: "DIS", exchange: "NYSE" },
  { name: "Coca-Cola Co.", symbol: "KO", exchange: "NYSE" },
  { name: "PepsiCo Inc.", symbol: "PEP", exchange: "NYSE" },
  { name: "AT&T Inc.", symbol: "T", exchange: "NYSE" },
  { name: "Verizon Communications Inc.", symbol: "VZ", exchange: "NYSE" },

  // Indices
  { name: "NASDAQ Composite", symbol: "IXIC", exchange: "NASDAQ" },
  { name: "NASDAQ-100", symbol: "NDX", exchange: "NASDAQ" },
  { name: "S&P 500", symbol: "SPX", exchange: "NYSE" },
  { name: "Dow Jones Industrial Average", symbol: "DJI", exchange: "NYSE" }
]; 