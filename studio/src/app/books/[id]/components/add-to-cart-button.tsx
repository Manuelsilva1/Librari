
"use client";

import type { Book, Dictionary } from '@/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface AddToCartButtonProps {
  book: Book;
  dictionary: Dictionary;
}

export function AddToCartButton({ book, dictionary }: AddToCartButtonProps) {
  const { addItem } = useCart(); // Correctly use addItem from CartContext
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (book && book.id) {
      addItem(book.id, 1); // Call addItem with bookId and quantity
      toast({
        title: dictionary.cartPage?.addedToCartTitle || "Added to cart",
        description: `${book.titulo} ${dictionary.cartPage?.addedToCartDescription || "has been added to your cart."}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Could not add book to cart. Book data missing.",
        variant: "destructive",
      });
    }
  };

  // Ensure robust access to dictionary and book properties
  const catalogTexts = dictionary.catalogPage || {};
  const buttonTextKey = book && book.stock > 0 
    ? catalogTexts.addToCartButton || 'Add to Cart'
    : catalogTexts.outOfStockButton || 'Out of Stock';
  
  const priceDisplay = typeof book?.precio === 'number' ? ` - UYU ${book.precio.toFixed(2)}` : '';
  const fullButtonText = book && book.stock > 0 ? `${buttonTextKey}${priceDisplay}` : buttonTextKey;

  return (
    <Button 
      size="lg" 
      onClick={handleAddToCart} 
      disabled={!book || typeof book.stock !== 'number' || book.stock <= 0} 
      className="w-full sm:w-auto"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {fullButtonText}
    </Button>
  );
}
