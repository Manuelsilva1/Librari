
"use client";

import type { Book, Dictionary } from '@/types';
import { BookCard } from './book-card';
import { useEffect, useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface NewArrivalsClientProps {
  allBooks: Book[];
  lang: string;
  dictionary: Dictionary;
}

export function NewArrivalsClient({ allBooks, lang, dictionary }: NewArrivalsClientProps) {
  const [newBooks, setNewBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!allBooks || allBooks.length === 0) {
      setNewBooks([]);
      return;
    }
    const today = new Date();
    let sevenDayBooks = allBooks.filter(book => {
      if (!book.dateAdded) return false;
      try {
        const addedDate = parseISO(book.dateAdded);
        return differenceInDays(today, addedDate) <= 7 && differenceInDays(today, addedDate) >= 0;
      } catch (e) {
        console.error("Error parsing dateAdded for book:", book.titulo, book.dateAdded, e);
        return false;
      }
    });

    sevenDayBooks.sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return parseISO(b.dateAdded).getTime() - parseISO(a.dateAdded).getTime()
    });

    if (sevenDayBooks.length > 0) {
      setNewBooks(sevenDayBooks.slice(0, 4));
    } else {
      let thirtyDayBooks = allBooks.filter(book => {
        if (!book.dateAdded) return false;
        try {
            const addedDate = parseISO(book.dateAdded);
            return differenceInDays(today, addedDate) <= 30 && differenceInDays(today, addedDate) >= 0;
        } catch (e) {
            console.error("Error parsing dateAdded for book:", book.titulo, book.dateAdded, e);
            return false;
        }
      });
      thirtyDayBooks.sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return parseISO(b.dateAdded).getTime() - parseISO(a.dateAdded).getTime()
      });
      setNewBooks(thirtyDayBooks.slice(0, 4)); 
    }
  }, [allBooks]);

  const newArrivalsTexts = dictionary.catalogPage?.newArrivalsSection || {
    title: "New Arrivals",
    noNewArrivals: "No new books in the last month. Check back soon!",
  };

  if (newBooks.length === 0) {
    return null; 
  }

  return (
    <Card className="mb-10 shadow-lg rounded-lg border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-2xl md:text-3xl text-primary flex items-center">
          <Sparkles className="mr-3 h-6 w-6" />
          {newArrivalsTexts.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newBooks.filter(Boolean).map(book => (
            <BookCard key={book.id} book={book} lang={lang} dictionary={dictionary} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
