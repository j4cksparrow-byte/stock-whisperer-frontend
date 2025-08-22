import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import CompanySearch from "./CompanySearch";
import { Company } from "@/data/companies";

interface UnifiedStockInputProps {
  onAnalyze: (company: Company) => void;
  isLoading?: boolean;
}

const UnifiedStockInput = ({ onAnalyze, isLoading }: UnifiedStockInputProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompany) {
      onAnalyze(selectedCompany);
    }
  };

  return (
    <Card className="glass-card border-t-4 border-t-blue-600 mb-8">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900">
        <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-center">
          Stock Analysis Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="company-search" className="block text-sm font-medium text-gray-300 mb-1">
              Search Company
            </label>
            <CompanySearch
              onSelect={setSelectedCompany}
              placeholder="Type company name or symbol..."
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !selectedCompany}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            {isLoading ? (
              "Analyzing..."
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Stock
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UnifiedStockInput;