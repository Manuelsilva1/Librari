
"use client";

import type { Sale } from '@/types';
import type { Dictionary } from '@/types'; // Updated import
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction, 
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Printer } from 'lucide-react';

interface SaleTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saleRecord: Sale | null;
  dictionary: Dictionary;
}

export function SaleTicketDialog({ isOpen, onClose, saleRecord, dictionary }: SaleTicketDialogProps) {
  if (!saleRecord || !saleRecord.items || saleRecord.items.length === 0) return null;

  const texts = dictionary.adminPanel?.posPage?.ticketDialog || { 
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
  };


  const handlePrint = () => {
    console.log("Simulating print for ticket:", saleRecord.numeroTicket);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl text-primary">{texts.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {texts.saleId} <span className="font-mono text-xs">{saleRecord.numeroTicket}</span><br/>
            {texts.date} {new Date(saleRecord.fecha).toLocaleString(dictionary.locale)}<br/>
            {texts.customer} {saleRecord.usuarioId ?? texts.notApplicableShort}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Separator className="my-3" />

        <ScrollArea className="h-[200px] pr-4">
          <div className="text-sm space-y-1">
            {saleRecord.items.map(item => (
              <div key={item.book.id} className="flex justify-between">
                <span className="flex-1 truncate pr-1" title={item.book.titulo}>{item.book.titulo}</span>
                <span className="w-8 text-center">x{item.cantidad}</span>
                <span className="w-16 text-right">UYU {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="my-3" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{texts.subtotal}</span>
              <span>UYU {saleRecord.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-md text-primary pt-1">
            <span>{texts.grandTotal}</span>
              <span>UYU {saleRecord.total.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="my-3" />
        
        <p className="text-sm">{texts.paymentMethod} {saleRecord.metodoPago === 'cash' ? texts.cash : texts.card}</p>

        <AlertDialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>{texts.closeButton}</Button>
          <AlertDialogAction onClick={handlePrint} className="bg-primary hover:bg-primary/90">
            <Printer className="mr-2 h-4 w-4" /> {texts.printButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
