import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useStockNews(symbol: string) {
  return useQuery({
    queryKey: ['stock-news', symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-stock-news', {
        body: { symbol }
      })

      if (error) throw error
      return data
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 1
  })
}
