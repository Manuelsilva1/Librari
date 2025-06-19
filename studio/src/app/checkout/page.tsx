"use client"; // Required because CartProvider and CheckoutFormClient are client components

import { PublicLayout } from '@/components/layout/public-layout';
import { CheckoutFormClient } from './components/checkout-form-client';
import { CartProvider } from '@/context/cart-provider'; // CheckoutFormClient uses useCart

export default function CheckoutPage() {
  return (
    <CartProvider> {/* Ensure CartProvider wraps components that use useCart */}
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <CheckoutFormClient />
        </div>
      </PublicLayout>
    </CartProvider>
  );
}
