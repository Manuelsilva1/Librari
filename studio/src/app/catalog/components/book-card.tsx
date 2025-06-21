"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const imageSrc = book.coverImage ? `${apiBase}${book.coverImage}` : 'https://placehold.co/300x450.png';

  const handleAddToCart = () => {
    addToCart(book);
    toast({
      title: "Added to cart",
      description: `${book.title} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/books/${book.id}`} className="block">
          <Image
            src={imageSrc}
            alt={book.title}
            width={300}
            height={450}
            className="w-full h-72 object-cover"
            data-ai-hint={`${book.genre} book cover`}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/books/${book.id}`}>
          <CardTitle className="font-headline text-xl mb-1 hover:text-primary transition-colors duration-200 truncate" title={book.title}>
            {book.title}
          </CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 truncate" title={book.author}>
          By {book.author}
        </CardDescription>
        <p className="text-lg font-semibold text-primary mb-2">${book.price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2" title={book.description}>
          {book.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto grid grid-cols-2 gap-2">
        <Link href={`/books/${book.id}`} passHref legacyBehavior>
          <Button variant="outline" className="w-full">
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
        </Link>
        <Button onClick={handleAddToCart} className="w-full" disabled={book.stock <= 0}>
          <ShoppingCart className="mr-2 h-4 w-4" /> {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
