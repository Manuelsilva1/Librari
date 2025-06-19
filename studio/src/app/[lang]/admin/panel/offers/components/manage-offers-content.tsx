"use client";

import React, { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Offer, ApiResponseError, Book } from '@/types';
import { 
  getOffers as apiGetOffers, 
  createOffer as apiCreateOffer, 
  updateOffer as apiUpdateOffer, 
  deleteOffer as apiDeleteOffer,
  getOfferById as apiGetOfferById 
} from '@/services/api';
import { OfferListClient } from './offer-list-client';
import { OfferFormClient } from './offer-form-client';
import { OfferBookManagerClient } from './offer-book-manager-client'; // Uncommented
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManageOffersContentProps {
  params: { lang: string } | Promise<{ lang: string }>;
  // initialOffers: Offer[]; // If passing server-fetched initial data
  texts: any; // Dictionary texts for offers
}

export function ManageOffersContent({ params, texts }: ManageOffersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { lang } = use(params);

  const action = searchParams.get('action');
  const offerId = searchParams.get('id');
  const manageBooksForOfferId = searchParams.get('manageBooks');

  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [keyForForm, setKeyForForm] = useState(Date.now());

  const fetchOffersList = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedOffers = await apiGetOffers();
      setOffers(fetchedOffers);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || "Failed to load offers.", variant: "destructive" });
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, texts.toastError]);

  useEffect(() => {
    fetchOffersList();
  }, [fetchOffersList]);

  useEffect(() => {
    if (action === 'edit' && offerId) {
      setIsLoading(true); // For loading the specific offer to edit
      apiGetOfferById(offerId)
        .then(offerToEdit => {
          setEditingOffer(offerToEdit);
        })
        .catch(error => {
          const apiError = error as ApiResponseError;
          toast({ title: texts.toastError, description: apiError.message || texts.offerNotFound, variant: "destructive" });
          router.push(`/${lang}/admin/panel/offers`);
        })
        .finally(() => setIsLoading(false));
    } else {
      setEditingOffer(undefined);
    }
    setKeyForForm(Date.now());
  }, [action, offerId, lang, router, toast, texts.toastError, texts.offerNotFound]);

  const handleSaveOffer = async (data: Partial<Offer>) => {
    setIsFormSubmitting(true);
    try {
      const payload = { ...data };
      // Ensure discount is a number if it's coming from a text input
      if (payload.descuento && typeof payload.descuento === 'string') {
        payload.descuento = parseFloat(payload.descuento);
      }
      
      if (payload.id) {
        await apiUpdateOffer(payload.id, payload);
        toast({ title: texts.toastOfferSaved, description: `${payload.descripcion || 'Offer'} has been updated.` });
      } else {
        await apiCreateOffer(payload as Omit<Offer, 'id'>); // Assert type for create
        toast({ title: texts.toastOfferSaved, description: `${payload.descripcion || 'New Offer'} has been created.` });
      }
      await fetchOffersList();
      router.push(`/${lang}/admin/panel/offers`);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || "Could not save offer.", variant: "destructive" });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: string | number) => {
    setIsLoading(true);
    try {
      await apiDeleteOffer(id);
      toast({ title: texts.toastOfferDeleted, description: `Offer ID ${id} has been deleted.` });
      await fetchOffersList();
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || "Could not delete offer.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !editingOffer && action !== 'add') {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (manageBooksForOfferId) { // If this URL param is present, show the book manager
    return <OfferBookManagerClient offerId={manageBooksForOfferId} texts={texts} lang={lang} />;
  }

  if (action === 'add' || (action === 'edit' && editingOffer)) {
    return <OfferFormClient
              key={keyForForm}
              offer={editingOffer}
              onSave={handleSaveOffer}
              isSubmitting={isFormSubmitting}
              texts={texts}
              lang={lang}
            />;
  }
  
  if (action === 'edit' && !editingOffer && !isLoading) {
     // Handled by useEffect redirecting or could show a "not found" specific message
     return <div className="text-center py-10 text-muted-foreground">{texts.offerNotFound || "Offer not found or failed to load."}</div>;
  }


  return <OfferListClient
            offers={offers}
            onDeleteOffer={handleDeleteOffer}
            texts={texts}
            lang={lang}
          />;
}
