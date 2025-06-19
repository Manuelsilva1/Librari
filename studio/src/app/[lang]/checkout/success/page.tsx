import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';

interface CheckoutSuccessPageProps {
  params: { lang: string };
  searchParams?: {
    orderId?: string;
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: CheckoutSuccessPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  const orderId = searchParams?.orderId;

  // Basic texts, ideally these would come from the dictionary
  const texts = {
    title: dictionary.checkoutForm?.orderSubmittedTitle || "Order Submitted Successfully!",
    description: dictionary.checkoutForm?.orderSubmittedDescription || "Thank you for your purchase.",
    confirmation: dictionary.checkoutForm?.orderSubmittedConfirmation || "You will receive an email confirmation shortly.",
    orderIdText: "Order ID",
    continueShopping: dictionary.checkoutForm?.continueShopping || "Continue Shopping",
    viewOrders: "View My Orders" // Add to dictionary if needed
  };

  return (
    <PublicLayout lang={lang} dictionary={dictionary}>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-lg text-center shadow-xl rounded-lg">
          <CardHeader>
            <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
            <CardTitle className="font-headline text-3xl md:text-4xl">{texts.title}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              {texts.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderId && (
              <div className="p-4 bg-secondary/50 rounded-md">
                <p className="text-sm font-medium text-secondary-foreground">
                  {texts.orderIdText}: <span className="font-bold text-primary">{orderId}</span>
                </p>
              </div>
            )}
            <p className="text-muted-foreground">{texts.confirmation}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link href={`/${lang}/catalog`} passHref legacyBehavior>
                <Button size="lg" variant="outline">
                  <ShoppingBag className="mr-2 h-5 w-5" /> {texts.continueShopping}
                </Button>
              </Link>
              {/* Assuming a sales history page might exist at /sales/history or similar */}
              {/* Update this link if your sales history page has a different route */}
              <Link href={`/${lang}/sales/history`} passHref legacyBehavior>
                <Button size="lg">
                  {texts.viewOrders}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
