"use client"; // Required for searchParams and state management

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Book } from '@/types';
// Removed: import { mockBooks } from '@/lib/mock-data'; 
// TODO: This page is non-localized and uses its own mock implementation.
// It needs a full refactor to use API services and align with the localized admin panel.
// For now, removing mockBooks will make its local mock services return empty data.
import { BookFormClient } from './components/book-form-client';
import { BookListClient } from './components/book-list-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Mock data persistence (in-memory for this scaffold)
let adminMockBooks: Book[] = []; // Initialize as empty since mockBooks is removed

async function getAdminBooks(): Promise<Book[]> {
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve([...adminMockBooks]), 200));
}

async function getAdminBookById(id: string): Promise<Book | undefined> {
  return new Promise(resolve => setTimeout(() => resolve(adminMockBooks.find(b => b.id === id)), 100));
}

async function saveAdminBook(bookData: Book & { coverImageFile?: File }): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = adminMockBooks.findIndex(b => b.id === bookData.id);
      if (index !== -1) {
        adminMockBooks[index] = bookData; // Update
      } else {
        adminMockBooks.unshift({ ...bookData, id: String(Date.now()) }); // Add new
      }
      resolve();
    }, 300);
  });
}

async function deleteAdminBook(bookId: string): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      adminMockBooks = adminMockBooks.filter(b => b.id !== bookId);
      resolve();
    }, 300);
  });
}


function ManageBooksContent() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const bookId = searchParams.get('id');

  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [keyForForm, setKeyForForm] = useState(Date.now()); // To reset form

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const fetchedBooks = await getAdminBooks();
      setBooks(fetchedBooks);
      if (action === 'edit' && bookId) {
        const bookToEdit = await getAdminBookById(bookId);
        setEditingBook(bookToEdit);
      } else {
        setEditingBook(undefined); // Clear for 'add' or list view
      }
      setIsLoading(false);
      setKeyForForm(Date.now()); // Ensure form re-renders with new defaultValues
    }
    loadData();
  }, [action, bookId]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (action === 'add' || (action === 'edit' && bookId)) {
    return <BookFormClient key={keyForForm} book={editingBook} onSave={saveAdminBook} onDelete={deleteAdminBook} />;
  }

  return <BookListClient initialBooks={books} onDeleteBook={deleteAdminBook} />;
}


export default function ManageBooksPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">Manage Books</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ManageBooksContent />
      </Suspense>
    </div>
  );
}
