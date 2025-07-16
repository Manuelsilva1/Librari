"use client";

import type { Sale, SaleItem, Book, Dictionary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, ShoppingBag, Printer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBookById, getAdminSaleInvoice } from '@/services/api'; // To fetch book details if not included

interface SaleDetailClientProps {
  sale: Sale;
  texts: any; // Dictionary texts for sales admin
  lang: string;
}

interface EnrichedSaleItem extends SaleItem {
  libroDetails?: Book; // To store fetched book details
}

export function SaleDetailClient({ sale, texts, lang }: SaleDetailClientProps) {
  const [enrichedItems, setEnrichedItems] = useState<EnrichedSaleItem[]>(sale.items);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const handleViewInvoice = async () => {
    try {
      const html = await getAdminSaleInvoice(sale.id);
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
      }
    } catch (err) {
      console.error('Failed to load invoice', err);
    }
  };

  useEffect(() => {
    const fetchBookDetailsForItems = async () => {
      // Check if any item is missing 'libroDetails' or essential fields like 'titulo'
      const itemsToFetch = sale.items.filter(item => !item.libro || !item.libro.titulo);
      if (itemsToFetch.length === 0) {
        // If all items already have 'libro.titulo', assume 'libro' is sufficiently populated
        // Or, if your SaleItem from API never includes 'libro', then always fetch.
        // For this example, if item.libro exists and has a titulo, we skip fetching for that item.
        // If item.libro itself is missing, we definitely fetch.
        const alreadyEnriched = sale.items.every(item => item.libro && item.libro.titulo);
        if (alreadyEnriched) {
          setEnrichedItems(sale.items as EnrichedSaleItem[]); // Cast if confident
          return;
        }
      }

      setIsLoadingItems(true);
      const promises = sale.items.map(async (item) => {
        if (item.libro && item.libro.titulo) return item as EnrichedSaleItem; // Already good
        if (!item.libroId) return { ...item, libroDetails: undefined } as EnrichedSaleItem; // No ID to fetch

        try {
          const bookDetails = await getBookById(item.libroId);
          return { ...item, libroDetails: bookDetails } as EnrichedSaleItem;
        } catch (error) {
          console.error(`Failed to fetch details for book ID ${item.libroId}:`, error);
          return { ...item, libroDetails: { titulo: "Error loading book" } } as EnrichedSaleItem; // Add placeholder on error
        }
      });
      const resolvedItems = await Promise.all(promises);
      setEnrichedItems(resolvedItems);
      setIsLoadingItems(false);
    };

    if (sale && sale.items) {
      fetchBookDetailsForItems();
    }
  }, [sale]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(lang, { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-3xl mb-1">
              {texts.saleDetailsTitle || "Sale Details"}
            </CardTitle>
            <CardDescription>
              {texts.orderId || "Order ID"}: <span className="font-mono text-primary">{sale.id}</span>
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/admin/panel/sales`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {texts.backToList || "Back to List"}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
          <div>
            <h3 className="font-semibold mb-1">Date:</h3>
            <p className="text-muted-foreground">{formatDate(sale.fecha)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">User ID:</h3>
            <p className="text-muted-foreground">{sale.usuarioId || (texts.notApplicable || "N/A")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Total Amount:</h3>
            <p className="text-lg font-bold text-primary">UYU {sale.total.toFixed(2)}</p>
          </div>
           {/* Add other sale-level details if available, e.g., payment method if added to Sale type */}
           {/* <div>
            <h3 className="font-semibold mb-1">{texts.paymentMethod || "Payment Method"}:</h3>
            <p className="text-muted-foreground">{sale.paymentMethod || (texts.notApplicable || "N/A")}</p>
          </div> */}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <ShoppingBag className="mr-2 h-6 w-6 text-primary" /> {texts.saleItems || "Items in this Sale"}
          </h3>
          {isLoadingItems ? (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading item details...</p>
              </div>
          ) : enrichedItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{texts.bookTitle || "Book Title"}</TableHead>
                  <TableHead className="text-center">{texts.quantity || "Quantity"}</TableHead>
                  <TableHead className="text-right">{texts.pricePerUnit || "Price/Unit"}</TableHead>
                  <TableHead className="text-right">{texts.subtotal || "Subtotal"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedItems.map((item, index) => (
                  <TableRow key={item.id || `item-${index}`}>
                    <TableCell className="font-medium">
                      {item.libroDetails?.titulo || item.libro?.titulo || `Book ID: ${item.libroId}` } 
                      {(!item.libroDetails && !item.libro) && <span className="text-xs text-muted-foreground italic"> (Details pending)</span>}
                    </TableCell>
                    <TableCell className="text-center">{item.cantidad}</TableCell>
                    <TableCell className="text-right">UYU {item.precioUnitario.toFixed(2)}</TableCell>
                    <TableCell className="text-right">UYU {(item.cantidad * item.precioUnitario).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No items found in this sale.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleViewInvoice}>
          <Printer className="mr-2 h-4 w-4" /> {texts.viewInvoiceButton || 'View Invoice'}
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${lang}/admin/panel/sales`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {texts.backToList || 'Back to List'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
