import { Suspense } from 'react';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Loader2 } from 'lucide-react';
import { ManageCustomersContent } from './components/manage-customers-content';

interface ManageCustomersPageProps { params: { lang: string } }

export default async function ManageCustomersPage({ params }: ManageCustomersPageProps) {
  const dictionary: Dictionary = await getDictionary(params.lang);
  const texts = dictionary.adminPanel?.customersPage || { title: 'Manage Customers' };
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{texts.title}</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ManageCustomersContent params={params} texts={texts} />
      </Suspense>
    </div>
  );
}
