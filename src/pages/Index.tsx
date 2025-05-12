
import StockAnalysis from "@/components/StockAnalysis";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Stock <span className="text-finance-accent">Analysis</span> Dashboard
          </h1>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Get detailed analysis and insights for any publicly traded company
          </p>
        </div>
        
        <StockAnalysis />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Data provided for informational purposes only. Not financial advice.</p>
          <p className="mt-1">© {new Date().getFullYear()} Stock Analysis Dashboard</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
