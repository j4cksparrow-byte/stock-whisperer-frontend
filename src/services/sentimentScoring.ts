import type { ScoreBreakdown } from './scoringService';
import type { NewsItem } from '../types/stockAnalysis';

/**
 * Sentiment analysis scoring service
 */
export const sentimentScoring = {
  /**
   * Calculate sentiment analysis score
   */
  async calculateScore(newsItems: NewsItem[]): Promise<ScoreBreakdown> {
    console.log(`💭 Starting sentiment analysis for ${newsItems.length} news items...`);
    
    let score = 50; // Start with neutral score
    let confidence = 0.6; // Base confidence (sentiment analysis can be subjective)
    const details: string[] = [];
    const flags: string[] = [];
    
    try {
      if (!newsItems || newsItems.length === 0) {
        flags.push('No recent news available for sentiment analysis');
        confidence = 0.3;
        return {
          score: 50,
          confidence,
          details: ['No news data available - neutral sentiment assumed'],
          flags
        };
      }
      
      let totalSentiment = 0;
      let sentimentCount = 0;
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;
      
      // Sentiment keywords for analysis
      const positiveWords = [
        'buy', 'bullish', 'upgrade', 'growth', 'profit', 'beat', 'strong', 'rise', 'gain',
        'success', 'positive', 'optimistic', 'outperform', 'excellent', 'breakthrough',
        'expansion', 'record', 'soar', 'surge', 'rally', 'boost', 'improve'
      ];
      
      const negativeWords = [
        'sell', 'bearish', 'downgrade', 'loss', 'miss', 'weak', 'fall', 'drop', 'decline',
        'negative', 'pessimistic', 'underperform', 'concern', 'warning', 'risk',
        'plunge', 'crash', 'tumble', 'slump', 'cut', 'reduce', 'struggle'
      ];
      
      const uncertainWords = [
        'uncertain', 'volatile', 'mixed', 'cautious', 'watch', 'monitor', 'question',
        'doubt', 'unclear', 'complicated', 'challenging', 'difficult'
      ];
      
      // Analyze each news item
      newsItems.forEach((item, index) => {
        const text = (item.title + ' ' + (item.summary || '')).toLowerCase();
        const age = new Date().getTime() - new Date(item.publishedAt).getTime();
        const daysSincePublished = age / (1000 * 60 * 60 * 24);
        
        // Weight newer news more heavily
        const timeWeight = Math.max(0.3, 1 - (daysSincePublished / 14)); // Linear decay over 14 days
        
        let itemSentiment = 0;
        let itemWeight = timeWeight;
        
        // Use provided sentiment if available
        if (item.sentiment !== undefined && item.sentiment !== null) {
          itemSentiment = item.sentiment * timeWeight;
          totalSentiment += itemSentiment;
          sentimentCount++;
        } else {
          // Calculate sentiment from keywords
          let positiveScore = 0;
          let negativeScore = 0;
          let uncertainScore = 0;
          
          positiveWords.forEach(word => {
            const matches = (text.match(new RegExp(word, 'gi')) || []).length;
            positiveScore += matches;
          });
          
          negativeWords.forEach(word => {
            const matches = (text.match(new RegExp(word, 'gi')) || []).length;
            negativeScore += matches;
          });
          
          uncertainWords.forEach(word => {
            const matches = (text.match(new RegExp(word, 'gi')) || []).length;
            uncertainScore += matches;
          });
          
          // Calculate net sentiment
          const netSentiment = (positiveScore - negativeScore - uncertainScore * 0.5) / 10;
          itemSentiment = Math.max(-1, Math.min(1, netSentiment)) * timeWeight;
          totalSentiment += itemSentiment;
          sentimentCount++;
        }
        
        // Categorize sentiment
        if (itemSentiment > 0.1) {
          positiveCount++;
        } else if (itemSentiment < -0.1) {
          negativeCount++;
        } else {
          neutralCount++;
        }
        
        // Add specific insights for significant sentiment
        if (Math.abs(itemSentiment) > 0.3 && daysSincePublished < 7) {
          if (itemSentiment > 0) {
            details.push(`Recent positive news: "${item.title.substring(0, 60)}..."`);
          } else {
            details.push(`Recent negative news: "${item.title.substring(0, 60)}..."`);
          }
        }
      });
      
      // Calculate overall sentiment metrics
      const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;
      const totalNews = newsItems.length;
      
      // Sentiment Distribution Analysis (40% weight)
      const positiveRatio = positiveCount / totalNews;
      const negativeRatio = negativeCount / totalNews;
      const neutralRatio = neutralCount / totalNews;
      
      if (positiveRatio > 0.6) {
        score += 15;
        details.push(`Overwhelmingly positive coverage (${(positiveRatio * 100).toFixed(0)}% positive) - strong bullish sentiment`);
      } else if (positiveRatio > 0.4) {
        score += 8;
        details.push(`Mostly positive coverage (${(positiveRatio * 100).toFixed(0)}% positive) - bullish sentiment`);
      } else if (positiveRatio > 0.2) {
        score += 3;
        details.push(`Some positive coverage (${(positiveRatio * 100).toFixed(0)}% positive) - mild bullish sentiment`);
      }
      
      if (negativeRatio > 0.6) {
        score -= 15;
        flags.push(`Overwhelmingly negative coverage (${(negativeRatio * 100).toFixed(0)}% negative) - strong bearish sentiment`);
      } else if (negativeRatio > 0.4) {
        score -= 8;
        flags.push(`Mostly negative coverage (${(negativeRatio * 100).toFixed(0)}% negative) - bearish sentiment`);
      } else if (negativeRatio > 0.2) {
        score -= 3;
        flags.push(`Some negative coverage (${(negativeRatio * 100).toFixed(0)}% negative) - mild bearish sentiment`);
      }
      
      if (neutralRatio > 0.7) {
        details.push(`Mostly neutral coverage (${(neutralRatio * 100).toFixed(0)}% neutral) - balanced reporting`);
      }
      
      // Average Sentiment Analysis (40% weight)
      const sentimentImpact = avgSentiment * 25; // Scale to score impact
      score += sentimentImpact;
      
      if (avgSentiment > 0.3) {
        details.push(`Strong positive sentiment (${(avgSentiment * 100).toFixed(0)}) - market optimism`);
      } else if (avgSentiment > 0.1) {
        details.push(`Mild positive sentiment (${(avgSentiment * 100).toFixed(0)}) - cautious optimism`);
      } else if (avgSentiment < -0.3) {
        flags.push(`Strong negative sentiment (${(avgSentiment * 100).toFixed(0)}) - market pessimism`);
      } else if (avgSentiment < -0.1) {
        flags.push(`Mild negative sentiment (${(avgSentiment * 100).toFixed(0)}) - cautious pessimism`);
      } else {
        details.push('Neutral sentiment - balanced market opinion');
      }
      
      // News Volume Analysis (20% weight)
      const recentNews = newsItems.filter(item => {
        const age = new Date().getTime() - new Date(item.publishedAt).getTime();
        return age < (7 * 24 * 60 * 60 * 1000); // Last 7 days
      }).length;
      
      if (recentNews > 10) {
        score += 5;
        details.push(`High news volume (${recentNews} recent articles) - significant market attention`);
      } else if (recentNews > 5) {
        score += 2;
        details.push(`Moderate news volume (${recentNews} recent articles) - normal market attention`);
      } else if (recentNews < 2) {
        score -= 2;
        flags.push(`Low news volume (${recentNews} recent articles) - limited market attention`);
      }
      
      // Confidence adjustment based on data quality
      if (newsItems.length >= 10) {
        confidence = Math.min(confidence * 1.2, 1.0);
      } else if (newsItems.length < 5) {
        confidence *= 0.8;
        flags.push('Limited news data - reduced sentiment reliability');
      }
      
      // Check for conflicting signals
      const sentimentSpread = Math.max(positiveRatio, negativeRatio, neutralRatio) - Math.min(positiveRatio, negativeRatio, neutralRatio);
      if (sentimentSpread < 0.3) {
        flags.push('Mixed sentiment signals - market uncertainty');
        confidence *= 0.9;
      }
      
    } catch (error) {
      console.warn('Error in sentiment analysis:', error);
      flags.push('Error in sentiment analysis - reduced reliability');
      confidence *= 0.6;
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, Math.round(score)));
    confidence = Math.max(0, Math.min(1, confidence));
    
    const result: ScoreBreakdown = {
      score,
      confidence,
      details,
      flags
    };
    
    console.log(`✅ Sentiment analysis complete: ${score}/100 (confidence: ${(confidence * 100).toFixed(1)}%)`);
    
    return result;
  }
};
