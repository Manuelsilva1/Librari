
"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItemRowClient } from './cart-item-row-client';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, PackageX, Loader2, AlertTriangle } from 'lucide-react'; // Added Loader2, AlertTriangle
import type { Dictionary } from '@/types';

interface CartContentClientProps {
  lang: string;
  dictionary: Dictionary;
}

export function CartContentClient({ lang, dictionary }: CartContentClientProps) {
  // Updated to use new cart context structure
  const { cart, isLoading, error, getCartTotal, clearCart, getItemCount, fetchCart } = useCart();

  const texts = dictionary.cartPage || { 
    emptyCartTitle: "Your Cart is Empty",
    emptyCartMessage: "Looks like you haven't added any books yet.",
    startShopping: "Start Shopping",
    yourShoppingCart: "Your Shopping Cart",
    itemsSuffix: "items",
    clearCart: "Clear Cart",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "FREE",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    loadingCart: "Loading your cart...", // Added for loading state
    errorLoadingCart: "Error loading cart", // Added for error state
    retry: "Retry", // Added for retry button
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">{texts.loadingCart}</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h2 className="font-headline text-2xl font-semibold mb-4 text-destructive">
          {texts.errorLoadingCart}
        </h2>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Button onClick={() => fetchCart()} variant="outline"> 
          <ShoppingCart className="mr-2 h-5 w-5" /> {texts.retry}
        </Button>
      </div>
    );
  }

  // Handle empty cart (after loading and no error)
  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <PackageX className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="font-headline text-3xl font-semibold mb-4">{texts.emptyCartTitle}</h2>
        <p className="text-muted-foreground mb-8">{texts.emptyCartMessage}</p>
        <Link href={`/${lang}/catalog`} passHref legacyBehavior>
          <Button size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" /> {texts.startShopping}
          </Button>
        </Link>
      </div>
    );
  }

  // Main content when cart has items
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <ShoppingCart className="mr-3 h-7 w-7 text-primary" /> 
              {texts.yourShoppingCart} ({getItemCount()} {texts.itemsSuffix})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {/* Ensure cart.items exists before mapping */}
            {cart.items.map(item => (
              // Use item.id (CartItem's own ID) as key, assuming it's unique
              <CartItemRowClient key={item.id || item.libroId} item={item} lang={lang} dictionary={dictionary} />
            ))}
          </CardContent>
          {cart.items.length > 0 && (
            <CardFooter className="flex justify-end pt-4">
                <Button variant="outline" onClick={async () => await clearCart()} className="text-destructive hover:text-destructive/80 hover:border-destructive/50">
                  {texts.clearCart}
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <div className="md:col-span-1 space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{texts.orderSummary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>{texts.subtotal}</span>
              <span>UYU {getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{texts.shipping}</span>
              <span className="text-primary">{texts.free}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{texts.total}</span>
              <span>UYU {getCartTotal().toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            {/* Ensure cart.items is not empty before showing checkout button */}
            {cart.items.length > 0 && (
              <Link href={`/${lang}/checkout`} passHref legacyBehavior className="w-full">
                <Button size="lg" className="w-full font-headline text-lg">
                  {texts.proceedToCheckout} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
