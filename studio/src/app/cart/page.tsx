"use client";

import { PublicLayout } from '@/components/layout/public-layout';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItemRowClient } from './components/cart-item-row-client';
// import { OfferAssistantClient } from './components/offer-assistant-client'; // AI Offer Assistant Removed
import Link from 'next/link';
import { ShoppingCart, ArrowRight, PackageX } from 'lucide-react';
import { CartProvider } from '@/context/cart-provider'; 

function CartPageContent() {
  const { cartItems, getCartTotal, clearCart, getItemCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <PackageX className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="font-headline text-3xl font-semibold mb-4">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any books yet.</p>
        <Link href="/catalog" passHref legacyBehavior>
          <Button size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" /> Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <ShoppingCart className="mr-3 h-7 w-7 text-primary" /> Your Shopping Cart ({getItemCount()} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {cartItems.map(item => (
              <CartItemRowClient key={item.book.id} item={item} />
            ))}
          </CardContent>
          {cartItems.length > 0 && (
            <CardFooter className="flex justify-end pt-4">
                <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive/80 hover:border-destructive/50">
                  Clear Cart
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <div className="md:col-span-1 space-y-8">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-primary">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/checkout" passHref legacyBehavior className="w-full">
              <Button size="lg" className="w-full font-headline text-lg">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        {/* <OfferAssistantClient /> // AI Offer Assistant Removed */}
      </div>
    </div>
  );
}


export default function CartPage() {
  return (
    <CartProvider>
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
           <CartPageContent />
        </div>
      </PublicLayout>
    </CartProvider>
  );
}
