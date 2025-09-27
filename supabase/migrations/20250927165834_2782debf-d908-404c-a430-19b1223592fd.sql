-- Create cache table for storing API responses and analysis results
CREATE TABLE public.cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Create unique constraint on cache_key and user_id combination
  UNIQUE(cache_key, user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_cache_key ON public.cache(cache_key);
CREATE INDEX idx_cache_expires_at ON public.cache(expires_at);
CREATE INDEX idx_cache_user_id ON public.cache(user_id);

-- Enable Row Level Security
ALTER TABLE public.cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cache entries and global entries (where user_id is null)
CREATE POLICY "Users can view accessible cache entries" 
ON public.cache 
FOR SELECT 
USING (
  user_id IS NULL OR 
  auth.uid() = user_id
);

-- Policy: Users can insert their own cache entries
CREATE POLICY "Users can insert their own cache entries" 
ON public.cache 
FOR INSERT 
WITH CHECK (
  user_id IS NULL OR 
  auth.uid() = user_id
);

-- Policy: Users can update their own cache entries and global entries
CREATE POLICY "Users can update accessible cache entries" 
ON public.cache 
FOR UPDATE 
USING (
  user_id IS NULL OR 
  auth.uid() = user_id
);

-- Policy: Users can delete their own cache entries and global entries
CREATE POLICY "Users can delete accessible cache entries" 
ON public.cache 
FOR DELETE 
USING (
  user_id IS NULL OR 
  auth.uid() = user_id
);

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.cache 
  WHERE expires_at IS NOT NULL 
    AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cache_updated_at
BEFORE UPDATE ON public.cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper function to get cache value
CREATE OR REPLACE FUNCTION public.get_cache_value(
  _cache_key TEXT,
  _user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cache_result JSONB;
BEGIN
  SELECT cache_value INTO cache_result
  FROM public.cache
  WHERE cache_key = _cache_key
    AND (user_id = _user_id OR (_user_id IS NULL AND user_id IS NULL))
    AND (expires_at IS NULL OR expires_at > now());
  
  RETURN cache_result;
END;
$$;

-- Create helper function to set cache value
CREATE OR REPLACE FUNCTION public.set_cache_value(
  _cache_key TEXT,
  _cache_value JSONB,
  _expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.cache (cache_key, cache_value, expires_at, user_id)
  VALUES (_cache_key, _cache_value, _expires_at, _user_id)
  ON CONFLICT (cache_key, user_id)
  DO UPDATE SET
    cache_value = EXCLUDED.cache_value,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();
END;
$$;