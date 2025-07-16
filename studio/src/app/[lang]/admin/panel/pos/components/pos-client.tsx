
"use client";

import { useState, useEffect, useMemo } from 'react';
import { ImageWithFallback } from '@/components/image-with-fallback';
import { getCoverImageUrl } from '@/lib/utils';
import type { Book, Sale, CreateSalePayload, CreateSaleItemPayload, ApiResponseError } from '@/types'; // Use API Sale types
import type { Dictionary } from '@/types'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Search, XCircle, PlusCircle, MinusCircle, ShoppingCart, DollarSign, CreditCard, Loader2 } from 'lucide-react';
// Import createSale from API services
import { createSale, getNextTicket } from '@/services/api';
import { SaleTicketDialog } from './sale-ticket-dialog'; 

interface PosClientProps {
  lang: string;
  dictionary: Dictionary; 
  allBooks: Book[];
  posTexts: Dictionary['adminPanel']['posPage']; 
}

interface OrderItem {
  book: Book;
  quantity: number;
}

export function PosClient({ lang, dictionary, allBooks, posTexts }: PosClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const { toast } = useToast();
  const [completedSale, setCompletedSale] = useState<Sale | null>(null); // Changed SaleRecord to Sale
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

  const resetPosFields = () => {
    setCurrentOrderItems([]);
    setSearchTerm('');
    setSearchResults([]);
    setPaymentMethod('cash');
    setCustomerName('');
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allBooks.filter(book =>
      (book.titulo && book.titulo.toLowerCase().includes(lowerSearchTerm)) || // Use titulo
      (book.autor && book.autor.toLowerCase().includes(lowerSearchTerm))    // Use autor
    );
    setSearchResults(filtered.slice(0, 10)); 
  }, [searchTerm, allBooks]);

  const addToOrder = (book: Book) => {
    setCurrentOrderItems(prevOrder => {
      const existingItem = prevOrder.find(item => item.book.id === book.id);
      if (existingItem) {
        if (existingItem.quantity < book.stock) {
          return prevOrder.map(item =>
            item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        toast({ title: "Stock limit reached", description: `Cannot add more of ${book.titulo}.`, variant: "destructive" }); // Use titulo
        return prevOrder;
      }
      if (book.stock > 0) {
        return [...prevOrder, { book, quantity: 1 }];
      }
      toast({ title: "Out of stock", description: `${book.titulo} is out of stock.`, variant: "destructive" }); // Use titulo
      return prevOrder;
    });
  };

  const updateOrderItemQuantity = (bookId: string | number, change: number) => { // Allow number for bookId
    setCurrentOrderItems(prevOrder =>
      prevOrder.map(item => {
        if (String(item.book.id) === String(bookId)) { // Compare as strings
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) return null; 
          if (newQuantity > item.book.stock) {
            toast({ title: "Stock limit reached", description: `Max stock for ${item.book.titulo} is ${item.book.stock}.`, variant: "destructive" }); // Use titulo
            return { ...item, quantity: item.book.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item !== null) as OrderItem[]
    );
  };

  const removeOrderItem = (bookId: string | number) => { // Allow number for bookId
    setCurrentOrderItems(prevOrder => prevOrder.filter(item => String(item.book.id) !== String(bookId))); // Compare as strings
  };

  const orderTotal = useMemo(() => {
    return currentOrderItems.reduce((total, item) => total + item.book.precio * item.quantity, 0);
  }, [currentOrderItems]);

  const handleCompleteSale = async () => {
    if (currentOrderItems.length === 0) {
      toast({ title: "Empty Order", description: "Cannot complete sale with an empty order.", variant: "destructive" });
      return;
    }
    setIsProcessingSale(true);
    
    const saleItemsPayload: CreateSaleItemPayload[] = currentOrderItems.map(item => ({
      libroId: item.book.id,
      cantidad: item.quantity,
      precioUnitario: item.book.precio,
    }));

    const nextTicketResp = await getNextTicket();

    const salePayload: CreateSalePayload = {
      items: saleItemsPayload,
      paymentMethod: paymentMethod,
      numeroTicket: nextTicketResp.nextTicket,
      // customerName: customerName || undefined, // If API supports it
    };

    try {
      const createdSale = await createSale(salePayload);
      setCompletedSale(createdSale);
      setIsTicketDialogOpen(true);
      toast({
        title: posTexts.saleCompletedToastTitle,
        description: posTexts.saleCompletedToastDesc + ` Ticket: ${createdSale.numeroTicket}`,
      });
      resetPosFields();
    } catch (error) {
      const apiError = error as ApiResponseError;
      console.error("Error completing sale:", apiError);
      toast({ title: posTexts.errorCompletingSale || "Error", description: apiError.message || "Could not process sale.", variant: "destructive"});
    } finally {
      setIsProcessingSale(false);
    }
  };

  const handleCloseTicketDialog = () => {
    setIsTicketDialogOpen(false);
    setCompletedSale(null);
    resetPosFields();
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Search and Results */}
        <Card className="md:col-span-1 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Book Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder={posTexts.searchBooksPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-base"
            />
            <ScrollArea className="h-[300px] border rounded-md p-2">
              {searchResults.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.map(book => (
                    <li key={book.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <ImageWithFallback
                          src={getCoverImageUrl(book.coverImage)}
                          alt={book.titulo}
                          width={30}
                          height={45}
                          className="rounded object-cover"
                          data-ai-hint="book cover search"
                        />
                        <div className="flex-grow overflow-hidden">
                          <p className="text-sm font-medium truncate" title={book.titulo}>{book.titulo}</p> 
                          <p className="text-xs text-muted-foreground truncate" title={book.autor}>{book.autor}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => addToOrder(book)} disabled={book.stock <= 0}>
                        {posTexts.addToOrder} <PlusCircle className="ml-1 h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{posTexts.noResults}</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Current Order and Payment */}
        <Card className="md:col-span-2 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
              {posTexts.currentOrderTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentOrderItems.length > 0 ? (
              <ScrollArea className="h-[300px] mb-4">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>{posTexts.bookColumn}</TableHead>
                      <TableHead className="text-right">{posTexts.priceColumn}</TableHead>
                      <TableHead className="text-center">{posTexts.quantityColumn}</TableHead>
                      <TableHead className="text-right">{posTexts.totalColumn}</TableHead>
                      <TableHead className="text-center">{posTexts.actionsColumn}</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrderItems.map(item => (
                      <TableRow key={item.book.id}><TableCell className="flex items-center space-x-2">
                        <ImageWithFallback
                          src={getCoverImageUrl(item.book.coverImage)}
                          alt={item.book.titulo}
                          width={40}
                          height={60}
                          className="rounded object-cover"
                          data-ai-hint="book cover order"
                        />
                          <div>
                          <p className="font-medium truncate w-32" title={item.book.titulo}>{item.book.titulo}</p>
                          <p className="text-xs text-muted-foreground truncate w-32" title={item.book.autor}>{item.book.autor}</p>
                          </div>
                        </TableCell>
                      <TableCell className="text-right">UYU {item.book.precio.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => updateOrderItemQuantity(item.book.id, -1)} className="h-6 w-6">
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => updateOrderItemQuantity(item.book.id, 1)} className="h-6 w-6" disabled={item.quantity >= item.book.stock}>
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      <TableCell className="text-right">UYU {(item.book.precio * item.quantity).toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => removeOrderItem(item.book.id)} className="text-destructive h-6 w-6">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">{posTexts.emptyOrder}</p>
            )}

            {currentOrderItems.length > 0 && (
              <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>{posTexts.subtotal}</span>
                    <span>UYU {orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>{posTexts.grandTotal}</span>
                    <span>UYU {orderTotal.toFixed(2)}</span>
                  </div>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-6 pt-6 border-t">
              <div>
                <Label className="font-semibold text-lg">{posTexts.paymentMethodTitle}</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: 'cash' | 'card') => setPaymentMethod(value)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center cursor-pointer"><DollarSign className="mr-1 h-4 w-4"/>{posTexts.cash}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer"><CreditCard className="mr-1 h-4 w-4"/>{posTexts.card}</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                  <Label htmlFor="customerName" className="font-semibold">{posTexts.customerNameLabel}</Label>
                  <Input
                      id="customerName"
                      type="text"
                      placeholder={posTexts.customerNamePlaceholder}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1"
                  />
              </div>
              <Button
                  size="lg"
                  onClick={handleCompleteSale}
                  disabled={isProcessingSale || currentOrderItems.length === 0}
                  className="w-full font-headline text-lg"
              >
                  {isProcessingSale ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                      <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {isProcessingSale ? posTexts.processingSale : posTexts.completeSaleButton}
              </Button>
          </CardFooter>
        </Card>
      </div>
      {completedSale && (
        <SaleTicketDialog 
          isOpen={isTicketDialogOpen}
          onClose={handleCloseTicketDialog}
          saleRecord={completedSale}
          dictionary={dictionary} 
        />
      )}
    </>
  );
}

