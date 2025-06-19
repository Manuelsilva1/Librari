
"use client";

// Removed useMemo, useEffect from here as filtering/data is simplified for now
import type { Sale } from '@/types'; // Use API Sale type
import type { Dictionary } from '@/types'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
// Removed Select, Label, Card, FilterX as filters are removed for now
import { Eye } from 'lucide-react'; 
// SaleTicketDialog might be removed or adapted for SaleDetailClient
// For now, removing direct usage of SaleTicketDialog from list view
import Link from 'next/link'; // Import Link for navigation

interface SalesListClientProps {
  sales: Sale[]; // Changed from initialSales: SaleRecord[] to sales: Sale[]
  lang: string;
  // dictionary: Dictionary; // dictionary might not be needed if texts are passed via salesTexts
  texts: Dictionary['adminPanel']['salesPage']; // Use specific texts prop
}

export function SalesListClient({ sales, lang, texts }: SalesListClientProps) {
  // Removed state for selectedSaleForTicket, isTicketDialogOpen, and filter states

  // Removed useMemo hooks for availableYears, monthOptions, filteredSales
  // Removed event handlers: handleViewTicket, handleCloseTicketDialog, resetFilters

  if (sales.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">{texts.noSalesFound || "No sales records found."}</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter UI Card removed for simplification in this step */}
      {/* <Card className="mb-6 shadow-md rounded-lg"> ... </Card> */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{texts.tableHeaderSaleId || "Sale ID"}</TableHead>
            <TableHead>{texts.tableHeaderDate || "Date"}</TableHead>
            <TableHead>User ID</TableHead> {/* Changed from Customer */}
            <TableHead className="text-right">{texts.tableHeaderTotalAmount || "Total"}</TableHead>
            <TableHead className="text-center">Items</TableHead>
            {/* <TableHead>{texts.tableHeaderPaymentMethod || "Payment Method"}</TableHead> */} {/* Payment method not directly on Sale type */}
            <TableHead className="text-center">{texts.tableHeaderActions || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-xs">
                {typeof sale.id === 'string' ? sale.id.substring(0, 8) + '...' : sale.id}
              </TableCell>
              <TableCell>
                {new Date(sale.fecha).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell>{sale.usuarioId || (texts.notApplicable || "N/A")}</TableCell> {/* Display usuarioId */}
              <TableCell className="text-right">UYU {sale.total.toFixed(2)}</TableCell>
              <TableCell className="text-center">{sale.items.length}</TableCell>
              {/* <TableCell>{sale.paymentMethod || (texts.notApplicable || "N/A")}</TableCell> */}
              <TableCell className="text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${lang}/admin/panel/sales?view=detail&id=${sale.id}`}>
                    <Eye className="mr-1 h-4 w-4" /> {texts.viewSaleDetails || "View Details"}
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* SaleTicketDialog removed from here, will be part of SaleDetailClient if needed */}
    </>
  );
}
