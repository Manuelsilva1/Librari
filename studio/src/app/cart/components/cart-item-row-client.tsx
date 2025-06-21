"use client";

import { ImageWithFallback } from '@/components/image-with-fallback';
import Link from 'next/link';
import type { CartItem } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus } from 'lucide-react';

interface CartItemRowClientProps {
  item: CartItem;
}

export function CartItemRowClient({ item }: CartItemRowClientProps) {
  const { removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.book.id, newQuantity);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <Link href={`/books/${item.book.id}`}>
          <ImageWithFallback
            src={item.book.coverImage}
            alt={item.book.title}
            width={80}
            height={120}
            className="rounded-md object-cover border"
            data-ai-hint="book cover thumbnail"
          />
        </Link>
        <div>
          <Link href={`/books/${item.book.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-headline text-lg font-semibold">{item.book.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">By {item.book.author}</p>
          <p className="text-sm text-primary">${item.book.price.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
            className="w-16 text-center h-10"
            min="1"
            max={item.book.stock}
          />
          <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={item.quantity >= item.book.stock}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-md font-semibold w-20 text-right">${(item.book.price * item.quantity).toFixed(2)}</p>
        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.book.id)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="h-5 w-5" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
}
