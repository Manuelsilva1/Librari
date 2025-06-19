
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, RotateCcw } from 'lucide-react';

export interface CatalogFilters {
  genre: string;
  author: string;
  minPrice: number | string;
  maxPrice: number | string;
  sortBy: string;
}

interface FiltersClientProps {
  genres: string[];
  authors: string[];
  onFilterChange: (filters: CatalogFilters) => void;
  onResetFilters: () => void;
  initialFilters: CatalogFilters;
}

export function FiltersClient({
  genres,
  authors,
  onFilterChange,
  onResetFilters,
  initialFilters,
}: FiltersClientProps) {
  const [currentFilters, setCurrentFilters] = useState<CatalogFilters>(initialFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentFilters(prev => ({ ...prev, [name]: name === 'minPrice' || name === 'maxPrice' ? parseFloat(value) || '' : value }));
  };

  const handleSelectChange = (name: keyof CatalogFilters, value: string) => {
    setCurrentFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(currentFilters);
  };

  const handleReset = () => {
    setCurrentFilters(initialFilters);
    onResetFilters();
  };
  
  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Filter className="mr-2 h-6 w-6 text-primary" /> Filter Books
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre" className="font-semibold">Genre</Label>
              <Select name="genre" value={currentFilters.genre} onValueChange={(value) => handleSelectChange('genre', value)}>
                <SelectTrigger id="genre">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author" className="font-semibold">Author</Label>
               <Select name="author" value={currentFilters.author} onValueChange={(value) => handleSelectChange('author', value)}>
                <SelectTrigger id="author">
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map(author => (
                    <SelectItem key={author} value={author}>{author}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice" className="font-semibold">Min Price</Label>
              <Input
                type="number"
                id="minPrice"
                name="minPrice"
                placeholder="0"
                value={currentFilters.minPrice}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="font-semibold">Max Price</Label>
              <Input
                type="number"
                id="maxPrice"
                name="maxPrice"
                placeholder="Any"
                value={currentFilters.maxPrice}
                onChange={handleInputChange}
                min={currentFilters.minPrice || "0"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sortBy" className="font-semibold">Sort By</Label>
            <Select name="sortBy" value={currentFilters.sortBy} onValueChange={(value) => handleSelectChange('sortBy', value)}>
              <SelectTrigger id="sortBy">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="title_asc">Title: A-Z</SelectItem>
                <SelectItem value="title_desc">Title: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full">
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="w-full">
               <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
