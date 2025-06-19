
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Import Category, Editorial, and Book types from @/types
import type { Book, Editorial, Category, ApiResponseError } from '@/types'; 
// Import API service functions
import { getEditorials as apiGetEditorials, getCategories as apiGetCategories } from '@/services/api'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { Loader2, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const bookSchema = z.object({
  titulo: z.string().min(3, "Title must be at least 3 characters"), // Changed from title
  autor: z.string().min(3, "Author name must be at least 3 characters"), // Changed from author
  isbn: z.string().optional().nullable(), // Optional and can be null
  precio: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Price cannot be negative")
  ),
  stock: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(0, "Stock cannot be negative")
  ),
  editorialId: z.string().optional().nullable(), // Can be null or empty string for 'No Publisher'
  categoriaId: z.string({ required_error: "Category is required." }).min(1,"Category is required."), // Category is required
  descripcion: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long").optional().nullable(),
  coverImage: z.string().url("Must be a valid URL for cover image (e.g., https://placehold.co/...)").optional().nullable(),
  // Removed: genre, targetAudience, themes, content, publishedYear as they are not in the core API Book type (as per types/index.ts)
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormClientProps {
  book?: Book; // This is the API Book type
  onSave: (data: Partial<Book>) => Promise<void>; // Data for save can be Partial<Book>
  // onDelete is removed as parent page's ManageBooksContent will handle delete button visibility and action if needed.
  // For this refactor, we assume parent handles delete.
  lang: string; 
  isLoadingExternally?: boolean; 
}

export function BookFormClient({ book, onSave, lang, isLoadingExternally }: BookFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingSelectData, setIsFetchingSelectData] = useState(true); // For editorials/categories
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // State for categories
  const { toast } = useToast();
  const router = useRouter(); // Keep if needed for local navigation within form parts, though parent handles main nav

  useEffect(() => {
    async function fetchSelectData() {
      setIsFetchingSelectData(true);
      try {
        const [editorialsData, categoriesData] = await Promise.all([
          apiGetEditorials(),
          apiGetCategories()
        ]);
        setEditorials(editorialsData);
        setCategories(categoriesData);
      } catch (error) {
        const apiError = error as ApiResponseError;
        console.error("Error fetching editorials or categories:", apiError);
        toast({ title: "Error", description: `Failed to load editorials/categories: ${apiError.message}`, variant: "destructive" });
      } finally {
        setIsFetchingSelectData(false);
      }
    }
    fetchSelectData();
  }, [toast]); // Removed dependency on 'lang', assuming these are not lang-specific

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book ? {
      // Map API Book fields to form fields
      titulo: book.titulo || '',
      autor: book.autor || '',
      isbn: book.isbn || '',
      precio: book.precio ?? 0,
      stock: book.stock ?? 0,
      editorialId: book.editorialId || null, // Use null for empty Select value if appropriate
      categoriaId: book.categoriaId ? String(book.categoriaId) : '', // Ensure string for Select
      descripcion: book.descripcion || '',
      coverImage: book.coverImage || 'https://placehold.co/300x450.png',
    } : {
      // Default values for a new book form
      titulo: '',
      autor: '',
      isbn: '',
      precio: 0,
      stock: 0,
      editorialId: null, // Default to null for Select
      categoriaId: '',   // Default to empty string for Select
      descripcion: '',
      coverImage: 'https://placehold.co/300x450.png',
    },
  });
  
  useEffect(() => {
    // Reset form when 'book' prop changes (e.g., when selecting a book to edit)
    if (book) {
      form.reset({
        titulo: book.titulo || '',
        autor: book.autor || '',
        isbn: book.isbn || '',
        precio: book.precio ?? 0,
        stock: book.stock ?? 0,
        editorialId: book.editorialId || null,
        categoriaId: book.categoriaId ? String(book.categoriaId) : '',
        descripcion: book.descripcion || '',
        coverImage: book.coverImage || 'https://placehold.co/300x450.png',
      });
    } else {
      // Reset to default for 'new book' form if `book` becomes undefined
      form.reset({
        titulo: '', autor: '', isbn: '', precio: 0, stock: 0, editorialId: null, categoriaId: '', descripcion: '', coverImage: 'https://placehold.co/300x450.png',
      });
    }
  }, [book, form]);

  const onSubmitHandler: SubmitHandler<BookFormData> = async (formData) => {
    setIsSaving(true);
    try {
      // Construct the payload for the API (Partial<Book>)
      const bookToSave: Partial<Book> = {
        id: book?.id, // Include ID if it's an update
        titulo: formData.titulo,
        autor: formData.autor,
        isbn: formData.isbn || undefined,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        editorialId: formData.editorialId || undefined,
        categoriaId: formData.categoriaId, // This is already a string from the form
        descripcion: formData.descripcion || undefined,
        coverImage: formData.coverImage || undefined,
      };
      await onSave(bookToSave); // onSave is passed from parent, handles create/update
      toast({
        title: book ? "Book Updated!" : "Book Added!",
        description: `${formData.titulo} has been successfully saved.`, // Use formData.titulo
      });
      // router.push(`/${lang}/admin/panel/books`); // Navigation handled by parent page which reloads
    } catch (error) {
      console.error("Error saving book:", error);
      toast({
        title: "Save Failed",
        description: "Could not save book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (book && onDelete) {
      setIsSaving(true);
      try {
        await onDelete(book.id);
        toast({
          title: "Book Deleted",
          description: `${book.title} has been deleted.`,
        });
        // router.push(`/${lang}/admin/panel/books`); // Navigation handled by parent page
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Could not delete book.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{book ? 'Edit Book' : 'Add New Book'}</CardTitle>
            <CardDescription>Fill in the details for the book.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(isLoadingExternally || isFetchingSelectData) && (
              <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading form data...</p>
              </div>
            )}
            {!isLoadingExternally && !isFetchingSelectData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="titulo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="Book Title" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="autor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl><Input placeholder="Author Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="categoriaId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="editorialId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                        value={field.value ?? 'none'}
                        defaultValue={field.value ?? 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a publisher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Publisher</SelectItem>
                          {editorials.map((editorial) => (
                            <SelectItem key={editorial.id} value={String(editorial.id)}>
                              {editorial.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="isbn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN (Optional)</FormLabel>
                      <FormControl><Input placeholder="978-xxxxxxxxxx" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="descripcion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Book description..." {...field} value={field.value ?? ''} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="coverImage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://placehold.co/300x450.png" {...field} value={field.value ?? ''} /></FormControl>
                    <FormDescription>Use a placeholder service like placehold.co or a direct image link.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed from 3 to 2 cols */}
                  <FormField control={form.control} name="precio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (UYU)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl><Input type="number" step="1" placeholder="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-start"> {/* Changed from justify-between */}
            <Button type="submit" size="lg" disabled={isSaving || isFetchingSelectData || isLoadingExternally}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {book ? 'Save Changes' : 'Add Book'}
            </Button>
            {/* Delete button is removed from here, handled by parent/list view */}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
