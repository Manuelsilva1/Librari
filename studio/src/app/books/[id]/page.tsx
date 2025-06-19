import { PublicLayout } from '@/components/layout/public-layout';
// Removed mock imports: import { getBookById, mockBooks } from '@/lib/mock-data';
// TODO: This non-localized page should be removed or refactored to use API services and /lang/ structure.
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
// import { SummaryClient } from './components/summary-client'; // AI Summary Client Removed
import { LightboxClient } from './components/lightbox-client'; // This component might not exist or might need /lang/ prefix
import { CartProvider, useCart } from '@/context/cart-provider'; 
import type { Book } from '@/types'; // Import Book type
import Image from 'next/image'; // Import Image

export async function generateStaticParams() {
  // This function would need to fetch actual book IDs from the API if this page were to be kept.
  // return mockBooks.map(book => ({
  //   id: book.id,
  // }));
  return []; // Return empty for now as mockBooks is removed
}

// AddToCartButtonWrapper remains, but it needs a Book prop that matches API Book type.
// The Book type from mock-data had 'genre', 'themes', 'publishedYear' which are not in API Book.
// The component will still work but won't display those fields if they are not on the Book object passed.
function AddToCartButtonWrapper({ book }: { book: Book }) {
  "use client"; 
  const { addItem } = useCart(); // Use the refactored addItem from API-driven cart
  const { toast } = useToast(); // useToast should be imported at the top level of the module


  const handleAddToCart = () => {
    // addItem expects bookId and quantity.
    // Assuming the 'book' prop here is the full API Book object.
    if (book && book.id) {
      addItem(book.id, 1); 
      toast({
        title: "Added to cart",
        description: `${book.titulo} has been added to your cart.`, // Use 'titulo'
      });
    } else {
      toast({ title: "Error", description: "Could not add book to cart.", variant: "destructive" });
    }
  };

  return (
    <Button size="lg" onClick={handleAddToCart} disabled={!book || book.stock <= 0} className="w-full sm:w-auto">
      <ShoppingCart className="mr-2 h-5 w-5" />
      {book && book.stock > 0 ? `Add to Cart - UYU ${book.precio.toFixed(2)}` : 'Out of Stock'} {/* Use 'precio' */}
    </Button>
  );
}


export default async function BookDetailPage({ params }: { params: { id: string } }) {
  // const book = getBookById(params.id); // Mock function removed
  // TODO: This page needs to fetch data using API services (e.g., await apiGetBookById(params.id))
  // and handle lang parameter for localization if it's to be used.
  // For now, it will not render correctly as 'book' will be undefined.
  const book: Book | undefined = undefined; // Placeholder for fetched book

  if (!book) {
    // notFound(); // This would be the correct action if data fetching fails or book not found
    // For now, render a placeholder message.
    return (
        <PublicLayout> {/* Assuming PublicLayout can work without lang/dictionary for this fallback */}
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold">Book Details Not Available</h1>
                <p className="text-muted-foreground">This page needs to be updated to fetch live data.</p>
                <Link href="/" passHref legacyBehavior><Button variant="link" className="mt-4">Go to Homepage</Button></Link>
            </div>
        </PublicLayout>
    );
  }
  
  // The rest of the rendering logic assumes 'book' is populated.
  // It will use the API Book type. Fields like 'genre', 'themes', 'publishedYear' from mock
  // are not on the API Book type and will not be rendered or will cause errors if accessed directly.

  return (
    <CartProvider> 
      <PublicLayout> {/* Missing lang and dictionary, might cause issues */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <LightboxClient
                src={book.coverImage || '/placeholder-image.png'} // Use API field
                alt={book.titulo || 'Book cover'} // Use API field
                width={600}
                height={900}
                triggerClassName="w-full max-w-md mx-auto"
                // data-ai-hint={`${book.categoriaId} book cover detail`} // Use API field if needed
              />
            </div>

            <div className="space-y-6">
              <h1 className="font-headline text-4xl lg:text-5xl font-bold text-primary">{book.titulo}</h1>
              <p className="text-xl text-muted-foreground">
                By <span className="font-semibold text-foreground">{book.autor}</span>
              </p>
              
              <div className="flex items-center space-x-2">
                {book.categoriaId && <Badge variant="secondary" className="text-sm px-3 py-1">Category: {book.categoriaId}</Badge>}
                {/* book.publishedYear was mock-only, remove or adapt if API provides similar */}
              </div>

              {/* book.themes was mock-only, remove */}

              <p className="text-lg text-foreground/90 leading-relaxed">{book.descripcion || "No description available."}</p>
              
              {book.isbn && <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>}

              <div className="pt-4">
                <AddToCartButtonWrapper book={book} />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    </CartProvider>
  );
}
