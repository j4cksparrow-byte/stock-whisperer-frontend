
import React from 'react';
import { LineChart } from "lucide-react";

interface GraphLogoProps {
  size?: number;
}

const GraphLogo: React.FC<GraphLogoProps> = ({ size = 36 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg p-2 shadow-lg">
        <LineChart size={size} strokeWidth={2.5} className="text-white" />
      </div>
      <span className="font-bold text-xl text-gray-800">StockViz</span>
    </div>
  );
};

export default GraphLogo;
