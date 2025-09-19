-- Fix remaining function search path security warnings by handling dependencies

-- Check for and drop any existing triggers first
DROP TRIGGER IF EXISTS trigger_delete_old_cache ON public.stock_analysis_cache;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.delete_old_cache_entries();
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- Recreate with proper search_path settings
CREATE OR REPLACE FUNCTION public.delete_old_cache_entries()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.stock_analysis_cache 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate triggers if they existed
CREATE TRIGGER trigger_delete_old_cache
    AFTER INSERT ON public.stock_analysis_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_old_cache_entries();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_user();