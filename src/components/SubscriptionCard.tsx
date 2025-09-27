import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Basic stock analysis features',
    features: [
      'Basic stock search',
      'Limited analysis reports',
      'Community support'
    ],
    icon: Users
  },
  premium: {
    name: 'Premium',
    price: 5,
    description: 'Unlock advanced features and insights',
    features: [
      'Unlimited stock analysis',
      'Advanced technical indicators',
      'AI-powered insights',
      'Priority support',
      'Export capabilities'
    ],
    icon: Crown
  }
};

export default function SubscriptionCard() {
  const { tier, subscribed, subscription_end, loading, createCheckout, openCustomerPortal } = useSubscription();

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(PLANS).map(([key]) => (
          <Card key={key} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-muted rounded w-full"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Object.entries(PLANS).map(([planKey, plan]) => {
        const isCurrentPlan = tier === planKey;
        const Icon = plan.icon;
        
        return (
          <Card key={planKey} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
            {isCurrentPlan && (
              <Badge className="absolute -top-2 -right-2">Current Plan</Badge>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                {isCurrentPlan && subscribed && subscription_end && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Renews on {new Date(subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {planKey === 'free' ? (
                <Button variant="outline" className="w-full" disabled>
                  {isCurrentPlan ? 'Current Plan' : 'Always Free'}
                </Button>
              ) : isCurrentPlan ? (
                <Button onClick={openCustomerPortal} className="w-full">
                  Manage Subscription
                </Button>
              ) : (
                <Button onClick={createCheckout} className="w-full">
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}