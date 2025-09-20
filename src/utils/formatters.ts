export const formatScore = (score: number | null | undefined): string => {
  return score !== null && score !== undefined ? score.toFixed(1) : 'N/A';
};

export const formatCurrency = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};