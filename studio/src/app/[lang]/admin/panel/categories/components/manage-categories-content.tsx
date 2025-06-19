
"use client";

import React, { useState, useEffect, useCallback, use } from 'react'; // Added useCallback
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Category, ApiResponseError } from '@/types'; // Added ApiResponseError
// Import actual API service functions
import { 
  getCategories as apiGetCategories, 
  createCategory as apiCreateCategory, 
  updateCategory as apiUpdateCategory, 
  deleteCategory as apiDeleteCategory 
} from '@/services/api';
import { CategoryFormClient } from './category-form-client';
import { CategoryListClient } from './category-list-client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManageCategoriesContentProps {
  params: { lang: string } | Promise<{ lang: string }>; // lang is now string, not string | undefined
  initialCategories?: Category[];
  texts: any; // Dictionary texts for categories
}

export function ManageCategoriesContent({ params, initialCategories = [], texts }: ManageCategoriesContentProps) {
  const router = useRouter();
  const pathname = usePathname(); // Retained for potential future use, but lang is primary
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { lang } = use(params); // Unwrap params

  const action = searchParams.get('action');
  const categoryId = searchParams.get('id');

  const [categories, setCategories] = useState<Category[]>(initialCategories); // Still use initialCategories for first paint
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // Start true to load initial list
  const [isFormSubmitting, setIsFormSubmitting] = useState(false); // For form save operations
  const [keyForForm, setKeyForForm] = useState(Date.now());

  const fetchCategoriesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await apiGetCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || "Failed to load categories.", variant: "destructive" });
      setCategories([]); // Set to empty or keep stale data on error
    } finally {
      setIsLoading(false);
    }
  }, [toast, texts.toastError]);

  useEffect(() => {
    fetchCategoriesList(); // Fetch on initial mount
  }, [fetchCategoriesList]);

  useEffect(() => {
    if (action === 'edit' && categoryId) {
      // Find category from the already fetched list.
      // No separate getCategoryById API endpoint is assumed for this refactor.
      const categoryToEdit = categories.find(cat => String(cat.id) === categoryId);
      setEditingCategory(categoryToEdit);
      if (!categoryToEdit && categories.length > 0) { // Only toast if categories were loaded but not found
         toast({ title: texts.toastError, description: `Category with ID ${categoryId} not found.`, variant: "destructive"});
         router.push(`/${lang}/admin/panel/categories`);
      }
    } else {
      setEditingCategory(undefined);
    }
    setKeyForForm(Date.now()); // Reset form when action or categoryId changes
  }, [action, categoryId, categories, lang, router, toast, texts.toastError]);


  const handleSaveCategory = async (data: Partial<Category>) => { // Data can be Partial for create/update
    setIsFormSubmitting(true);
    try {
      if (data.id) { // Existing ID means update
        await apiUpdateCategory(data.id, data);
        toast({ title: texts.toastCategorySaved, description: `${data.nombre} has been updated.` });
      } else { // No ID means create
        await apiCreateCategory(data);
        toast({ title: texts.toastCategorySaved, description: `${data.nombre} has been created.` });
      }
      await fetchCategoriesList(); // Refresh category list
      router.push(`/${lang}/admin/panel/categories`); // Navigate back to list view
    } catch (error) {
      const apiError = error as ApiResponseError;
      let errorDesc = apiError.message || "Could not save category.";
      // Example: if (apiError.details?.includes("DUPLICATE_CATEGORY_NAME") && texts.errorDuplicateName) { errorDesc = texts.errorDuplicateName; }
      toast({ title: texts.toastError, description: errorDesc, variant: "destructive" });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string | number) => { // ID can be string or number
    // Consider a specific loading state for delete if needed, or use global isLoading
    setIsLoading(true); 
    try {
      await apiDeleteCategory(id);
      toast({ title: texts.toastCategoryDeleted, description: `Category ID ${id} has been deleted.` });
      await fetchCategoriesList(); // Refresh category list
      // No need to navigate if already on the list page and it refreshes
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: texts.toastError, description: apiError.message || "Could not delete category.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && (!action || (action !== 'add' && !editingCategory) )) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (action === 'add' || (action === 'edit' && editingCategory)) {
    return <CategoryFormClient
              key={keyForForm}
              category={undefined}
              onSave={handleSaveCategory}
              onDelete={undefined}
              lang={lang}
              texts={texts}
            />;
  }

  if (action === 'edit' && categoryId) {
    // If still loading specifically for the edit form after the initial check
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }
    if (editingCategory) {
      return <CategoryFormClient
                key={keyForForm}
                category={editingCategory}
                onSave={handleSaveCategory}
                onDelete={handleDeleteCategory}
                lang={lang}
                texts={texts}
              />;
    } else { // No longer loading, but no category found for editing
      return <div className="text-center py-10 text-muted-foreground">Category not found or failed to load.</div>;
    }
  }

  // Default to list view
  return <CategoryListClient
            categories={categories}
            onDeleteCategory={handleDeleteCategory}
            lang={lang}
            texts={texts}
          />;
}

