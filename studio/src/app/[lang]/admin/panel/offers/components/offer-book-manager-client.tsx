"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Offer, Book, ApiResponseError } from '@/types';
import { 
  getOfferById, 
  getBooks, 
  addBookToOffer, 
  removeBookFromOffer,
  getBooksForOffer // To confirm books in offer after add/remove
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeftRight, AlertTriangle, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OfferBookManagerClientProps {
  offerId: string | number;
  texts: any; // Offer related texts from dictionary
  lang: string;
}

export function OfferBookManagerClient({ offerId, texts, lang }: OfferBookManagerClientProps) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [booksInOffer, setBooksInOffer] = useState<Book[]>([]);
  const [selectedAvailableBooks, setSelectedAvailableBooks] = useState<Set<string | number>>(new Set());
  const [selectedBooksInOffer, setSelectedBooksInOffer] = useState<Set<string | number>>(new Set());
  
  const [isLoadingOffer, setIsLoadingOffer] = useState(true);
  const [isLoadingAllBooks, setIsLoadingAllBooks] = useState(true);
  const [isLoadingBooksInOffer, setIsLoadingBooksInOffer] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const fetchOfferDetails = useCallback(async () => {
    setIsLoadingOffer(true);
    try {
      const fetchedOffer = await getOfferById(offerId);
      setOffer(fetchedOffer);
    } catch (err) {
      setError("Failed to load offer details.");
      console.error(err);
    } finally {
      setIsLoadingOffer(false);
    }
  }, [offerId]);

  const fetchAllBooksList = useCallback(async () => {
    setIsLoadingAllBooks(true);
    try {
      const fetchedBooks = await getBooks();
      setAllBooks(fetchedBooks);
    } catch (err) {
      setError("Failed to load available books.");
      console.error(err);
    } finally {
      setIsLoadingAllBooks(false);
    }
  }, []);

  const fetchBooksInCurrentOffer = useCallback(async () => {
    setIsLoadingBooksInOffer(true);
    try {
      const books = await getBooksForOffer(offerId);
      setBooksInOffer(books);
      // Initialize selectedBooksInOffer with current books in offer to handle initial state correctly
      // This is more for UI consistency if we directly manipulate this list later, though re-fetch is safer.
    } catch (err) {
      setError("Failed to load books in this offer.");
      console.error(err);
    } finally {
      setIsLoadingBooksInOffer(false);
    }
  }, [offerId]);

  useEffect(() => {
    fetchOfferDetails();
    fetchAllBooksList();
    fetchBooksInCurrentOffer();
  }, [fetchOfferDetails, fetchAllBooksList, fetchBooksInCurrentOffer]);

  const handleAddBooksToOffer = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      for (const bookId of selectedAvailableBooks) {
        await addBookToOffer(offerId, bookId);
      }
      toast({ title: "Books Added", description: "Selected books added to the offer." });
      setSelectedAvailableBooks(new Set());
      await fetchBooksInCurrentOffer(); // Refresh books in offer
    } catch (err) {
      const apiError = err as ApiResponseError;
      toast({ title: "Error", description: apiError.message || "Failed to add books to offer.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveBooksFromOffer = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      for (const bookId of selectedBooksInOffer) {
        await removeBookFromOffer(offerId, bookId);
      }
      toast({ title: "Books Removed", description: "Selected books removed from the offer." });
      setSelectedBooksInOffer(new Set());
      await fetchBooksInCurrentOffer(); // Refresh books in offer
    } catch (err) {
      const apiError = err as ApiResponseError;
      toast({ title: "Error", description: apiError.message || "Failed to remove books from offer.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const availableBooksFiltered = allBooks.filter(
    (book) => !booksInOffer.find(bio => bio.id === book.id)
  );

  if (isLoadingOffer || isLoadingAllBooks || isLoadingBooksInOffer) {
    return <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-3">Loading book management...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600"><AlertTriangle className="mx-auto h-10 w-10 mb-2" />{error}</div>;
  }
  
  if (!offer) {
    return <div className="text-center py-10 text-muted-foreground">Offer details could not be loaded.</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Manage Books for Offer: <span className="text-primary">{offer.descripcion}</span></CardTitle>
                <CardDescription>Select books to include or remove from this offer.</CardDescription>
            </div>
            <Button variant="outline" asChild>
                <Link href={`/${lang}/admin/panel/offers`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Offers List
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Books */}
        <div className="md:col-span-1 space-y-2">
          <h3 className="font-semibold text-lg">Available Books</h3>
          <ScrollArea className="h-96 border rounded-md p-2">
            {availableBooksFiltered.length === 0 && <p className="text-sm text-muted-foreground p-2">No other books available or all books are in the offer.</p>}
            {availableBooksFiltered.map(book => (
              <div key={book.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md">
                <Checkbox
                  id={`avail-${book.id}`}
                  checked={selectedAvailableBooks.has(book.id)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(selectedAvailableBooks);
                    if (checked) newSet.add(book.id);
                    else newSet.delete(book.id);
                    setSelectedAvailableBooks(newSet);
                  }}
                />
                <label htmlFor={`avail-${book.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow truncate" title={book.titulo}>
                  {book.titulo}
                </label>
              </div>
            ))}
          </ScrollArea>
          <Button onClick={handleAddBooksToOffer} disabled={selectedAvailableBooks.size === 0 || isUpdating} className="w-full">
            {isUpdating && selectedAvailableBooks.size > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add to Offer ({selectedAvailableBooks.size})
          </Button>
        </div>

        {/* Action Buttons (Mobile hidden, shown between lists on larger screens) */}
         <div className="md:col-span-1 flex flex-col items-center justify-center space-y-2 self-center">
            <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
        </div>


        {/* Books In Offer */}
        <div className="md:col-span-1 space-y-2">
          <h3 className="font-semibold text-lg">Books in this Offer</h3>
          <ScrollArea className="h-96 border rounded-md p-2">
            {booksInOffer.length === 0 && <p className="text-sm text-muted-foreground p-2">No books currently in this offer.</p>}
            {booksInOffer.map(book => (
              <div key={book.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md">
                <Checkbox
                  id={`in-offer-${book.id}`}
                  checked={selectedBooksInOffer.has(book.id)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(selectedBooksInOffer);
                    if (checked) newSet.add(book.id);
                    else newSet.delete(book.id);
                    setSelectedBooksInOffer(newSet);
                  }}
                />
                <label htmlFor={`in-offer-${book.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow truncate" title={book.titulo}>
                  {book.titulo}
                </label>
              </div>
            ))}
          </ScrollArea>
           <Button onClick={handleRemoveBooksFromOffer} disabled={selectedBooksInOffer.size === 0 || isUpdating} variant="destructive" className="w-full">
            {isUpdating && selectedBooksInOffer.size > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Remove from Offer ({selectedBooksInOffer.size})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
