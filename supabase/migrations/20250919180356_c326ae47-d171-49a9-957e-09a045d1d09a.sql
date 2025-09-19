-- Phase 1: Core Infrastructure Setup - Database Schema Enhancement
-- Create tables for caching analysis results, company data, and user preferences

-- Create enum types for better data integrity
CREATE TYPE analysis_duration AS ENUM ('1D', '1W', '1M', '3M', '6M', '1Y');
CREATE TYPE recommendation_type AS ENUM ('STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- Enhanced analysis results table with more comprehensive data
ALTER TABLE public.analysis_results 
ADD COLUMN IF NOT EXISTS market_cap BIGINT,
ADD COLUMN IF NOT EXISTS volume_avg_30d BIGINT,
ADD COLUMN IF NOT EXISTS pe_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS peg_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS roe NUMERIC,
ADD COLUMN IF NOT EXISTS debt_to_equity NUMERIC,
ADD COLUMN IF NOT EXISTS dividend_yield NUMERIC,
ADD COLUMN IF NOT EXISTS analyst_rating NUMERIC,
ADD COLUMN IF NOT EXISTS price_target NUMERIC,
ADD COLUMN IF NOT EXISTS volatility NUMERIC,
ADD COLUMN IF NOT EXISTS beta NUMERIC;

-- Create technical indicators cache table
CREATE TABLE IF NOT EXISTS public.technical_indicators_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    timeframe TEXT NOT NULL, -- '1min', '5min', '15min', '1h', '1d'
    indicator_type TEXT NOT NULL, -- 'RSI', 'MACD', 'BB', etc.
    indicator_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
    
    UNIQUE(symbol, exchange, timeframe, indicator_type)
);

-- Create news and sentiment cache enhancements
ALTER TABLE public.news_sentiment_cache 
ADD COLUMN IF NOT EXISTS news_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS positive_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS negative_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS neutral_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sentiment_trend TEXT DEFAULT 'NEUTRAL';

-- Create market status and trending stocks table
CREATE TABLE IF NOT EXISTS public.market_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_name TEXT NOT NULL UNIQUE, -- 'NYSE', 'NASDAQ', 'ASX', etc.
    is_open BOOLEAN NOT NULL DEFAULT FALSE,
    next_open TIMESTAMPTZ,
    next_close TIMESTAMPTZ,
    timezone TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trending_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    trend_score NUMERIC NOT NULL,
    volume_spike NUMERIC,
    price_change_percent NUMERIC,
    news_mentions INTEGER DEFAULT 0,
    social_mentions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(symbol, exchange, DATE(created_at))
);

-- Enhanced user analysis preferences
ALTER TABLE public.user_analysis_preferences 
ADD COLUMN IF NOT EXISTS custom_indicators JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS investment_horizon TEXT DEFAULT '1M',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS favorite_symbols TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_technical_indicators_symbol_exchange ON public.technical_indicators_cache(symbol, exchange);
CREATE INDEX IF NOT EXISTS idx_technical_indicators_expires ON public.technical_indicators_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_trending_stocks_score ON public.trending_stocks(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_results_symbol_created ON public.analysis_results(symbol, exchange, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_symbol_type ON public.market_data_cache(symbol, exchange, data_type);

-- Enable RLS on new tables
ALTER TABLE public.technical_indicators_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_stocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Allow public read access to technical indicators" 
ON public.technical_indicators_cache FOR SELECT USING (true);

CREATE POLICY "Allow public read access to market status" 
ON public.market_status FOR SELECT USING (true);

CREATE POLICY "Allow public read access to trending stocks" 
ON public.trending_stocks FOR SELECT USING (true);

-- Create function to clean up expired technical indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_technical_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.technical_indicators_cache WHERE expires_at < NOW();
END;
$$;