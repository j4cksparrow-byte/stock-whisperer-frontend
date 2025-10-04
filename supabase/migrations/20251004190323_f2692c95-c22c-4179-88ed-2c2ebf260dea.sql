-- Create function to get cached analysis by symbol
CREATE OR REPLACE FUNCTION public.get_cached_analysis(p_symbol text)
RETURNS TABLE (
  analysis_data jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cache_value as analysis_data,
    cache.created_at
  FROM public.cache
  WHERE cache_key = 'stock_analysis:' || p_symbol
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to save analysis to cache
CREATE OR REPLACE FUNCTION public.save_analysis_cache(
  p_symbol text,
  p_analysis_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.cache (
    cache_key,
    cache_value,
    expires_at
  )
  VALUES (
    'stock_analysis:' || p_symbol,
    p_analysis_data,
    now() + interval '24 hours'
  )
  ON CONFLICT (cache_key, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid))
  DO UPDATE SET
    cache_value = EXCLUDED.cache_value,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();
END;
$$;