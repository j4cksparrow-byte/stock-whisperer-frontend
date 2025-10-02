import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import LoadingSpinner from './LoadingSpinner'; // Assuming you have this component

// Define the structure of the analysis data we expect from the API
interface AnalysisData {
  overallScore: number;
  recommendation: string;
  summary: string;
  fundamental: { score: number; analysis: string; };
  technical: { score: number; analysis: string; };
  sentiment: { score: number; analysis: string; };
}

export default function HybridAnalysis({ symbol }: { symbol: string }) {
  const [mode, setMode] = useState<'smart' | 'pro'>('smart');
  const [weights, setWeights] = useState({ fundamental: 40, technical: 35, sentiment: 25 });
  
  // State for API data, loading, and errors
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWeightChange = (type: keyof typeof weights, value: number[]) => {
    setWeights(prev => ({ ...prev, [type]: value[0] }));
  };

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    // Construct the API URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const endpoint = mode === 'smart' ? 'analysis' : 'enhanced-analysis';
    const url = `${apiBaseUrl}/api/stocks/${endpoint}/${symbol}`;

    try {
      const response = await fetch(url, {
        method: 'POST', // Assuming POST to send weights for 'pro' mode
        headers: { 'Content-Type': 'application/json' },
        body: mode === 'pro' ? JSON.stringify({ weights }) : null,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // The backend response might be nested, e.g., { analysis: { ... } }
      setAnalysisData(data.analysis || data); 

    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Hybrid Analysis</CardTitle>
          <Button onClick={runAnalysis} disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : `Run ${mode === 'smart' ? 'Smart' : 'Pro'} Analysis`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="smart">🧠 Smart</TabsTrigger>
            <TabsTrigger value="pro">🚀 Pro</TabsTrigger>
          </TabsList>
          <TabsContent value="smart">
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              AI-powered fundamental analysis with beginner-friendly insights.
            </p>
          </TabsContent>
          <TabsContent value="pro">
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive multi-factor analysis with customizable weights.
              </p>
              <div>
                <label>Fundamental: {weights.fundamental}%</label>
                <Slider defaultValue={[weights.fundamental]} max={100} step={5} onValueChange={(v) => handleWeightChange('fundamental', v)} />
              </div>
              <div>
                <label>Technical: {weights.technical}%</label>
                <Slider defaultValue={[weights.technical]} max={100} step={5} onValueChange={(v) => handleWeightChange('technical', v)} />
              </div>
              <div>
                <label>Sentiment: {weights.sentiment}%</label>
                <Slider defaultValue={[weights.sentiment]} max={100} step={5} onValueChange={(v) => handleWeightChange('sentiment', v)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Display Area for Results, Loading, or Errors */}
        <div className="mt-6 p-4 border rounded-md min-h-[200px] bg-gray-50 dark:bg-gray-800">
          {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /> <span className="ml-2">Analyzing...</span></div>}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {analysisData && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Analysis for {symbol} - {analysisData.recommendation} ({analysisData.overallScore}/100)</h3>
              <p><strong>AI Summary:</strong> {analysisData.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Fundamental ({analysisData.fundamental.score}/100)</CardTitle></CardHeader>
                  <CardContent>{analysisData.fundamental.analysis}</CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Technical ({analysisData.technical.score}/100)</CardTitle></CardHeader>
                  <CardContent>{analysisData.technical.analysis}</CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Sentiment ({analysisData.sentiment.score}/100)</CardTitle></CardHeader>
                  <CardContent>{analysisData.sentiment.analysis}</CardContent>
                </Card>
              </div>
            </div>
          )}
          {!isLoading && !error && !analysisData && <div className="text-center text-gray-500">Click "Run Analysis" to get started.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
