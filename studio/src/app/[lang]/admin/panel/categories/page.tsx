
// src/app/[lang]/admin/panel/categories/page.tsx
import { Suspense } from 'react';
import type { Dictionary } from '@/types';
// Removed mock import: import { getCategories } from '@/lib/mock-data';
import { getDictionary } from '@/lib/dictionaries';
import { Loader2 } from 'lucide-react';
import { ManageCategoriesContent } from './components/manage-categories-content';

interface ManageCategoriesPageProps {
  params: any;
}

export default async function ManageCategoriesPage({ params }: ManageCategoriesPageProps) {
  const dictionary: Dictionary = await getDictionary(params.lang);
  const categoryTexts = dictionary.adminPanel?.categoriesPage || {
    title: "Manage Categories",
    addNewCategory: "Add New Category",
    editCategory: "Edit Category",
    categoryNameLabel: "Category Name",
    categoryNamePlaceholder: "e.g., Fiction, History",
    categoryDescriptionLabel: "Description (Optional)",
    categoryDescriptionPlaceholder: "Briefly describe the category...",
    deleteConfirmationTitle: "Are you sure?",
    deleteConfirmationMessage: "This will permanently delete the category \"{name}\". This action cannot be undone.",
    deleteButton: "Delete Category",
    cancelButton: "Cancel",
    saveButton: "Save Category",
    addButton: "Add Category",
    noCategoriesFound: "No categories found.",
    tableHeaderName: "Name",
    tableHeaderDescription: "Description",
    tableHeaderActions: "Actions",
    toastCategorySaved: "Category Saved!",
    toastCategoryDeleted: "Category Deleted!",
    toastError: "An error occurred",
    errorDuplicateName: "A category with this name already exists."
  };
  // initialCategoriesData is no longer fetched here; ManageCategoriesContent fetches client-side.
  // const initialCategoriesData = await getCategories(); 

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{categoryTexts.title}</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ManageCategoriesContent
            params={params}
            // initialCategories is not passed anymore, client component fetches its own data.
            // initialCategories={initialCategoriesData || []} 
            texts={categoryTexts}
        />
      </Suspense>
    </div>
  );
}
