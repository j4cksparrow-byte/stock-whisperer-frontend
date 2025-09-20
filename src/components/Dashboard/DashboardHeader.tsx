import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  onStockSelect?: (symbol: string) => void;
  selectedStock?: string;
}

export const DashboardHeader = ({ onStockSelect, selectedStock = "AAPL" }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const tabs = ['Dashboard', 'Analyze', 'Watchlist', 'Alerts', 'Settings'];
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Analyze') {
      navigate('/');
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onStockSelect) {
      onStockSelect(searchTerm.toUpperCase());
      setSearchTerm('');
    }
  };

  return (
    <header className="bg-card border-b border-border">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  activeTab === tab 
                    ? 'text-primary bg-accent' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Search and User Menu */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 h-9 bg-background"
            />
          </form>
          <Button variant="ghost" size="sm" className="text-sm">
            TV
          </Button>
        </div>
      </div>
      
      {/* Stock Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-muted/30">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
            <span className="text-xs font-bold">A</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{selectedStock}</h1>
            <p className="text-sm text-muted-foreground">Apple Inc.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Market Open
          </Badge>
          <Button variant="ghost" size="sm">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};