"use client";

// This component's AI functionality has been removed.
// It can be deleted or modified to show static content if needed.

import type { Book } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface SummaryClientProps {
  book: Book;
}

export function SummaryClient({ book }: SummaryClientProps) {
  // AI summary generation logic has been removed.
  // You can display a placeholder or other book details here.

  return (
    <Card className="mt-8 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <FileText className="mr-2 h-6 w-6 text-primary" /> Book Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {book.content ? (
            <div className="space-y-2">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                    {/* Displaying book.content if available, or a part of it */}
                    {book.content.length > 500 ? `${book.content.substring(0, 500)}...` : book.content}
                </p>
                {book.content.length > 500 && <p className="text-sm text-muted-foreground">Full content available in book purchase.</p>}
            </div>
        ) : (
            <p className="text-muted-foreground">Further details or a summary for this book are not currently available.</p>
        )}
      </CardContent>
    </Card>
  );
}
