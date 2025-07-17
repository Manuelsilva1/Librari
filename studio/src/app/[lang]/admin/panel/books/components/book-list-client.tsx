"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { getCoverImageUrl } from "@/lib/utils";
import Link from "next/link";
import type { Book } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, PlusCircle, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";

interface BookListClientProps {
  books: Book[]; // Changed from initialBooks to books, as it will be updated
  onDeleteBook: (bookId: string | number) => Promise<void>; // ID can be string or number
  lang: string;
}

export function BookListClient({
  books,
  onDeleteBook,
  lang,
}: BookListClientProps) {
  // Removed local books state, directly use the prop 'books' as it's managed by parent
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const { toast } = useToast();

  // Books list comes from parent component; no local state needed

  const filteredBooks = books.filter(
    (book) =>
      book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || // Use titulo
      book.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn &&
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by ISBN
      // For categoriaId, direct search might not be user-friendly.
      // A more advanced filter would fetch categories and allow filtering by category name.
      // For now, let's keep it simple or remove category from simple search.
      (book.categoriaId &&
        String(book.categoriaId)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())),
  );
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const pagedBooks = filteredBooks.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const handleDeleteConfirmation = async () => {
    if (bookToDelete && bookToDelete.id) {
      // Ensure ID exists
      try {
        await onDeleteBook(bookToDelete.id);
        // The parent component (ManageBooksContent) will re-fetch and pass updated 'books'
        // So, no need to setBooks locally: setBooks(prevBooks => prevBooks.filter(b => b.id !== bookToDelete.id));
        toast({
          title: "Book Deleted",
          description: `${bookToDelete.titulo} has been deleted.`,
        });
      } catch (error) {
        // Error toast is handled by the parent (ManageBooksContent) which calls onDeleteBook
        // toast({ title: "Error", description: `Failed to delete ${bookToDelete.titulo}.`, variant: "destructive" });
      } finally {
        setBookToDelete(null);
      }
    }
  };

  return (
    <AlertDialog
      open={!!bookToDelete}
      onOpenChange={(open) => {
        if (!open) setBookToDelete(null);
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            {" "}
            {/* Increased width for better usability */}
            <Input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Link
            href={`/${lang}/admin/panel/books?action=add`}
            passHref
            legacyBehavior
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
            </Button>
          </Link>
        </div>

        {filteredBooks.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Category ID</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <ImageWithFallback
                        src={getCoverImageUrl(book.coverImage)}
                        alt={book.titulo}
                        width={50}
                        height={75}
                        className="rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{book.titulo}</TableCell>
                    <TableCell>{book.autor}</TableCell>
                    <TableCell>{book.isbn || "N/A"}</TableCell>
                    <TableCell>
                      {/* Display Categoria ID, or fetch and display name in a more advanced version */}
                      <Badge variant="outline">
                        {book.categoriaId || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      UYU {book.precio.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{book.stock}</TableCell>
                    <TableCell className="text-center space-x-1">
                      <Link
                        href={`/${lang}/books/${book.id}`}
                        target="_blank"
                        passHref
                        legacyBehavior
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View on Storefront"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link
                        href={`/${lang}/admin/panel/books?action=edit&id=${book.id}`}
                        passHref
                        legacyBehavior
                      >
                        <Button variant="ghost" size="icon" title="Edit Book">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete Book"
                        onClick={() => setBookToDelete(book)}
                        disabled={!book.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">
              No books found matching your search criteria.
            </p>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search.
              </p>
            )}
          </div>
        )}

        {bookToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                book "{bookToDelete?.titulo}" from the records.{" "}
                {/* Use titulo */}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBookToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirmation}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>
    </AlertDialog>
  );
}
