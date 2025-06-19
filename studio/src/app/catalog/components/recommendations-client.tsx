"use client";

// This component's AI functionality has been removed.
// It can be deleted or modified to show static recommendations or other content.

import type { Book } from '@/types';
import { BookCard } from './book-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react'; // Using Star or other relevant icon

interface RecommendationsClientProps {
  // Props might change if this component is repurposed for static content
  // For now, let's assume it might show "Featured Books" or similar
  featuredBooks?: Book[]; 
}

export function RecommendationsClient({ featuredBooks }: RecommendationsClientProps) {
  if (!featuredBooks || featuredBooks.length === 0) {
    // Don't show the section if there are no books to feature
    return null; 
  }

  return (
    <Card className="mt-12 shadow-lg rounded-lg bg-accent/20 border-accent">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center text-primary">
          <Star className="mr-2 h-6 w-6" /> Featured Books 
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Check out some of our popular titles:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
