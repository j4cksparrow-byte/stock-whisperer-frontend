import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Search, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { ASX_COMPANIES } from '@/data/asxCompanies';
import { BSE_COMPANIES } from '@/data/bseCompanies';
import { NSE_COMPANIES } from '@/data/nseCompanies';
import { NYSE_COMPANIES } from '@/data/nyseCompanies';
import { NASDAQ_COMPANIES } from '@/data/companies';
import { Company } from '@/data/companies';
import { CompanyInfo } from '@/types/stockAnalysis';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedStockService from '@/services/enhancedStockService';

interface EnhancedCompanySearchProps {
  onSelect: (company: CompanyInfo) => void;
  placeholder?: string;
}

const ALL_COMPANIES = [
  ...NASDAQ_COMPANIES,
  ...ASX_COMPANIES,
  ...BSE_COMPANIES,
  ...NSE_COMPANIES,
  ...NYSE_COMPANIES
];

const EnhancedCompanySearch = ({ onSelect, placeholder = "Search for a company..." }: EnhancedCompanySearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<CompanyInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchCompanies = async () => {
      setIsLoading(true);
      try {
        // First try the enhanced API search
        const apiResults = await EnhancedStockService.searchStocks(searchTerm, 10);
        if (apiResults.suggestions.length > 0) {
          const enhancedSuggestions = apiResults.suggestions.map(suggestion => ({
            symbol: suggestion.symbol,
            name: suggestion.companyName,
            exchange: suggestion.exchange,
            sector: suggestion.sector,
            industry: suggestion.sector, // Using sector as industry for now
            marketCap: parseFloat(suggestion.marketCap.replace(/[^0-9.]/g, '')) * 1e9, // Convert to number
            employees: 0,
            website: '',
            description: '',
            ceo: '',
            founded: 0,
            headquarters: ''
          }));
          setSuggestions(enhancedSuggestions);
        } else {
          // Fallback to local search
          const filteredCompanies = ALL_COMPANIES.filter(company => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 10);

          const localSuggestions = filteredCompanies.map(company => ({
            symbol: company.symbol,
            name: company.name,
            exchange: company.exchange,
            sector: 'Unknown',
            industry: 'Unknown',
            marketCap: 0,
            employees: 0,
            website: '',
            description: '',
            ceo: '',
            founded: 0,
            headquarters: ''
          }));
          setSuggestions(localSuggestions);
        }
      } catch (error) {
        console.error('Error searching companies:', error);
        // Fallback to local search on error
        const filteredCompanies = ALL_COMPANIES.filter(company => 
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);

        const localSuggestions = filteredCompanies.map(company => ({
          symbol: company.symbol,
          name: company.name,
          exchange: company.exchange,
          sector: 'Unknown',
          industry: 'Unknown',
          marketCap: 0,
          employees: 0,
          website: '',
          description: '',
          ceo: '',
          founded: 0,
          headquarters: ''
        }));
        setSuggestions(localSuggestions);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCompanies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (company: CompanyInfo) => {
    setSearchTerm(company.name);
    setShowSuggestions(false);
    onSelect(company);
    toast({
      title: "Company Selected",
      description: `${company.name} (${company.exchange}:${company.symbol})`,
    });
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return marketCap > 0 ? `$${marketCap.toLocaleString()}` : 'N/A';
  };

  const getExchangeColor = (exchange: string) => {
    switch (exchange) {
      case 'NASDAQ': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'NYSE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ASX': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'NSE': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'BSE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />

        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div 
            className="absolute left-0 right-0 mt-1 bg-gray-800 rounded-md shadow-lg border border-gray-700" 
            style={{ zIndex: 10001 }}
          >
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  Searching companies...
                </div>
              ) : (
                suggestions.map((company, index) => (
                  <div
                    key={`${company.exchange}-${company.symbol}-${index}`}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                    onClick={() => handleSelect(company)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="font-medium text-white">{company.name}</div>
                          <div className="text-sm text-gray-400">
                            {company.exchange}:{company.symbol}
                          </div>
                        </div>
                      </div>
                      <Badge className={getExchangeColor(company.exchange)}>
                        {company.exchange}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {company.sector !== 'Unknown' && (
                          <span className="text-gray-400">{company.sector}</span>
                        )}
                        {company.marketCap > 0 && (
                          <span className="text-green-400">{formatMarketCap(company.marketCap)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {company.marketCap > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-gray-400">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCompanySearch; 