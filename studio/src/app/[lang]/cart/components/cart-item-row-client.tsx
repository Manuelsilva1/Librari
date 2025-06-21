
"use client";

import Image from 'next/image';
import Link from 'next/link';
// Ensure CartItem is the one from '@/types' that matches API structure
import type { CartItem as ApiCartItem, Dictionary } from '@/types'; 
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus, Loader2 } from 'lucide-react'; // Added Loader2 for item-specific loading
import { useState } from 'react';

interface CartItemRowClientProps {
  item: ApiCartItem; // Use the API CartItem type
  lang: string;
  dictionary: Dictionary; // Pass dictionary for translations
}

export function CartItemRowClient({ item, lang, dictionary }: CartItemRowClientProps) {
  // Use removeItem and updateItemQuantity from the refactored useCart
  const { removeItem, updateItemQuantity, isLoading: isCartLoading } = useCart(); 
  const [isUpdating, setIsUpdating] = useState(false); // Local loading state for this item

  const bookDetails = item.libro; // The 'libro' field should contain book details

  const handleQuantityChange = async (newQuantity: number) => {
    if (!item.id) return; // Item must have an ID
    setIsUpdating(true);
    // Ensure newQuantity is at least 1, or handle removal if 0
    const quantityToUpdate = Math.max(1, newQuantity);
    await updateItemQuantity(item.id, quantityToUpdate);
    setIsUpdating(false);
  };

  const handleRemoveItem = async () => {
    if (!item.id) return;
    setIsUpdating(true);
    await removeItem(item.id);
    // No need to setIsUpdating(false) if the item is removed and component unmounts
  };
  
  const texts = dictionary.cartPage || {}; // Fallback for texts

  if (!bookDetails) {
    // This case should ideally not happen if cart items always include book details
    // Or, fetch book details here if item.libroId is present but item.libro is not
    return (
      <div className="flex items-center justify-between py-4 border-b last:border-b-0">
        <p>Book details not available for item ID: {item.id || item.libroId}.</p>
        {item.id && (
           <Button variant="ghost" size="icon" onClick={handleRemoveItem} className="text-destructive hover:text-destructive/80" disabled={isUpdating || isCartLoading}>
            {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
            <span className="sr-only">{texts.clearCart || "Remove item"}</span>
          </Button>
        )}
      </div>
    );
  }
  
  const currentItemTotal = item.precioUnitario * item.cantidad;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <Link href={`/${lang}/books/${bookDetails.id}`}>
          <Image
            src={bookDetails.coverImage ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${bookDetails.coverImage}` : '/placeholder-image.png'}
            alt={bookDetails.titulo}
            width={80}
            height={120}
            className="rounded-md object-cover border"
          />
        </Link>
        <div>
          <Link href={`/${lang}/books/${bookDetails.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-headline text-lg font-semibold">{bookDetails.titulo}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">{dictionary.bookDetailPage?.byAuthorPrefix || "By"} {bookDetails.autor}</p>
          <p className="text-sm text-primary">UYU {item.precioUnitario.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleQuantityChange(item.cantidad - 1)} 
            disabled={item.cantidad <= 1 || isUpdating || isCartLoading}
          >
            {isUpdating && item.cantidad -1 === item.cantidad -1 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
          </Button>
          <Input
            type="number"
            value={item.cantidad}
            onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) handleQuantityChange(val);
            }}
            className="w-16 text-center h-10"
            min="1"
            // max={bookDetails.stock} // Stock check should ideally be handled by API or disabled if not available
            disabled={isUpdating || isCartLoading}
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleQuantityChange(item.cantidad + 1)} 
            // disabled={item.cantidad >= bookDetails.stock || isUpdating || isCartLoading}  // Stock check
            disabled={isUpdating || isCartLoading} 
          >
             {isUpdating && item.cantidad +1 === item.cantidad +1 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-md font-semibold w-24 text-right">UYU {currentItemTotal.toFixed(2)}</p>
        <Button variant="ghost" size="icon" onClick={handleRemoveItem} className="text-destructive hover:text-destructive/80" disabled={isUpdating || isCartLoading}>
          {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          <span className="sr-only">{texts.clearCart || "Remove item"}</span>
        </Button>
      </div>
    </div>
  );
}
