import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/use-subscription';

export default function SubscriptionSuccess() {
  const [countdown, setCountdown] = useState(10);
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status when landing on success page
    checkSubscription();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect after countdown
    const redirect = setTimeout(() => {
      window.location.href = '/';
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [checkSubscription]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Welcome to Premium!</CardTitle>
            <CardDescription>
              Your subscription has been activated successfully
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">You now have access to:</h3>
              <ul className="text-left space-y-1 text-sm">
                <li>• Unlimited stock analysis reports</li>
                <li>• Advanced technical indicators</li>
                <li>• AI-powered insights and recommendations</li>
                <li>• Data export capabilities</li>
                <li>• Priority customer support</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/" className="gap-2">
                  <Home className="h-4 w-4" />
                  Start Analyzing
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/subscription" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Subscription
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Redirecting to home page in {countdown} seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}