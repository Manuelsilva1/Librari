
"use client";

// Removed useMemo, useEffect from here as filtering/data is simplified for now
import { useState } from 'react';
import type { Sale } from '@/types'; // Use API Sale type
import type { Dictionary } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Eye, CalendarDays } from 'lucide-react';
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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const filteredSales = selectedDate
    ? sales.filter(sale => {
        const d = new Date(sale.fecha);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : sales;

  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const pagedSales = filteredSales.slice((page - 1) * pageSize, page * pageSize);

  if (sales.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">{texts.noSalesFound || "No sales records found."}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" id="date-filter">
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString(lang)
                  : texts.filterByDateLabel || 'Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => { setSelectedDate(d ?? undefined); setPage(1); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button variant="ghost" onClick={() => { setSelectedDate(undefined); setPage(1); }}>
              {texts.clearDateFilter || 'Clear'}
            </Button>
          )}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{texts.tableHeaderSaleId || "Sale ID"}</TableHead>
            <TableHead>{texts.tableHeaderDate || "Date"}</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead className="text-right">{texts.tableHeaderTotalAmount || "Total"}</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead className="text-center">{texts.tableHeaderActions || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedSales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-xs">
                {typeof sale.id === 'string' ? sale.id.substring(0, 8) + '...' : sale.id}
              </TableCell>
              <TableCell>
                {new Date(sale.fecha).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell>{sale.usuarioId || (texts.notApplicable || "N/A")}</TableCell>
              <TableCell className="text-right">UYU {sale.total.toFixed(2)}</TableCell>
              <TableCell className="text-center">{sale.items.length}</TableCell>
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
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          {texts.pageIndicator
            ? texts.pageIndicator
                .replace('{currentPage}', String(page))
                .replace('{totalPages}', String(totalPages))
            : `Page ${page} of ${totalPages}`}
        </p>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            {texts.prev || 'Prev'}
          </Button>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            {texts.next || 'Next'}
          </Button>
        </div>
      </div>
    </>
    );
}
