### 🚀 Improved README.md Format

Here is a significantly improved, more professional, and user-friendly `README.md` based on your provided content. This version uses a clearer structure, better headings, and more organized code blocks.

````markdown
# Hybrid Stock Analysis API (v3.0)

A modular Node.js API that provides comprehensive stock analysis by combining **fundamental, technical, and sentiment** data, summarized by Google's Gemini AI. The backend is designed for scalability and performance, featuring services/controllers, in-memory caching, and rate limiting.

<br>

---

## ✨ Features

- **Multi-faceted Analysis:** Analyze stocks using a hybrid approach that integrates fundamentals, technical indicators, and news sentiment.
- **AI-Powered Insights:** Get a clear, concise AI-generated summary of the analysis for easy interpretation.
- **Dynamic Analysis Modes:**
  - **`normal` mode:** Provides fundamentals and an AI summary.
  - **`advanced` mode:** A comprehensive analysis that generates a single `weightedScore` from all three data points.
- **Extensive Technical Suite:** Support for key indicators including **RSI, SMA/EMA, MACD, Bollinger Bands, Stochastic, ATR, and OBV**, with configurable parameters per request.
- **Flexible Weighting & Presets:** Customize the influence of each data point (`fundamental`, `technical`, `sentiment`) or use built-in presets like `conservative`, `technical`, `sentiment`, and `balanced`.
- **Developer-Friendly:** Includes health checks, API key validation, and connectivity tests for quick setup and debugging.

<br>

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Data & APIs:**
  - **Axios** for HTTP requests
  - **Alpha Vantage** for market data
  - **Google Gemini** for AI summaries
- **Utilities:** In-memory caching

<br>

---

## 🚀 Quickstart

### 1. Prerequisites

- Node.js version 18 or higher
- npm (Node Package Manager)

### 2. Clone & Install

```bash
git clone <your-repo-url>.git
cd <your-repo-folder>
npm install
````

### 3\. Configure Environment

Create a `.env` file in the project root and add your API keys:

```
PORT=3001
NODE_ENV=development

# External APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
GEMINI_API_KEY=your_gemini_key
```

### 4\. Run the Server

```bash
node server.js
```

> **Tip:** For development, use `nodemon` to automatically restart the server on code changes:
> `npx nodemon server.js`

\<br\>

-----

## 🚦 Sanity Checks

Use these endpoints in a separate terminal to verify your setup.

```bash
# Health Check
curl "http://localhost:3001/health"

# Verify API Keys (returns true/false flags)
curl "http://localhost:3001/test-keys"

# Test Live Connectivity to External APIs
curl "http://localhost:3001/test-connections"
```

> **PowerShell Tip:** On Windows, if `curl` isn't available, use `Invoke-WebRequest`.
> `Invoke-WebRequest "http://localhost:3001/health"`

\<br\>

-----

## 📜 API Endpoints

**Base URL:** `http://localhost:3001`

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Overview & API docs |
| `GET` | `/health` | Server health check |
| `GET` | `/test-keys` | API key validation flags |
| `GET` | `/test-connections` | Live connectivity checks |

### Stock API Routes (`/api/stocks`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/search?query=...` | Search for a company name to get its symbol |
| `GET` | `/trending` | Get a list of trending stocks (cached) |
| `GET` | `/indicators` | List all supported technical indicators |
| `GET` | `/weights/defaults` | Get default weight configurations |
| `GET` | `/analysis/:symbol` | Perform stock analysis |

\<br\>

-----

## ⚙️ Usage & Parameters

The core analysis endpoint is `GET /api/stocks/analysis/:symbol`.

### Common Parameters

  - `timeframe`: **1D, 1W, 1M** (default), **3M, 6M, 1Y, 2Y**
  - `mode`: **`normal`** or **`advanced`**

### `advanced` Mode Parameters

  - **`fundamental`, `technical`, `sentiment`**: Integers that must sum to `100`.
      - **Example:** `...&mode=advanced&fundamental=30&technical=40&sentiment=30`
  - **`indicators`**: A URL-encoded JSON string to customize indicator parameters.
      - **Example:** `...&indicators={"RSI":{"period":14},"MACD":{...}}`

\<br\>

-----

## 🌐 Example Calls

### Search for "Apple"

```bash
curl "http://localhost:3001/api/stocks/search?query=apple"
```

### Get Trending Stocks

```bash
curl "http://localhost:3001/api/stocks/trending"
```

### Normal Analysis for AAPL

```bash
curl "http://localhost:3001/api/stocks/analysis/AAPL?timeframe=1M&mode=normal"
```

### Advanced Analysis for AAPL with Custom Weights

```bash
curl "http://localhost:3001/api/stocks/analysis/AAPL?timeframe=3M&mode=advanced&fundamental=40&technical=35&sentiment=25"
```

\<br\>

-----

## 📝 Notes & Behaviors

  - **Caching:** Search and trending data are cached in-memory for \~5 minutes to reduce API calls and latency.
  - **Rate Limiting:** The API uses a server-side rate limit of **100 requests per 15 minutes** per IP address.
  - **Error Handling:** The API provides consistent JSON error envelopes with clear status codes (e.g., `400` for bad input, `500` for server errors).
  - **Modular Design:** The project is structured with separate **controllers** (request/response logic) and **services** (data fetching, analysis, caching).

\<br\>

-----

## 🗺️ Roadmap

  - [ ] Connect trending data to a live, external feed with backoff/circuit-breaker logic.
  - [ ] Add more sentiment data sources and richer market health checks.
  - [ ] Provide a Postman collection and example JSON responses for easier testing.
  - [ ] Generate an OpenAPI 3.1 specification for full documentation.

\<br\>

-----


```
```