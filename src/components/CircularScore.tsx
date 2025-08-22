import React from 'react';

interface CircularScoreProps {
  score: number | null;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export const CircularScore = ({ 
  score, 
  label, 
  size = 120, 
  strokeWidth = 8 
}: CircularScoreProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = score ? score / 100 : 0;
  const offset = circumference - percentage * circumference;

  const getColor = (score: number | null) => {
    if (!score) return 'hsl(var(--muted))';
    if (score >= 70) return 'hsl(142 76% 36%)'; // green
    if (score >= 40) return 'hsl(48 96% 53%)'; // yellow
    return 'hsl(0 84% 60%)'; // red
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Score text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className="text-3xl font-bold"
          style={{ color }}
        >
          {score ? Math.round(score) : '--'}
        </div>
        <div className="text-sm text-muted-foreground mt-1 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
};