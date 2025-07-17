"use client";

import { useState, useMemo } from 'react';
import type { Pedido } from '@/types';
import { updatePedidoStatus } from '@/services/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsDialogProps {
  order: Pedido | null;
  onClose: () => void;
  texts: any;
  onStatusUpdated: () => void;
}

export function OrderDetailsDialog({ order, onClose, texts, onStatusUpdated }: OrderDetailsDialogProps) {
  const [status, setStatus] = useState(order?.status || 'PENDING');
  const { toast } = useToast();

  const total = useMemo(
    () => order?.items.reduce((sum, it) => sum + (it.book?.precio ?? 0) * it.cantidad, 0) || 0,
    [order]
  );


  if (!order) return null;

  const handleUpdate = async () => {
    try {
      await updatePedidoStatus(order.id, status);
      toast({ title: texts.toastStatusUpdated || 'Status Updated!' });
      onStatusUpdated();
      onClose();
    } catch (err) {
      toast({ title: texts.toastErrorUpdatingStatus || 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <AlertDialog open={!!order} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl text-primary">
            {texts.orderDetailsTitle || 'Order Details'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-1 text-sm mt-2">
          <p><strong>ID:</strong> {order.id}</p>
          <p><strong>{texts.customerName || 'Customer'}:</strong> {order.nombre} ({order.email})</p>
          <p><strong>Celular:</strong> {order.celular}</p>
          <p><strong>Address:</strong> {order.direccion}, {order.ciudad}, {order.estado} {order.zip}</p>
          <p><strong>{texts.paymentMethod || 'Payment'}:</strong> {order.metodoPago || texts.notApplicable || 'N/A'}</p>
          <p>
            <strong>{texts.status || 'Status'}:</strong>{' '}
            <Badge className="capitalize" variant={order.status === 'APPROVED' ? 'secondary' : order.status === 'CANCELLED' ? 'destructive' : 'outline'}>
              {order.status}
            </Badge>
          </p>
          <p><strong>{texts.total || 'Total'}:</strong> UYU {total.toFixed(2)}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">{texts.items || 'Items'}</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead className="text-center">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.libro?.titulo || item.book?.titulo || `ID ${item.libroId || item.book?.id}`}</TableCell>
                  <TableCell className="text-center">{item.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {order.historial && order.historial.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">{texts.history || 'History'}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {order.historial.map((h, idx) => (
                <li key={idx}>{h.status} - {new Date(h.fecha).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium">{texts.status || 'Status'}</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleUpdate} className="w-full">
            {texts.updateStatus || 'Update Status'}
          </Button>
        </div>
        <AlertDialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>{texts.closeButton || 'Close'}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
