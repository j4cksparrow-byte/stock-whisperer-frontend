import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  badge,
  icon,
  children,
  className = ""
}: MetricCardProps) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">{value}</span>
          {trend && (
            <span className={`text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        
        {badge && (
          <Badge variant={badge.variant} className="mt-2">
            {badge.text}
          </Badge>
        )}
        
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};