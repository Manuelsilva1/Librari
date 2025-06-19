"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Sale, ApiResponseError } from '@/types';
import { getAdminSales, getAdminSaleById } from '@/services/api';
import { SalesListClient } from './sales-list-client';
import { SaleDetailClient } from './sale-detail-client';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ManageSalesContentProps {
  params: { lang: string };
  texts: any; // Dictionary texts for sales admin
}

export function ManageSalesContent({ params, texts }: ManageSalesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { lang } = params;

  const view = searchParams.get('view');
  const saleId = searchParams.get('id');

  const [sales, setSales] = useState<Sale[]>([]);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSales = await getAdminSales();
      setSales(fetchedSales);
    } catch (err) {
      const apiError = err as ApiResponseError;
      setError(apiError.message || texts.errorLoadingSales || "Failed to load sales.");
      toast({ title: texts.errorLoadingSales, description: apiError.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [texts.errorLoadingSales, toast]);

  const fetchSaleDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentSale(null);
    try {
      const fetchedSale = await getAdminSaleById(id);
      setCurrentSale(fetchedSale);
    } catch (err) {
      const apiError = err as ApiResponseError;
      setError(apiError.message || texts.saleNotFound || "Sale not found.");
      toast({ title: texts.saleNotFound, description: apiError.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [texts.saleNotFound, toast]);

  useEffect(() => {
    if (view === 'detail' && saleId) {
      fetchSaleDetail(saleId);
    } else {
      fetchAllSales();
      setCurrentSale(null); // Clear detail view when going back to list
    }
  }, [view, saleId, fetchAllSales, fetchSaleDetail]);
  
  const handleRetry = () => {
    if (view === 'detail' && saleId) {
      fetchSaleDetail(saleId);
    } else {
      fetchAllSales();
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">{texts.loadingSales || "Loading..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-4" />
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">Retry</Button>
      </div>
    );
  }

  if (view === 'detail' && currentSale) {
    return <SaleDetailClient sale={currentSale} texts={texts} lang={lang} />;
  }

  // Default to list view
  return <SalesListClient sales={sales} texts={texts} lang={lang} />;
}
