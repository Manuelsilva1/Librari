import { getDictionary } from '@/lib/dictionaries';
import { OrdersListClient } from './components/orders-list-client';

interface AdminOrdersPageProps {
  params: { lang: string };
}

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  const texts = dictionary.adminPanel?.ordersPage || { title: 'Orders', customerName: 'Customer' };
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{texts.title}</h1>
      <OrdersListClient texts={texts} />
    </div>
  );
}
