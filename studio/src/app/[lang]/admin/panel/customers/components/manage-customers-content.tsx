"use client";

import { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { User, ApiResponseError } from '@/types';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/services/api';
import { CustomerFormClient } from './customer-form-client';
import { CustomerListClient } from './customer-list-client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManageCustomersContentProps {
  params: { lang: string } | Promise<{ lang: string }>;
  texts: any;
}

export function ManageCustomersContent({ params, texts }: ManageCustomersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { lang } = use(params);
  const action = searchParams.get('action');
  const customerId = searchParams.get('id');

  const [customers, setCustomers] = useState<User[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [keyForForm, setKeyForForm] = useState(Date.now());

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, texts.toastError]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    if (action === 'edit' && customerId) {
      const toEdit = customers.find(u => String(u.id) === customerId);
      setEditingCustomer(toEdit);
    } else {
      setEditingCustomer(undefined);
    }
    setKeyForForm(Date.now());
  }, [action, customerId, customers]);

  const handleSave = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      if (data.id) await updateCustomer(data.id, data);
      else await createCustomer(data);
      toast({ title: texts.toastCustomerSaved });
      await fetchCustomers();
      router.push(`/${lang}/admin/panel/customers`);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string | number) => {
    setIsLoading(true);
    try {
      await deleteCustomer(id);
      toast({ title: texts.toastCustomerDeleted });
      await fetchCustomers();
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  if (isLoading && (!action || (action !== 'add' && !editingCustomer))) {
    return (<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>);
  }

  if (action === 'add' || (action === 'edit' && editingCustomer)) {
    return <CustomerFormClient key={keyForForm} customer={editingCustomer} onSave={handleSave} onDelete={action === 'edit' ? handleDelete : undefined} lang={lang} texts={texts} />;
  }

  return <CustomerListClient customers={customers} onDeleteCustomer={handleDelete} lang={lang} texts={texts} />;
}
