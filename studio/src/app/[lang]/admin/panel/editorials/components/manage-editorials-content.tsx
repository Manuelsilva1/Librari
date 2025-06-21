
"use client";

import React, { useState, useEffect, useCallback, use } from 'react'; // Added useCallback
import { useSearchParams, useRouter } from 'next/navigation';
import type { Editorial, ApiResponseError } from '@/types'; // Added ApiResponseError
// Import actual API service functions
import {
  getEditorials as apiGetEditorials,
  createEditorial as apiCreateEditorial,
  updateEditorial as apiUpdateEditorial,
  deleteEditorial as apiDeleteEditorial
} from '@/services/api';
import { EditorialFormClient } from './editorial-form-client';
import { EditorialListClient } from './editorial-list-client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Added useToast

interface ManageEditorialsContentProps {
  params: { lang: string } | Promise<{ lang: string }>;
  initialEditorials?: Editorial[];
  texts: any;
}

export function ManageEditorialsContent({ params, initialEditorials = [], texts }: ManageEditorialsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast(); // Initialized useToast

  const { lang } = use(params); // Unwrap params

  const action = searchParams.get('action');
  const editorialId = searchParams.get('id');

  const [editorials, setEditorials] = useState<Editorial[]>(initialEditorials); // Use initial for first paint
  const [editingEditorial, setEditingEditorial] = useState<Editorial | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial list load
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [keyForForm, setKeyForForm] = useState(Date.now());

  const fetchEditorialsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedEditorials = await apiGetEditorials();
      setEditorials(fetchedEditorials);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || "Failed to load publishers.", variant: "destructive" });
      setEditorials([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, texts.toastError]);

  useEffect(() => {
    fetchEditorialsList(); // Fetch on initial mount
  }, [fetchEditorialsList]);

  useEffect(() => {
    if (action === 'edit' && editorialId) {
      const editorialToEdit = editorials.find(ed => String(ed.id) === editorialId);
      setEditingEditorial(editorialToEdit);
      if (!editorialToEdit && editorials.length > 0) {
         toast({ title: texts.toastError, description: texts.editorialNotFound || `Publisher with ID ${editorialId} not found.`, variant: "destructive"});
         router.push(`/${lang}/admin/panel/editorials`);
      }
    } else {
      setEditingEditorial(undefined);
    }
    setKeyForForm(Date.now());
  }, [action, editorialId, editorials, lang, router, toast, texts.toastError, texts.editorialNotFound]);


  const handleSaveEditorial = async (data: Partial<Editorial>) => {
    setIsFormSubmitting(true);
    try {
      if (data.id) {
        await apiUpdateEditorial(data.id, data);
        toast({ title: texts.toastEditorialSaved, description: `${data.nombre} has been updated.` });
      } else {
        await apiCreateEditorial(data);
        toast({ title: texts.toastEditorialSaved, description: `${data.nombre} has been created.` });
      }
      await fetchEditorialsList();
      router.push(`/${lang}/admin/panel/editorials`);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || texts.toastErrorEditorialSave, variant: "destructive" });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteEditorial = async (id: string | number) => {
    setIsLoading(true); // Use main loading for delete action as it affects the list
    try {
      await apiDeleteEditorial(id);
      toast({ title: texts.toastEditorialDeleted, description: `Publisher ID ${id} has been deleted.` });
      await fetchEditorialsList();
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || texts.toastErrorEditorialDelete, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && (!action || (action !== 'add' && !editingEditorial) )) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (action === 'add' || (action === 'edit' && editingEditorial)) {
    return <EditorialFormClient
              key={keyForForm}
              editorial={undefined}
              onSave={handleSaveEditorial}
              onDelete={undefined}
              lang={lang}
              texts={texts}
            />;
  }

  if (action === 'edit' && editorialId) {
    if (isLoading) { // Still loading the specific editorial
        return <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    if (editingEditorial) {
      return <EditorialFormClient
                key={keyForForm}
                editorial={editingEditorial}
                onSave={handleSaveEditorial}
                onDelete={handleDeleteEditorial}
                lang={lang}
                texts={texts}
              />;
    } else { // No longer loading, but no editorial found for editing
      return <div className="text-center py-10 text-muted-foreground">{texts.editorialNotFound || "Publisher not found or failed to load."}</div>;
    }
  }

  // Default to list view
  return (
    <EditorialListClient
      editorials={editorials}
      onDeleteEditorial={handleDeleteEditorial}
      lang={lang}
      texts={texts}
    />
  );
}
