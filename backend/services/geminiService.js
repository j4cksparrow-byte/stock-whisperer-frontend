const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialize();
  }

  initialize() {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️ GEMINI_API_KEY not found in environment variables');
        return;
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log('✅ Gemini AI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  async generateInsights(prompt) {
    try {
      if (!this.model) {
        console.log('⚠️ Gemini AI not available, using fallback response');
        return this.getFallbackResponse(prompt);
      }

      console.log('🤖 Generating AI insights...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ AI insights generated successfully');
      return text;

    } catch (error) {
      console.error('❌ Gemini AI error:', error.message);
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(prompt) {
    // Extract symbol from prompt for more specific fallback
    const symbolMatch = prompt.match(/([A-Z]{1,5})/);
    const symbol = symbolMatch ? symbolMatch[1] : 'the stock';

    if (prompt.includes('weighted analysis') || prompt.includes('ANALYSIS WEIGHTS')) {
      return `Based on the weighted analysis approach for ${symbol}:

**Investment Style Analysis:**
The chosen weight distribution reflects a specific investment philosophy. Higher fundamental weights indicate value-focused investing, while technical emphasis suggests active trading strategies.

**Key Insights:**
• The weighted score provides a balanced view considering your preferred analysis methods
• Risk management should align with the weighting strategy chosen
• Market conditions may favor different weighting approaches over time

**Recommendations:**
• Monitor how your chosen weights perform across different market cycles
• Consider adjusting weights based on market volatility and your time horizon
• Diversification remains important regardless of analysis weighting

*Note: AI service temporarily unavailable - this is a structured fallback analysis.*`;
    }

    return `**Analysis Summary for ${symbol}:**

Based on current market data and available indicators:

**Key Points:**
• Fundamental metrics show company's financial health and valuation
• Technical indicators suggest price momentum and trend direction  
• Market sentiment reflects investor psychology and news impact

**Investment Considerations:**
• Evaluate risk tolerance against potential returns
• Consider broader market conditions and sector trends
• Monitor key support/resistance levels for entry/exit points

**Risk Assessment:**
• Diversification across sectors and asset classes recommended
• Stay informed about company-specific news and earnings
• Market volatility requires careful position sizing

*Note: AI service temporarily unavailable - this is a general market analysis framework.*`;
  }

  // Test connection method
  async testConnection() {
    try {
      if (!this.model) {
        return { success: false, message: 'Gemini AI not initialized' };
      }

      const testPrompt = "Say 'Hello' if you can receive this message.";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();

      return { 
        success: true, 
        message: 'Gemini AI connection successful',
        response: text.substring(0, 100) + '...'
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Gemini AI connection failed: ${error.message}` 
      };
    }
  }
}

module.exports = new GeminiService();
