
import { PublicLayout } from '@/components/layout/public-layout';
import { CartProvider } from '@/context/cart-provider';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types'; // Updated import
import { CartContentClient } from './components/cart-content-client';

interface CartPageProps {
  params: { lang: string };
}

export default async function CartPage({ params }: CartPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  return (
    <CartProvider>
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto px-4 py-12">
           <CartContentClient lang={lang} dictionary={dictionary} />
        </div>
      </PublicLayout>
    </CartProvider>
  );
}
