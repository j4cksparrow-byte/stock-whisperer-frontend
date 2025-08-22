import { Search, Bell, Settings, BarChart3, TrendingUp, List, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardHeader = ({ activeTab, onTabChange }: DashboardHeaderProps) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "analyze", label: "Analyze", icon: TrendingUp },
    { id: "watchlist", label: "Watchlist", icon: List },
    { id: "alerts", label: "Alerts", icon: AlertCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">StockAnalyzer</span>
          </div>
          
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 ${
                    isActive ? "bg-muted font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search stocks..."
              className="pl-10 w-80"
            />
          </div>
          
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Market Open
          </Badge>
        </div>
      </div>
    </header>
  );
};