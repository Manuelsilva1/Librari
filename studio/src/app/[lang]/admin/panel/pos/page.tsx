
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary, Book } from '@/types'; // Combined Book import
// Removed mockBooks import
import { PosClient } from './components/pos-client';
// Import getBooks from API services
import { getBooks as apiGetBooks } from '@/services/api'; 
import { AlertTriangle } from 'lucide-react'; // Import AlertTriangle for error display

interface AdminPosPageProps {
  params: any;
}

export default async function AdminPosPage({ params: { lang } }: AdminPosPageProps) {
  const dictionary = await getDictionary(lang);
  const texts = dictionary.adminPanel?.posPage || {
    title: "Point of Sale",
    searchBooksPlaceholder: "Search books by title or author...",
    noResults: "No books found.",
    addToOrder: "Add",
    currentOrderTitle: "Current Order",
    emptyOrder: "No items in order.",
    bookColumn: "Book",
    priceColumn: "Price",
    quantityColumn: "Qty",
    totalColumn: "Total",
    actionsColumn: "Actions",
    orderSummaryTitle: "Order Summary",
    subtotal: "Subtotal:",
    grandTotal: "Grand Total:",
    paymentMethodTitle: "Payment Method",
    cash: "Cash",
    card: "Card",
    customerNameLabel: "Customer Name (Optional)",
    customerNamePlaceholder: "Enter customer name",
    completeSaleButton: "Complete Sale",
    processingSale: "Processing...",
    saleCompletedToastTitle: "Sale Completed!",
    saleCompletedToastDesc: "The sale has been processed successfully.",
    errorCompletingSale: "Error completing sale.",
    errorLoadingBooks: "Error Loading Books", // Added for consistency
    ticketDialog: {
      title: "Sale Receipt",
      saleId: "Sale ID:",
      date: "Date:",
      customer: "Customer:",
      item: "Item",
      qty: "Qty",
      price: "Price",
      total: "Total",
      subtotal: "Subtotal:",
      grandTotal: "Grand Total:",
      paymentMethod: "Payment Method:",
      cash: "Cash",
      card: "Card",
      notApplicableShort: "N/A",
      printButton: "Print (Simulated)",
      closeButton: "Close"
    }
  };
  
  let books: Book[] = [];
  let fetchError: string | null = null;
  try {
    books = await apiGetBooks();
  } catch (error: any) {
    console.error("Failed to fetch books for POS page:", error);
    fetchError = error.message || texts.errorLoadingBooks || "Failed to load books for POS.";
  }

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{texts.title}</h1>
      {fetchError ? (
        <div className="text-center py-10 text-red-500 bg-red-50 p-6 rounded-md shadow-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-xl font-semibold">{texts.errorLoadingBooks}</p>
          <p>{fetchError}</p>
        </div>
      ) : (
        <PosClient 
          lang={lang} 
          dictionary={dictionary} 
          allBooks={books} 
          posTexts={texts} 
        />
      )}
    </div>
  );
}

