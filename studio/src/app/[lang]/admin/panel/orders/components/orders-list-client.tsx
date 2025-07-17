"use client";
import { useEffect, useState } from 'react';
import { getAdminPedidos, updatePedidoStatus } from '@/services/api';
import type { Pedido } from '@/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export function OrdersListClient({ texts }: { texts: any }) {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleApprove = async (id: number | string) => {
    await updatePedidoStatus(id, 'APPROVED');
    await load();
  };

  const handleCancel = async (id: number | string) => {
    await updatePedidoStatus(id, 'CANCELLED');
    await load();
  };

  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
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
            <TableCell className="space-x-2">
              {o.status !== 'APPROVED' && (
                <Button size="sm" onClick={() => handleApprove(o.id)}>{texts?.approve || 'Approve'}</Button>
              )}
              {o.status !== 'CANCELLED' && (
                <Button variant="destructive" size="sm" onClick={() => handleCancel(o.id)}>{texts?.cancel || 'Cancel'}</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
