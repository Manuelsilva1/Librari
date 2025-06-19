
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Editorial } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const editorialSchema = z.object({
  // API Editorial type has 'nombre' and 'sitioWeb' (optional)
  nombre: z.string().min(2, "Publisher name must be at least 2 characters"),
  sitioWeb: z.string().url("Must be a valid URL (e.g., https://example.com)").optional().or(z.literal('')).nullable(),
});

type EditorialFormData = z.infer<typeof editorialSchema>;

interface EditorialFormClientProps {
  editorial?: Editorial; // This is the API Editorial type
  onSave: (data: Partial<Editorial>) => Promise<void>; // Payload for save can be Partial
  onDelete?: (editorialId: string | number) => Promise<void>; // ID can be string or number
  lang: string; 
  texts: any; 
}

export function EditorialFormClient({ editorial, onSave, onDelete, lang, texts }: EditorialFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditorialFormData>({
    resolver: zodResolver(editorialSchema),
    defaultValues: editorial ? {
      nombre: editorial.nombre || '',
      sitioWeb: editorial.sitioWeb || '',
    } : {
      nombre: '',
      sitioWeb: '',
    },
  });
  
  useEffect(() => {
    if(editorial) {
      form.reset({
        nombre: editorial.nombre || '',
        sitioWeb: editorial.sitioWeb || '',
      });
    } else {
      form.reset({ nombre: '', sitioWeb: '' });
    }
  }, [editorial, form]);

  const onSubmitHandler: SubmitHandler<EditorialFormData> = async (formData) => {
    setIsSaving(true);
    try {
      const editorialToSave: Partial<Editorial> = {
        id: editorial?.id, // Include ID if it's an update
        nombre: formData.nombre,
        sitioWeb: formData.sitioWeb || undefined, // Ensure empty string becomes undefined if API expects that for optional fields
      };
      await onSave(editorialToSave);
      toast({
        title: texts.toastEditorialSaved || "Publisher Saved!",
        description: `${formData.nombre} has been successfully saved.`, // Use formData.nombre
      });
      // Navigation handled by parent page which reloads data or redirects
    } catch (error) {
      console.error("Error saving publisher:", error);
      toast({
        title: texts.toastError || "Save Failed",
        description: "Could not save publisher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editorial && onDelete) {
      setIsSaving(true);
      try {
        await onDelete(editorial.id);
        toast({
          title: texts.toastEditorialDeleted || "Publisher Deleted",
          description: `${editorial.name} has been deleted.`,
        });
        // Navigation handled by parent page
      } catch (error) {
        toast({
          title: texts.toastError || "Delete Failed",
          description: "Could not delete publisher.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{editorial ? texts.editEditorial : texts.addNewEditorial}</CardTitle>
            <CardDescription>Fill in the publisher details.</CardDescription> {/* Updated description */}
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="nombre" render={({ field }) => ( // Changed name to nombre
              <FormItem>
                <FormLabel>{texts.editorialNameLabel}</FormLabel>
                <FormControl><Input placeholder={texts.editorialNamePlaceholder} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sitioWeb" render={({ field }) => ( // Added sitioWeb
              <FormItem>
                <FormLabel>Website URL (Optional)</FormLabel> 
                <FormControl><Input placeholder="https://example.com" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Removed fields: contactPerson, email, phone, address, notes */}
          </CardContent>
          <CardFooter className="flex justify-start"> {/* Changed from justify-between */}
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {editorial ? texts.saveButton : texts.addButton}
            </Button>
            {/* Delete button is handled by list view / parent component */}
            {/* {editorial && onDelete && (
              <Button type="button" variant="destructive" size="lg" onClick={handleDelete} disabled={isSaving}>
                <Trash2 className="mr-2 h-5 w-5" /> {texts.deleteButton}
              </Button>
            )} */}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
