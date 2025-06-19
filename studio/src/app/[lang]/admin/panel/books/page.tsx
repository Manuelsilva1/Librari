
"use client"; 

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Book } from '@/types';
import { BookFormClient } from './components/book-form-client';
import { BookListClient } from './components/book-list-client';
import { Loader2 } from 'lucide-react';
import { getBooks, getBookById, createBook, updateBook, deleteBook as apiDeleteBook } from '@/services/api'; // Import API functions
import type {ApiResponseError } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Removed mock data and functions

interface ManageBooksContentProps {
  params: { lang: string };
}

function ManageBooksContent({ params: { lang } }: ManageBooksContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const action = searchParams.get('action');
  const bookId = searchParams.get('id'); // This will be string or null

  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false); // For loading book to edit
  const [keyForForm, setKeyForForm] = useState(Date.now()); // To reset form

  const fetchBooksList = async () => {
    setIsLoading(true);
    try {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: "Error fetching books", description: apiError.message, variant: "destructive" });
      setBooks([]); // Set to empty or handle error display
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBooksList();
  }, [lang]); // Fetch books when lang changes, or on initial load

  useEffect(() => {
    async function loadEditingBook() {
      if (action === 'edit' && bookId) {
        setIsFormLoading(true);
        setEditingBook(undefined); // Clear previous editing book
        try {
          const bookToEdit = await getBookById(bookId);
          setEditingBook(bookToEdit);
        } catch (error) {
          const apiError = error as ApiResponseError;
          toast({ title: `Error fetching book ${bookId}`, description: apiError.message, variant: "destructive" });
          router.push(`/${lang}/admin/panel/books`); // Redirect if book not found or error
        } finally {
          setIsFormLoading(false);
        }
      } else {
        setEditingBook(undefined);
      }
      setKeyForForm(Date.now()); // Reset form when action or bookId changes
    }
    loadEditingBook();
  }, [action, bookId, lang, router, toast]);

  const handleSaveBook = async (bookData: Partial<Book>) => { // Use Partial<Book> for payload
    setIsFormLoading(true);
    try {
      if (bookData.id) { // Existing book ID means update
        await updateBook(bookData.id, bookData);
        toast({ title: "Book Updated", description: `${bookData.titulo} has been updated.` });
      } else { // No ID means create
        await createBook(bookData);
        toast({ title: "Book Created", description: `${bookData.titulo} has been created.` });
      }
      await fetchBooksList(); // Refresh book list
      router.push(`/${lang}/admin/panel/books`); // Navigate back to list view
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: "Save Failed", description: apiError.message, variant: "destructive" });
    } finally {
      setIsFormLoading(false);
    }
  };
  
  const handleDeleteBook = async (idToDelete: string | number) => {
    // setIsLoading(true); // Or use a more specific loading state for delete
    try {
      await apiDeleteBook(idToDelete);
      toast({ title: "Book Deleted", description: `Book ID ${idToDelete} has been deleted.` });
      await fetchBooksList(); // Refresh book list
      // No need to navigate if already on the list page and it refreshes
    } catch (error) {
      const apiError = error as ApiResponseError;
      toast({ title: "Delete Failed", description: apiError.message, variant: "destructive" });
    } finally {
      // setIsLoading(false);
    }
  };

  if (isLoading && !action) { // Main list loading
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (action === 'add' || (action === 'edit' && bookId)) {
    return <BookFormClient key={keyForForm} book={editingBook} onSave={handleSaveBook} onDelete={handleDeleteBook} lang={lang} />;
  }

  return <BookListClient initialBooks={books} onDeleteBook={handleDeleteBook} lang={lang} />;
}

interface ManageBooksPageProps {
  params: any;
}

export default function ManageBooksPage({ params }: ManageBooksPageProps) {
  // const dictionary = await getDictionary(params.lang); // Fetch if needed for title
  // const pageTitle = dictionary.adminPanel?.booksPage?.title || "Manage Books";
  const pageTitle =  "Manage Books"; // Hardcode or use context if dictionary is complex to pass here

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{pageTitle}</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ManageBooksContent params={params} />
      </Suspense>
    </div>
  );
}
