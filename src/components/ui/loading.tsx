import React from 'react';
import { Loader2, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'chart' | 'analysis';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const messageClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="loading-skeleton h-4 w-3/4" />
        <div className="loading-skeleton h-4 w-1/2" />
        <div className="loading-skeleton h-4 w-5/6" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <Card className="card-glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin">
              <BarChart3 className={`${sizeClasses[size]} text-finance-primary`} />
            </div>
            <div>
              <p className={`${messageClasses[size]} font-medium text-foreground`}>
                Loading Chart Data
              </p>
              <p className="text-sm text-muted-foreground">Preparing interactive chart...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'analysis') {
    return (
      <Card className="card-glass">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="animate-spin">
                  <Activity className={`${sizeClasses[size]} text-finance-primary`} />
                </div>
                <div className="absolute inset-0 animate-ping">
                  <div className="w-full h-full rounded-full bg-finance-primary/20" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`${messageClasses[size]} font-semibold text-foreground`}>
                Analyzing Stock Data
              </p>
              <p className="text-sm text-muted-foreground">
                Processing technical, fundamental, and sentiment analysis...
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-finance-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-finance-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-finance-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-finance-primary`} />
      <span className={`${messageClasses[size]} text-foreground`}>{message}</span>
    </div>
  );
};

// Loading skeleton components
export const LoadingSkeleton = {
  Card: ({ className = '' }: { className?: string }) => (
    <Card className={`card-glass ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="loading-skeleton h-6 w-1/3" />
        <div className="loading-skeleton h-4 w-full" />
        <div className="loading-skeleton h-4 w-2/3" />
        <div className="loading-skeleton h-4 w-4/5" />
      </CardContent>
    </Card>
  ),

  Chart: ({ className = '' }: { className?: string }) => (
    <Card className={`card-glass ${className}`}>
      <CardContent className="p-6">
        <div className="loading-skeleton h-6 w-1/4 mb-4" />
        <div className="space-y-2">
          <div className="loading-skeleton h-4 w-full" />
          <div className="loading-skeleton h-4 w-5/6" />
          <div className="loading-skeleton h-4 w-4/5" />
          <div className="loading-skeleton h-4 w-3/4" />
          <div className="loading-skeleton h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  ),

  Table: ({ rows = 5, className = '' }: { rows?: number; className?: string }) => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="loading-skeleton h-4 w-1/4" />
          <div className="loading-skeleton h-4 w-1/3" />
          <div className="loading-skeleton h-4 w-1/4" />
          <div className="loading-skeleton h-4 w-1/6" />
        </div>
      ))}
    </div>
  ),

  List: ({ items = 3, className = '' }: { items?: number; className?: string }) => (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="loading-skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="loading-skeleton h-4 w-3/4" />
            <div className="loading-skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),

  Grid: ({ cols = 3, rows = 2, className = '' }: { cols?: number; rows?: number; className?: string }) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6 ${className}`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <LoadingSkeleton.Card key={i} />
      ))}
    </div>
  )
};

export default Loading; 