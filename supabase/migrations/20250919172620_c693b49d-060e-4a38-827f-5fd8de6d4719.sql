-- Create enhanced stock analysis tables

-- Company data table for caching company information
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  exchange TEXT NOT NULL,
  sector TEXT,
  industry TEXT,
  market_cap BIGINT,
  employees INTEGER,
  founded INTEGER,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analysis results table for caching comprehensive analysis
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  analysis_type TEXT NOT NULL, -- 'smart' or 'pro'
  duration TEXT NOT NULL DEFAULT '1M', -- '1D', '1W', '1M', '3M', '6M', '1Y'
  
  -- Scores
  technical_score INTEGER NOT NULL CHECK (technical_score >= 0 AND technical_score <= 100),
  fundamental_score INTEGER NOT NULL CHECK (fundamental_score >= 0 AND fundamental_score <= 100),
  sentiment_score INTEGER NOT NULL CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
  aggregate_score INTEGER NOT NULL CHECK (aggregate_score >= 0 AND aggregate_score <= 100),
  
  -- Weights used
  technical_weight DECIMAL(3,2) NOT NULL DEFAULT 0.33,
  fundamental_weight DECIMAL(3,2) NOT NULL DEFAULT 0.33,
  sentiment_weight DECIMAL(3,2) NOT NULL DEFAULT 0.34,
  
  -- Analysis data
  recommendation TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  risk_level TEXT NOT NULL,
  ai_summary TEXT,
  key_factors JSONB,
  risks JSONB,
  catalysts JSONB,
  
  -- Technical indicators
  technical_indicators JSONB,
  
  -- Fundamental metrics
  fundamental_metrics JSONB,
  
  -- Sentiment data
  sentiment_data JSONB,
  
  -- Market data
  current_price DECIMAL(10,2),
  price_change DECIMAL(10,2),
  price_change_percent DECIMAL(5,2),
  volume BIGINT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

-- Enhanced market data cache
CREATE TABLE public.market_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  data_type TEXT NOT NULL, -- 'quote', 'historical', 'indicators', 'news'
  timeframe TEXT, -- '1D', '5D', '1M', etc. for historical data
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  
  UNIQUE(symbol, exchange, data_type, timeframe)
);

-- News and sentiment cache
CREATE TABLE public.news_sentiment_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  news_data JSONB NOT NULL,
  sentiment_analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
  
  UNIQUE(symbol, exchange)
);

-- User preferences for analysis settings
CREATE TABLE public.user_analysis_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Default weights
  default_technical_weight DECIMAL(3,2) NOT NULL DEFAULT 0.33,
  default_fundamental_weight DECIMAL(3,2) NOT NULL DEFAULT 0.33,
  default_sentiment_weight DECIMAL(3,2) NOT NULL DEFAULT 0.34,
  
  -- Preferred indicators
  preferred_technical_indicators JSONB DEFAULT '[]'::jsonb,
  preferred_fundamental_filters JSONB DEFAULT '{}'::jsonb,
  preferred_sentiment_filters JSONB DEFAULT '{}'::jsonb,
  
  -- Preferences
  default_analysis_mode TEXT NOT NULL DEFAULT 'smart',
  default_duration TEXT NOT NULL DEFAULT '1M',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sentiment_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analysis_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (analysis data should be publicly viewable)
CREATE POLICY "Allow public read access to companies" 
ON public.companies FOR SELECT USING (true);

CREATE POLICY "Allow public read access to analysis results" 
ON public.analysis_results FOR SELECT USING (true);

CREATE POLICY "Allow public read access to market data cache" 
ON public.market_data_cache FOR SELECT USING (true);

CREATE POLICY "Allow public read access to news sentiment cache" 
ON public.news_sentiment_cache FOR SELECT USING (true);

-- User preferences should be user-specific
CREATE POLICY "Users can view their own preferences" 
ON public.user_analysis_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_analysis_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_analysis_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_companies_symbol ON public.companies(symbol);
CREATE INDEX idx_companies_exchange ON public.companies(exchange);

CREATE INDEX idx_analysis_results_symbol_exchange ON public.analysis_results(symbol, exchange);
CREATE INDEX idx_analysis_results_expires_at ON public.analysis_results(expires_at);

CREATE INDEX idx_market_data_cache_symbol_type ON public.market_data_cache(symbol, exchange, data_type);
CREATE INDEX idx_market_data_cache_expires_at ON public.market_data_cache(expires_at);

CREATE INDEX idx_news_sentiment_cache_symbol ON public.news_sentiment_cache(symbol, exchange);
CREATE INDEX idx_news_sentiment_cache_expires_at ON public.news_sentiment_cache(expires_at);

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_analysis_preferences_updated_at
    BEFORE UPDATE ON public.user_analysis_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.analysis_results WHERE expires_at < now();
    DELETE FROM public.market_data_cache WHERE expires_at < now();
    DELETE FROM public.news_sentiment_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SET search_path = public;