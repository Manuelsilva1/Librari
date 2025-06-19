
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
  name: z.string().min(1, "Category name cannot be empty."),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormClientProps {
  category?: Category;
  onSave: (data: Category) => Promise<void>; 
  onDelete?: (categoryId: string) => Promise<void>;
  lang: string; 
  texts: any; // Dictionary texts for categories
}

export function CategoryFormClient({ category, onSave, onDelete, lang, texts }: CategoryFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || {
      name: '',
      description: '',
    },
  });
  
  useEffect(() => {
    if(category) {
      form.reset(category);
    } else {
      form.reset({ name: '', description: ''}); // Ensure form resets for 'add new'
    }
  }, [category, form]);

  const onSubmitHandler: SubmitHandler<CategoryFormData> = async (data) => {
    setIsSaving(true);
    try {
      const categoryToSave: Category = {
        id: category?.id || `category_${Date.now()}`, 
        ...data,
      };
      await onSave(categoryToSave); 
      // Toast for success is handled in ManageCategoriesContent after successful navigation/refresh
      // to avoid double toasts if navigation also shows one.
      // However, if onSave itself directly signals success via toast, it's fine here too.
      // Let's assume ManageCategoriesContent handles success toast on navigation.
      toast({
        title: texts.toastCategorySaved || "Category Saved!",
        description: `${data.name} has been successfully saved.`,
      });
    } catch (error: any) {
      // Error handling is now primarily in ManageCategoriesContent,
      // but specific form-level errors could be caught here if needed.
      // The generic error from there is usually sufficient.
      // console.error("Error in CategoryFormClient onSave:", error);
      // If not handled by parent, show a generic one:
      // toast({ title: texts.toastError, description: "Could not save category.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (category && onDelete) {
      setIsSaving(true);
      try {
        await onDelete(category.id);
        // Toast for success is handled in ManageCategoriesContent
      } catch (error) {
        // Error handling in ManageCategoriesContent
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{category ? texts.editCategory : texts.addNewCategory}</CardTitle>
            <CardDescription>{/* Add a description if needed */}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.categoryNameLabel}</FormLabel>
                <FormControl><Input placeholder={texts.categoryNamePlaceholder} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.categoryDescriptionLabel}</FormLabel>
                <FormControl><Textarea placeholder={texts.categoryDescriptionPlaceholder} {...field} rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {category ? texts.saveButton : texts.addButton}
            </Button>
            {category && onDelete && (
              <Button type="button" variant="destructive" size="lg" onClick={handleDelete} disabled={isSaving}>
                <Trash2 className="mr-2 h-5 w-5" /> {texts.deleteButton}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
