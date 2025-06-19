
"use client"; 

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Book, ApiResponseError } from '@/types';
import { getBooks } from '@/services/api';
import { BookCard } from './book-card';
import { FiltersClient, type CatalogFilters } from './filters-client';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/types';
import { NewArrivalsClient } from './new-arrivals-client';

const ITEMS_PER_PAGE = 8;
const initialFilters: CatalogFilters = {
  genre: 'all',
  author: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'relevance',
};

interface CatalogContentClientProps {
  lang: string;
  dictionary: Dictionary;
}

export function CatalogContentClient({ lang, dictionary }: CatalogContentClientProps) {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<CatalogFilters>(initialFilters);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [genres, setGenres] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);

  const texts = useMemo(() => {
    const catalogPageTexts = dictionary.catalogPage || {};
    return {
      pageTitle: catalogPageTexts.pageTitle || "Book Catalog",
      searchPlaceholder: catalogPageTexts.searchPlaceholder || "Search by title, author, or genre...",
      noBooksMatch: catalogPageTexts.noBooksMatch || "No books match your criteria.",
      previousPage: catalogPageTexts.previousPage || "Previous",
      nextPage: catalogPageTexts.nextPage || "Next",
      pageIndicator: catalogPageTexts.pageIndicator || "Page {currentPage} of {totalPages}",
      loadingBooks: catalogPageTexts.loadingBooks || "Loading books...",
      errorLoadingBooks: catalogPageTexts.errorLoadingBooks || "Failed to load books. Please try again later.",
    };
  }, [dictionary.catalogPage]);
  
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const booksFromApi = await getBooks();
        setAllBooks(booksFromApi);
        setFilteredBooks(booksFromApi); 

        const uniqueGenres = Array.from(new Set(booksFromApi.map(book => book.categoriaId?.toString()).filter(Boolean) as string[]));
        setGenres(uniqueGenres); 

        const uniqueAuthors = Array.from(new Set(booksFromApi.map(book => book.autor).filter(Boolean)));
        setAuthors(uniqueAuthors);

      } catch (err) {
        const apiError = err as ApiResponseError;
        setError(apiError.message || texts.errorLoadingBooks); 
        console.error("Error fetching books:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, [texts.errorLoadingBooks, dictionary]); // dictionary dependency might be indirect via texts

  const applyFiltersAndSearch = useCallback(() => {
    let booksToFilter = [...allBooks];

    if (searchTerm) {
      booksToFilter = booksToFilter.filter(book =>
        book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.categoriaId && book.categoriaId.toString().toLowerCase().includes(searchTerm.toLowerCase())) 
      );
    }

    if (activeFilters.genre !== 'all') {
      booksToFilter = booksToFilter.filter(book => book.categoriaId?.toString() === activeFilters.genre);
    }
    if (activeFilters.author !== 'all') {
      booksToFilter = booksToFilter.filter(book => book.autor === activeFilters.author);
    }
    if (activeFilters.minPrice !== '') {
      booksToFilter = booksToFilter.filter(book => book.precio >= Number(activeFilters.minPrice)); 
    }
    if (activeFilters.maxPrice !== '') {
      booksToFilter = booksToFilter.filter(book => book.precio <= Number(activeFilters.maxPrice)); 
    }
    
    switch (activeFilters.sortBy) {
      case 'price_asc':
        booksToFilter.sort((a, b) => a.precio - b.precio); 
        break;
      case 'price_desc':
        booksToFilter.sort((a, b) => b.precio - a.precio); 
        break;
      case 'title_asc':
        booksToFilter.sort((a, b) => a.titulo.localeCompare(b.titulo)); 
        break;
      case 'title_desc':
        booksToFilter.sort((a, b) => b.titulo.localeCompare(a.titulo)); 
        break;
      case 'date_added_desc': // Assumes Book type has dateAdded
        booksToFilter.sort((a, b) => {
          if (!a.dateAdded || !b.dateAdded) return 0; // Handle missing dateAdded
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        });
        break;
    }

    setFilteredBooks(booksToFilter);
    setCurrentPage(1); 
  }, [allBooks, searchTerm, activeFilters]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [allBooks, searchTerm, activeFilters, applyFiltersAndSearch]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedBooks(filteredBooks.slice(startIndex, endIndex));
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleFilterChange = (filters: CatalogFilters) => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    setActiveFilters(initialFilters);
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold mb-8 text-center text-primary">
        {texts.pageTitle}
      </h1>

      <NewArrivalsClient allBooks={allBooks} lang={lang} dictionary={dictionary} /> 
      
      <div className="mb-8 relative">
        <Input 
          type="text"
          placeholder={texts.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-base"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <FiltersClient
            genres={genres}
            authors={authors}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            initialFilters={initialFilters}
            dictionary={dictionary}
          />
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-xl text-muted-foreground">{texts.loadingBooks}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 p-6 rounded-md">
              <p className="text-xl">{error}</p>
            </div>
          ) : displayedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBooks.filter(Boolean).map(book => (
                <BookCard key={book.id} book={book} lang={lang} dictionary={dictionary} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">{texts.noBooksMatch}</p>
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
              >
                {texts.previousPage}
              </Button>
              <span className="text-muted-foreground">
                {texts.pageIndicator.replace('{currentPage}', currentPage.toString()).replace('{totalPages}', totalPages.toString())}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
              >
                {texts.nextPage}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
