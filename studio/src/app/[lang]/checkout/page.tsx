
import { PublicLayout } from '@/components/layout/public-layout';
import { CheckoutFormClient } from './components/checkout-form-client';
import { CartProvider } from '@/context/cart-provider';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types'; // Updated import

interface CheckoutPageProps {
  params: { lang: string };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  return (
    <CartProvider> 
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto px-4 py-12">
          <CheckoutFormClient lang={lang} dictionary={dictionary} />
        </div>
      </PublicLayout>
    </CartProvider>
  );
}
