interface WeightsVisualizationProps {
  weights: {
    technical: number;
    fundamental: number;
    sentiment: number;
  };
}

export const WeightsVisualization = ({ weights }: WeightsVisualizationProps) => {
  const items = [
    { label: "Fundamental", value: weights.fundamental, color: "bg-blue-500" },
    { label: "Technical", value: weights.technical, color: "bg-purple-500" },
    { label: "Sentiment", value: weights.sentiment, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Weights
      </h4>
      
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <span className="text-sm font-bold">{item.value}%</span>
        </div>
      ))}
      
      {/* Visual bar representation */}
      <div className="flex h-2 rounded-full overflow-hidden bg-muted mt-4">
        <div 
          className="bg-blue-500" 
          style={{ width: `${weights.fundamental}%` }}
        />
        <div 
          className="bg-purple-500" 
          style={{ width: `${weights.technical}%` }}
        />
        <div 
          className="bg-orange-500" 
          style={{ width: `${weights.sentiment}%` }}
        />
      </div>
    </div>
  );
};