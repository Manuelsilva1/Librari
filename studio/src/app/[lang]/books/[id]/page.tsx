
import { PublicLayout } from '@/components/layout/public-layout';
// Import the new getBookById from API service
import { getBookById, getBooks } from '@/services/api'; 
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
// Keep Category and Editorial types if you plan to fetch and display their names
import type { Book, Category, Editorial, Dictionary } from '@/types'; 
import { getDictionary } from '@/lib/dictionaries';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, AlertTriangle } from 'lucide-react'; // Link was unused
import { LightboxClient } from '@/app/books/[id]/components/lightbox-client';
// Import the new client component
import { AddToCartButton } from '@/app/books/[id]/components/add-to-cart-button';
import Link from 'next/link'; // Import Link
import { getCoverImageUrl } from '@/lib/utils';

// Updated generateStaticParams to use the API
export async function generateStaticParams() {
  try {
    const books = await getBooks(); // Fetch all books
    const locales = ['en', 'es']; // Or from your i18n config
    const params: { lang: string; id: string }[] = [];

    locales.forEach(lang => {
      books.forEach(book => {
        // Ensure book.id is a string, as params usually are.
        params.push({ lang, id: String(book.id) });
      });
    });
    return params;
  } catch (error) {
    console.error("Failed to generate static params for book pages:", error);
    return []; // Return empty array on error to prevent build failure
  }
}

interface BookDetailPageProps {
  params: { 
    id: string;
    lang: string;
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id, lang } = params;
  const dictionary = await getDictionary(lang);
  let book: Book | null = null;
  let fetchError: string | null = null;

  try {
    book = await getBookById(id);
  } catch (error: any) {
    console.error(`Failed to fetch book with ID ${id}:`, error);
    if (error.statusCode === 404 || error.status === 404) { // Check for error.status for fetch API errors
      notFound(); // Trigger Next.js 404 page
    }
    fetchError = error.message || "Failed to load book details.";
  }

  if (fetchError) {
    return (
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-red-700">Error</h1>
          <p className="mt-2 text-red-600">{fetchError}</p>
          <Link href={`/${lang}/catalog`} legacyBehavior>
            <Button variant="outline" className="mt-6">Back to Catalog</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }
  
  if (!book) { 
    notFound();
  }
  
  const pageDictionary = { 
    ...dictionary,
    cartPage: dictionary.cartPage || { addedToCartTitle: "Added to cart", addedToCartDescription: "has been added to your cart." },
    catalogPage: dictionary.catalogPage || { addToCartButton: "Add to Cart", outOfStockButton: "Out of Stock" },
    bookDetailPage: dictionary.bookDetailPage || { byAuthorPrefix: "By", publishedPrefix: "Published", themesPrefix: "Themes" }
  };

  return (
    // CartProvider is removed from here, global provider in ClientLayoutProviders is used.
    <PublicLayout lang={lang} dictionary={pageDictionary}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <LightboxClient
              src={getCoverImageUrl(book.coverImage, 'https://placehold.co/600x900.png?text=Sin+imagen')}
              alt={book.titulo || "Book cover"}
              width={600}
              height={900}
              triggerClassName="w-full max-w-md mx-auto"
              // data-ai-hint could be more specific if category data is available
              // data-ai-hint={`${book.categoriaId || 'book'} cover detail`}
            />
          </div>

          <div className="space-y-6">
            <h1 className="font-headline text-4xl lg:text-5xl font-bold text-primary">{book.titulo}</h1>
            <p className="text-xl text-muted-foreground">
              {pageDictionary.bookDetailPage?.byAuthorPrefix || "By"} <span className="font-semibold text-foreground">{book.autor}</span>
            </p>
            
            <div className="flex items-center space-x-2">
              {book.categoriaId && <Badge variant="secondary" className="text-sm px-3 py-1">Category ID: {book.categoriaId}</Badge>}
            </div>

            <p className="text-lg text-foreground/90 leading-relaxed">{book.descripcion || "No description available."}</p>
            
            {book.isbn && <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>}
            <p className="text-sm text-muted-foreground">Stock: {book.stock}</p>
            {book.editorialId && <p className="text-sm text-muted-foreground">Editorial ID: {book.editorialId}</p>}

            <div className="pt-4">
              <AddToCartButton book={book} dictionary={pageDictionary}/>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
