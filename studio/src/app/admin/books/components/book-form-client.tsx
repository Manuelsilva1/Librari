
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Book } from '@/types';
// import { generateBookDescription, type GenerateBookDescriptionInput } from '@/ai/flows/auto-generate-book-description'; // AI Import Removed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, Trash2, Info } from 'lucide-react'; // Sparkles icon removed
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // For redirecting after save/delete

const bookSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  author: z.string().min(3, "Author name must be at least 3 characters"),
  genre: z.string().min(2, "Genre is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  coverImage: z.string().optional().nullable(),
  coverImageFile: z.any().optional(),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Price cannot be negative")
  ),
  stock: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(0, "Stock cannot be negative")
  ),
  targetAudience: z.string().optional(),
  themes: z.string().optional().transform(val => val ? val.split(',').map(t => t.trim()).filter(t => t) : []), // Comma-separated string to array
  content: z.string().optional().describe("Full book content or extended summary for AI summary generation"),
  publishedYear: z.preprocess(
    (val) => (String(val) === '' ? undefined : parseInt(String(val),10)),
    z.number().int().min(1000).max(new Date().getFullYear() + 5).optional()
  ),
  isbn: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormClientProps {
  book?: Book;
  onSave: (data: Book & { coverImageFile?: File }) => Promise<void>;
  onDelete?: (bookId: string) => Promise<void>;
}

export function BookFormClient({ book, onSave, onDelete }: BookFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  // const [isGeneratingDesc, setIsGeneratingDesc] = useState(false); // AI State Removed
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book ? {
      ...book,
      price: book.price ?? 0,
      stock: book.stock ?? 0,
      themes: book.themes?.join(', ') ?? '',
      publishedYear: book.publishedYear ?? undefined,
    } : {
      title: '',
      author: '',
      genre: '',
      description: '',
      coverImage: '',
      coverImageFile: undefined,
      price: 0,
      stock: 0,
      targetAudience: '',
      themes: '',
      content: '',
      publishedYear: undefined,
      isbn: '',
    },
  });
  
  useEffect(() => {
    if(book) {
      form.reset({
        ...book,
        price: book.price ?? 0,
        stock: book.stock ?? 0,
        themes: book.themes?.join(', ') ?? '',
        publishedYear: book.publishedYear ?? undefined,
        coverImageFile: undefined,
      });
    }
  }, [book, form]);

  // AI Description Generation Function Removed
  // const handleGenerateDescription = async () => { ... };

  const onSubmitHandler: SubmitHandler<BookFormData> = async (data) => {
    setIsSaving(true);
    try {
      const themesArray = typeof data.themes === 'string' ? data.themes.split(',').map(t => t.trim()).filter(t => t) : data.themes;
      const bookToSave: Book & { coverImageFile?: File } = {
        id: book?.id || String(Date.now()),
        ...data,
        themes: themesArray,
        price: Number(data.price),
        stock: Number(data.stock),
        publishedYear: data.publishedYear ? Number(data.publishedYear) : undefined,
        coverImageFile: data.coverImageFile as File | undefined,
      };
      await onSave(bookToSave);
      toast({
        title: book ? "Book Updated!" : "Book Added!",
        description: `${data.title} has been successfully saved.`,
      });
      router.push('/admin/books');
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
        router.push('/admin/books');
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Book Title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="author" render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl><Input placeholder="Author Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField control={form.control} name="genre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl><Input placeholder="e.g., Fiction, Fantasy" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isbn" render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN (Optional)</FormLabel>
                  <FormControl><Input placeholder="978-xxxxxxxxxx" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Description</FormLabel>
                  {/* AI Generate Button Removed */}
                </div>
                <FormControl><Textarea placeholder="Book description..." {...field} rows={5} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Content / Extended Summary (Optional)</FormLabel>
                 <FormControl><Textarea placeholder="Full book content or a longer summary..." {...field} rows={8} /></FormControl>
                <FormDescription>Provide the full book content or an extended summary here. This can be useful for detailed views or future features.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="coverImageFile" render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                </FormControl>
                <FormDescription>Choose an image from your device.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
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
              <FormField control={form.control} name="publishedYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Published Year (Optional)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 2023" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Target Audience (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Young Adults, Professionals" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="themes" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Themes (Optional, comma-separated)</FormLabel>
                    <FormControl><Input placeholder="e.g., Adventure, Romance, Sci-Fi" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {book ? 'Save Changes' : 'Add Book'}
            </Button>
            {book && onDelete && (
              <Button type="button" variant="destructive" size="lg" onClick={handleDelete} disabled={isSaving}>
                <Trash2 className="mr-2 h-5 w-5" /> Delete Book
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
