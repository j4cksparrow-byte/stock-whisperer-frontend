interface SentimentBarProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export const SentimentBar = ({ score, size = "md" }: SentimentBarProps) => {
  const getSentimentColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBarHeight = () => {
    switch (size) {
      case "sm": return "h-2";
      case "lg": return "h-6";
      default: return "h-4";
    }
  };

  const segments = Array.from({ length: 10 }, (_, i) => {
    const segmentValue = (i + 1) * 10;
    const isActive = score >= segmentValue - 5;
    
    return (
      <div
        key={i}
        className={`flex-1 mx-0.5 rounded-sm transition-colors ${
          isActive 
            ? getSentimentColor(score)
            : "bg-muted"
        } ${getBarHeight()}`}
      />
    );
  });

  return (
    <div className="w-full">
      <div className="flex items-center space-x-1">
        {segments}
      </div>
      {size !== "sm" && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      )}
    </div>
  );
};