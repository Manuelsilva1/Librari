
"use client";

// This component's AI functionality has been removed.
// It can be deleted or modified to show static offers or other content.

import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

export function OfferAssistantClient() {
  const { cartItems } = useCart();
  
  // AI offer suggestion logic has been removed.
  // This component will now show a generic message or could be removed entirely.

  if (cartItems.length === 0) return null;

  return (
    <Card className="mt-8 shadow-lg rounded-lg bg-accent/10 border-accent">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center text-primary">
          <Tag className="mr-2 h-5 w-5" /> Special Offers
        </CardTitle>
        <CardDescription>Check back often for new deals!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Keep an eye out for special deals! Browse our catalog for great prices.</p>
        {/* You could list static/manually curated offers here */}
      </CardContent>
    </Card>
  );
}
