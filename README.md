Awesome—here’s a clean, copy-paste **README.md** for your repo.

````markdown
# Hybrid Stock Analysis API (v3.0)

Analyze stocks with **fundamentals + technicals + sentiment**, then get a clear AI summary.  
Modular Node.js backend with services/controllers, caching, and rate limiting.

## Features
- **Search & Trending**
  - Company name → symbol auto-complete
  - Trending list (cached; easy to swap to live data)
- **Analysis Modes**
  - **Normal:** Fundamentals + LLM summary
  - **Advanced:** Fundamentals + Technical Indicators + News Sentiment → single `weightedScore`
- **Technical Suite**
  - RSI, SMA/EMA, MACD, Bollinger Bands, Stochastic, ATR, OBV, and basic candlestick patterns
  - Customizable indicator parameters per request
- **Weights & Presets**
  - Validate/normalize to 100%; presets like `conservative`, `technical`, `sentiment`, `balanced`
- **DX & Ops**
  - Health checks, API key tests, in-memory caching, rate limiting

## Tech Stack
- Node.js, Express
- Axios (data fetch), in-memory cache
- Alpha Vantage (market data), Google Gemini (AI summary)

## Quickstart

### 1) Prerequisites
- Node.js 18+ and npm

### 2) Clone & Install
```bash
git clone <your-repo-url>.git
cd <your-repo-folder>
npm install
````

### 3) Configure Environment

Create a `.env` in the project root:

```bash
PORT=3001
NODE_ENV=development

# External APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
GEMINI_API_KEY=your_gemini_key
```

### 4) Run

```bash
node server.js
# or if you use nodemon:
# npx nodemon server.js
```

### 5) Sanity Checks (in another terminal)

```bash
# Health
curl "http://localhost:3001/health"

# Verify API keys are loaded (true/false flags)
curl "http://localhost:3001/test-keys"

# Attempt live connectivity checks
curl "http://localhost:3001/test-connections"
```

> **Windows PowerShell tip:** If `curl` errors, use `Invoke-WebRequest` (PowerShell’s native):

```powershell
Invoke-WebRequest "http://localhost:3001/health"
```

---

## Base URL

```
http://localhost:3001
```

## Endpoints

### Overview (also available at `/`)

* **Docs & examples:** `GET /`
* **Health:** `GET /health`
* **API key flags:** `GET /test-keys`
* **Connectivity test:** `GET /test-connections`

### Stocks API (prefix: `/api/stocks`)

| Method | Path                                           | What it does                                                                         |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| GET    | `/search?query=apple`                          | Name → symbol search (cached; Alpha Vantage fallback)                                |
| GET    | `/trending`                                    | Returns a trending list (cached; currently generated, easily swappable to live feed) |
| GET    | `/indicators`                                  | Lists supported technical indicators                                                 |
| GET    | `/weights/defaults`                            | Returns preset weight configurations                                                 |
| GET    | `/analysis/:symbol?timeframe=1M&mode=normal`   | Normal analysis (Fundamental + AI)                                                   |
| GET    | `/analysis/:symbol?timeframe=3M&mode=advanced` | Advanced analysis (Fundamental + Technical + Sentiment + AI)                         |

### Parameters

**Common**

* `timeframe`: one of `1D, 1W, 1M (default), 3M, 6M, 1Y, 2Y`
* `mode`: `normal` or `advanced`

**Advanced (weights)**

* `fundamental`, `technical`, `sentiment` → integers that sum to 100
  Example:

  ```
  /api/stocks/analysis/AAPL?timeframe=3M&mode=advanced&fundamental=30&technical=40&sentiment=30
  ```

**Advanced (custom indicators)**

* `indicators`: JSON string of indicator configs (URL-encoded)

```bash
curl "http://localhost:3001/api/stocks/analysis/AAPL?timeframe=1M&mode=advanced&indicators={\"RSI\":{\"period\":14},\"MACD\":{\"fastPeriod\":12,\"slowPeriod\":26,\"signalPeriod\":9}}"
```

> **PowerShell:** escape quotes or use `Invoke-WebRequest` and pass a plain URL string.

### Example Calls

```bash
# Search
curl "http://localhost:3001/api/stocks/search?query=apple"

# Trending
curl "http://localhost:3001/api/stocks/trending"

# Indicators
curl "http://localhost:3001/api/stocks/indicators"

# Normal analysis
curl "http://localhost:3001/api/stocks/analysis/AAPL?timeframe=1M&mode=normal"

# Advanced analysis (balanced custom weights)
curl "http://localhost:3001/api/stocks/analysis/AAPL?timeframe=3M&mode=advanced&fundamental=40&technical=35&sentiment=25"
```

---

## Behavior & Notes

### Caching

* Search and trending responses cached in-memory for \~5 minutes to reduce latency and API calls.

### Rate Limiting

* Server-side: **100 requests / 15 minutes per IP** (HTTP 429 on exceed).
* Alpha Vantage has its own limits; the API gracefully surfaces “rate limit” notes when hit.

### Error Handling

* Consistent JSON error envelopes with helpful messages (400 for bad input, 500 on server errors).

### Modular Design

* **Controllers** focus on request/response.
* **Services** handle data fetch, technical analysis, weights, caching, and AI summarization.

---

## Development Tips

* Start with `/test-keys` and `/test-connections` to validate setup.
* Use `/api/stocks/indicators` to see supported indicators and defaults.
* For complex Windows quoting, prefer **Postman** or **Thunder Client** in VS Code.

## Roadmap

* Wire trending to a live endpoint with backoff/circuit-breaker
* Expand sentiment sources & add richer market health checks
* Export a Postman collection and example JSON responses

## License

MIT (or your choice)

```

**Citations to your code (proving the README details):**  
- Search + trending endpoints and 5-minute cache logic are defined in the **search controller**. :contentReference[oaicite:0]{index=0}  
- Health checks, `/test-keys`, `/test-connections`, root docs with endpoint list, timeframe options, and presets live in **server.js**. :contentReference[oaicite:1]{index=1}  
- Route wiring for `/api/stocks` (search, trending, indicators, analysis, weights) is in **stockRoutes.js**. :contentReference[oaicite:2]{index=2}

Want me to add a tiny **“Copy as Postman collection”** JSON and an **OpenAPI 3.1** stub too?
```
