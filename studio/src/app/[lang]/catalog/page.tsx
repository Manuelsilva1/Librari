
import { PublicLayout } from '@/components/layout/public-layout';
import { CartProvider } from '@/context/cart-provider';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types'; // Updated import
import { CatalogContentClient } from './components/catalog-content-client';

interface CatalogPageProps {
  params: { lang: string };
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  return (
    <CartProvider> 
      <PublicLayout lang={lang} dictionary={dictionary}>
        <CatalogContentClient lang={lang} dictionary={dictionary} />
      </PublicLayout>
    </CartProvider>
  );
}
