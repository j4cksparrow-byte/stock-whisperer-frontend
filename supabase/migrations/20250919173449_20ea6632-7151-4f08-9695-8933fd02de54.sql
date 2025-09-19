-- Fix security warnings by properly handling function dependencies

-- Drop triggers first
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_user_analysis_preferences_updated_at ON public.user_analysis_preferences;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.cleanup_expired_cache();

-- Recreate functions with proper search_path settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.analysis_results WHERE expires_at < now();
    DELETE FROM public.market_data_cache WHERE expires_at < now();
    DELETE FROM public.news_sentiment_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_analysis_preferences_updated_at
    BEFORE UPDATE ON public.user_analysis_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();