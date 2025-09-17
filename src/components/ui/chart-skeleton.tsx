import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <div className="relative w-full h-full bg-muted/20 rounded-lg overflow-hidden">
        {/* Chart area skeleton */}
        <div className="absolute inset-0 flex flex-col">
          {/* Header area */}
          <div className="flex items-center justify-between p-3 border-b border-muted/30">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
          
          {/* Chart content area */}
          <div className="flex-1 p-4">
            {/* Price line skeleton */}
            <div className="flex items-end justify-between h-32 mb-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-1" 
                  style={{ 
                    height: `${Math.random() * 60 + 20}%`,
                    opacity: 0.3 + (Math.random() * 0.7)
                  }} 
                />
              ))}
            </div>
            
            {/* Volume bars skeleton */}
            <div className="flex items-end justify-between h-16">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-1" 
                  style={{ 
                    height: `${Math.random() * 40 + 10}%`,
                    opacity: 0.2 + (Math.random() * 0.3)
                  }} 
                />
              ))}
            </div>
          </div>
          
          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center space-y-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartSkeleton height={300} />
      </CardContent>
    </Card>
  );
}

export function MarketCardSkeleton() {
  return (
    <Card className="card-glass hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StockCardSkeleton() {
  return (
    <Card className="card-glass hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
          
          <ChartSkeleton height={120} />
          
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
