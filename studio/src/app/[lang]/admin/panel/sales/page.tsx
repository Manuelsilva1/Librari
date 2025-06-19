
import { Suspense } from 'react'; // Import Suspense
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
// Remove mock data import: import { getSaleRecords, type SaleRecord } from '@/lib/mock-data'; 
import { ManageSalesContent } from './components/manage-sales-content'; // Import new orchestrator component
import { Loader2 } from 'lucide-react'; // Import Loader2 for Suspense fallback

interface AdminSalesPageProps {
  params: any;
}

export default async function AdminSalesPage({ params }: AdminSalesPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  // Consolidate texts or ensure ManageSalesContent receives all it needs.
  // For simplicity, passing the salesPage part of dictionary, ManageSalesContent can use it.
  const salesPageTexts = dictionary.adminPanel?.salesPage || {
    title: "Sales Management", // Updated title
    noSalesFound: "No sales records found.",
    tableHeaderSaleId: "Sale ID",
    tableHeaderDate: "Date",
    tableHeaderCustomer: "Customer",
    tableHeaderTotalAmount: "Total Amount",
    tableHeaderPaymentMethod: "Payment Method",
    tableHeaderActions: "Actions",
    viewTicketButton: "View Ticket",
    cash: "Cash",
    card: "Card",
    notApplicable: "N/A",
    filterByYearLabel: "Year",
    filterByMonthLabel: "Month",
    filterByPaymentMethodLabel: "Payment Method",
    allYears: "All Years",
    allMonths: "All Months",
    allPaymentMethods: "All",
    resetFiltersButton: "Reset Filters",
    months: {
      january: "January", february: "February", march: "March", april: "April",
      may: "May", june: "June", july: "July", august: "August",
      september: "September", october: "October", november: "November", december: "December"
    },
    // Add texts needed by ManageSalesContent if they are not in adminPanel.salesPage
    viewSaleDetails: "View Sale Details",
    backToList: "Back to Sales List",
    orderId: "Order ID", // Already present as tableHeaderSaleId
    customer: "Customer",
    date: "Date", // Already present
    totalAmount: "Total Amount", // Already present
    itemsCount: "Items",
    actions: "Actions", // Already present
    loadingSales: "Loading sales...",
    errorLoadingSales: "Error loading sales.",
    saleDetailsTitle: "Sale Details",
    bookTitle: "Book Title",
    quantity: "Quantity",
    pricePerUnit: "Price/Unit",
    subtotal: "Subtotal",
    productDetails: "Product Details",
    paymentMethod: "Payment Method", // Already present
    saleItems: "Items in this Sale",
    saleNotFound: "Sale not found or failed to load."
  };
  
  // Data fetching will be done client-side in ManageSalesContent
  // const sales: SaleRecord[] = await getSaleRecords(); 

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{salesPageTexts.title}</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ManageSalesContent 
          params={params} 
          texts={salesPageTexts} // Pass the relevant texts
        />
      </Suspense>
    </div>
  );
}
