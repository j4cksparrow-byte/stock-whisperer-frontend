const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: ['https://stock-whisperer-frontend.lovable.app', 'http://localhost:8081'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Proxy endpoint
app.post('/api/stock-analysis', async (req, res) => {
  try {
    const response = await fetch('https://kashrollin.app.n8n.cloud/webhook/stock-chart-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from n8n webhook' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 