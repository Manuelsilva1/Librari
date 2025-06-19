
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Book, Dictionary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface BookCardProps {
  book: Book;
  lang: string;
  dictionary: Dictionary;
}

export function BookCard({ book, lang, dictionary }: BookCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  // Robust check for the book object itself and its id
  if (!book || typeof book !== 'object' || !book.id) {
    console.error("BookCard received invalid book data or book without ID:", book);
    return null; // Don't render anything if book data is fundamentally flawed
  }

  const catalogTexts = dictionary.catalogPage || {};
  const bookDetailTexts = dictionary.bookDetailPage || {};
  const cartTexts = dictionary.cartPage || {};

  const handleAddToCart = () => {
    // book.id is guaranteed by the check above
    addItem(book.id, 1);
    toast({
      title: cartTexts.addedToCartTitle || "Added to cart",
      description: `${book.titulo || catalogTexts.unknownTitle || "Book"} ${cartTexts.addedToCartDescription || "has been added to your cart."}`,
    });
  };

  const bookTitle = book.titulo || catalogTexts.unknownTitle || "Untitled Book";
  const authorName = book.autor || catalogTexts.unknownAuthor || "Unknown Author";
  const authorDisplay = `${bookDetailTexts.byAuthorPrefix || "By"} ${authorName}`;
  const bookDescription = book.descripcion || catalogTexts.noDescription || "No description available.";
  const addToCartLabel = catalogTexts.addToCartButton || 'Add to Cart';
  const outOfStockLabel = catalogTexts.outOfStockButton || 'Out of Stock';
  const viewDetailsLabel = catalogTexts.viewDetailsButton || "View Details";

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/${lang}/books/${book.id}`} className="block">
          <Image
            src={book.coverImage || 'https://placehold.co/300x450.png'}
            alt={bookTitle}
            width={300}
            height={450}
            className="w-full h-72 object-cover"
            data-ai-hint="book cover"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/${lang}/books/${book.id}`}>
          <CardTitle className="font-headline text-xl mb-1 hover:text-primary transition-colors duration-200 truncate" title={bookTitle}>
            {bookTitle}
          </CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 truncate" title={authorDisplay}>
          {authorDisplay}
        </CardDescription>
        <p className="text-lg font-semibold text-primary mb-2">
          UYU {typeof book.precio === 'number' ? book.precio.toFixed(2) : 'N/A'}
        </p>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2" title={bookDescription}>
          {bookDescription}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto grid grid-cols-2 gap-2">
        <Link href={`/${lang}/books/${book.id}`} passHref legacyBehavior>
          <Button variant="outline" className="w-full" aria-label={viewDetailsLabel}>
            <Eye className="h-4 w-4" /> {viewDetailsLabel}
          </Button>
        </Link>
        <Button 
          onClick={handleAddToCart} 
          className="w-full" 
          size="icon"
          disabled={typeof book.stock !== 'number' || book.stock <= 0}
          aria-label={(typeof book.stock === 'number' && book.stock > 0) ? addToCartLabel : outOfStockLabel}
        >
          <ShoppingCart className="h-5 w-5" /> 
        </Button>
      </CardFooter>
    </Card>
  );
}
