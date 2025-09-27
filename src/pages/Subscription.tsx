import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscription } from '@/hooks/use-subscription';
import { RefreshCw } from 'lucide-react';

export default function Subscription() {
  const { checkSubscription, loading } = useSubscription();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Unlock powerful stock analysis features with our premium plan
          </p>
          <Button
            variant="outline"
            onClick={checkSubscription}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Subscription Cards */}
        <SubscriptionCard />

        {/* Features Comparison */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>
              See what's included with each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Premium</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="py-2">Stock Analysis Reports</td>
                    <td className="text-center">5 per day</td>
                    <td className="text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Technical Indicators</td>
                    <td className="text-center">Basic</td>
                    <td className="text-center">Advanced</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">AI Insights</td>
                    <td className="text-center">Limited</td>
                    <td className="text-center">Full Access</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Data Export</td>
                    <td className="text-center">-</td>
                    <td className="text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2">Priority Support</td>
                    <td className="text-center">-</td>
                    <td className="text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}