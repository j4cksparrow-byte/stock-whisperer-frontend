-- Create analysis_results table for caching stock analysis data
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NASDAQ',
  duration TEXT NOT NULL DEFAULT '1M',
  analysis_type TEXT NOT NULL DEFAULT 'normal',
  aggregate_score INTEGER,
  technical_score INTEGER,
  fundamental_score INTEGER,
  sentiment_score INTEGER,
  technical_weight DECIMAL(3,2) DEFAULT 0.35,
  fundamental_weight DECIMAL(3,2) DEFAULT 0.35,
  sentiment_weight DECIMAL(3,2) DEFAULT 0.30,
  confidence INTEGER,
  recommendation TEXT,
  risk_level TEXT,
  current_price DECIMAL(10,2),
  price_change DECIMAL(10,2),
  price_change_percent DECIMAL(5,2),
  volume BIGINT,
  technical_indicators JSONB,
  fundamental_metrics JSONB,
  sentiment_data JSONB,
  key_factors TEXT[],
  risks TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(symbol, duration, analysis_type)
);

-- Enable RLS
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is market data)
CREATE POLICY "Analysis results are viewable by everyone" 
ON public.analysis_results 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert analysis results" 
ON public.analysis_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update analysis results" 
ON public.analysis_results 
FOR UPDATE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_analysis_results_updated_at
BEFORE UPDATE ON public.analysis_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_analysis_results_symbol_duration ON public.analysis_results(symbol, duration);
CREATE INDEX idx_analysis_results_expires_at ON public.analysis_results(expires_at);