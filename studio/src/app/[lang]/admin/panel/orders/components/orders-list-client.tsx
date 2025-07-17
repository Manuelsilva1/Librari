"use client";
import { useEffect, useState } from 'react';
import { getAdminPedidos } from '@/services/api';
import type { Pedido } from '@/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OrderDetailsDialog } from './order-details-dialog';

export function OrdersListClient({ texts }: { texts: any }) {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminPedidos();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);


  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{texts?.customerName || 'Customer'}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(o => (
            <TableRow key={o.id}>
              <TableCell>{o.id}</TableCell>
              <TableCell>{o.nombre}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(o)}>
                  {texts?.viewDetails || 'View Details'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        texts={texts}
        onStatusUpdated={load}
      />
    </>
  );
}
