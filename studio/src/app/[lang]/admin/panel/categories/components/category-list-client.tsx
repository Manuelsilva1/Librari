
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, PlusCircle, Tags } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface CategoryListClientProps {
  categories: Category[]; // Changed from initialCategories to categories
  onDeleteCategory: (categoryId: string | number) => Promise<void>; // ID can be string or number
  lang: string;
  texts: any; // Dictionary texts for categories
}

export function CategoryListClient({ categories, onDeleteCategory, lang, texts }: CategoryListClientProps) {
  // Removed local categories state, directly use the prop 'categories'
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  // No longer need useEffect to setCategories, as 'categories' prop will re-render the component

  const handleDeleteConfirmation = async () => {
    if (categoryToDelete && categoryToDelete.id) { // Ensure ID exists
      try {
        await onDeleteCategory(categoryToDelete.id);
        // The parent component (ManageCategoriesContent) will re-fetch and pass updated 'categories'
        toast({ title: texts.toastCategoryDeleted || "Category Deleted", description: `${categoryToDelete.nombre} has been deleted.` }); // Use nombre
      } catch (error) {
        // Error toast is handled by the parent (ManageCategoriesContent)
        // toast({ title: texts.toastError || "Error", description: `Failed to delete ${categoryToDelete.nombre}.`, variant: "destructive" });
      } finally {
        setCategoryToDelete(null);
      }
    }
  };

  // Fallback for lang if it's unexpectedly undefined.
  const currentLang = lang || 'en';

  return (
    <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => { if (!open) setCategoryToDelete(null); }}>
      <div className="space-y-6">
        <div className="flex justify-end items-center">
          <Button asChild>
            <Link href={`/${currentLang}/admin/panel/categories?action=add`}>
              <PlusCircle className="mr-2 h-4 w-4" /> {texts.addNewCategory || "Add New Category"}
            </Link>
          </Button>
        </div>

        {categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{texts.tableHeaderName || "Name"}</TableHead>
                <TableHead className="hidden md:table-cell">{texts.tableHeaderDescription || "Description"}</TableHead>
                <TableHead className="text-center">{texts.tableHeaderActions || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.nombre}</TableCell> {/* Use nombre */}
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">
                    {category.descripcion || '-'} {/* Use descripcion */}
                  </TableCell>
                  <TableCell className="text-center space-x-1">
                    <Button asChild variant="ghost" size="icon" title={texts.editCategory || "Edit Category"}>
                      <Link href={`/${currentLang}/admin/panel/categories?action=edit&id=${category.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title={texts.deleteButton || "Delete Category"} onClick={() => setCategoryToDelete(category)} disabled={!category.id}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <Tags className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{texts.noCategoriesFound || "No categories found."}</p>
            <Button asChild variant="link" className="mt-2">
                <Link href={`/${currentLang}/admin/panel/categories?action=add`}>
                    {texts.addNewCategory || "Add New Category"}
                </Link>
            </Button>
          </div>
        )}
        
        {categoryToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{texts.deleteConfirmationTitle || "Are you sure?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {(texts.deleteConfirmationMessage || "This action cannot be undone. This will permanently delete the category \"{name}\".").replace('{name}', categoryToDelete.nombre)} {/* Use nombre */}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>{texts.cancelButton || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {texts.deleteButton || "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>
    </AlertDialog>
  );
}

    