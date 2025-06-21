
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCoverImageUrl } from '@/lib/utils';
import Link from 'next/link';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, PlusCircle, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface BookListClientProps {
  initialBooks: Book[];
  onDeleteBook: (bookId: string) => Promise<void>; // Mock delete function
}

export function BookListClient({ initialBooks, onDeleteBook }: BookListClientProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirmation = async () => {
    if (bookToDelete) {
      try {
        await onDeleteBook(bookToDelete.id); // Call mock delete
        setBooks(prevBooks => prevBooks.filter(b => b.id !== bookToDelete.id));
        toast({ title: "Book Deleted", description: `${bookToDelete.title} has been deleted.` });
      } catch (error) {
        toast({ title: "Error", description: `Failed to delete ${bookToDelete.title}.`, variant: "destructive" });
      } finally {
        setBookToDelete(null);
      }
    }
  };


  return (
    <AlertDialog open={!!bookToDelete} onOpenChange={(open) => { if (!open) setBookToDelete(null); }}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Input 
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Link href="/admin/books?action=add" passHref legacyBehavior>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
            </Button>
          </Link>
        </div>

        {filteredBooks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <Image
                      src={getCoverImageUrl(book.coverImage)}
                      alt={book.title}
                      width={50}
                      height={75}
                      className="rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x900?text=No+Image';
                      }}
                      data-ai-hint="book cover admin"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{book.genre}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${book.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{book.stock}</TableCell>
                  <TableCell className="text-center space-x-1">
                    <Link href={`/books/${book.id}`} target="_blank" passHref legacyBehavior>
                      <Button variant="ghost" size="icon" title="View on Storefront">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/books?action=edit&id=${book.id}`} passHref legacyBehavior>
                      <Button variant="ghost" size="icon" title="Edit Book">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Delete Book" onClick={() => setBookToDelete(book)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">No books found matching your search criteria.</p>
            {searchTerm && <p className="text-sm text-muted-foreground mt-1">Try adjusting your search.</p>}
          </div>
        )}
        
        {bookToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the book
                "{bookToDelete?.title}" from the records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBookToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>
    </AlertDialog>
  );
}
