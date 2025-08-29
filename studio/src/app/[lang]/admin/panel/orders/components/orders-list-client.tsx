"use client";
import { useEffect, useMemo, useState } from 'react';
import { getAdminPedidos } from '@/services/api';
import type { Pedido } from '@/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { OrderDetailsDialog } from './order-details-dialog';

export function OrdersListClient({ texts }: { texts: any }) {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'fecha', direction: 'desc' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminPedidos();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const calcTotal = (o: Pedido) =>
    o.items.reduce((sum, it) => sum + (it.book?.precio ?? 0) * it.cantidad, 0);

  const filtered = useMemo(() => {
    let data = orders;
    if (statusFilter !== 'ALL') data = data.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(o =>
        o.id.toString().includes(s) || o.nombre.toLowerCase().includes(s)
      );
    }
    data = [...data].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      let valA: any = a[sort.column as keyof Pedido];
      let valB: any = b[sort.column as keyof Pedido];
      if (sort.column === 'fecha') {
        valA = new Date(a.fecha).getTime();
        valB = new Date(b.fecha).getTime();
      } else if (sort.column === 'total') {
        valA = calcTotal(a);
        valB = calcTotal(b);
      } else if (sort.column === 'nombre') {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      }
      if (valA > valB) return dir;
      if (valA < valB) return -dir;
      return 0;
    });
    return data;
  }, [orders, search, statusFilter, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (column: string) => {
    setSort(prev =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    );
  };


  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Input
          placeholder={texts.searchPlaceholder || 'Search...'}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={v => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{texts.filterAll || 'All'}</SelectItem>
            <SelectItem value="PENDING">{texts.filterPending || 'Pending'}</SelectItem>
            <SelectItem value="APPROVED">{texts.filterApproved || 'Approved'}</SelectItem>
            <SelectItem value="CANCELLED">{texts.filterCancelled || 'Cancelled'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort('id')} className="cursor-pointer">
              ID <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </TableHead>
            <TableHead onClick={() => toggleSort('nombre')} className="cursor-pointer">
              {texts?.customerName || 'Customer'} <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </TableHead>
            <TableHead onClick={() => toggleSort('fecha')} className="cursor-pointer">
              {texts.date || 'Date'} <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </TableHead>
            <TableHead onClick={() => toggleSort('total')} className="cursor-pointer text-right">
              {texts.total || 'Total'} <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </TableHead>
            <TableHead>{texts.paymentMethod || 'Payment'}</TableHead>
            <TableHead>{texts.status || 'Status'}</TableHead>
            <TableHead>{texts.actions || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map(o => (
            <TableRow key={o.id}>
              <TableCell>{o.id}</TableCell>
              <TableCell>{o.nombre}</TableCell>
              <TableCell>{formatDate(o.fecha)}</TableCell>
              <TableCell className="text-right">UYU {calcTotal(o).toFixed(2)}</TableCell>
              <TableCell>{o.metodoPago || texts.notApplicable || 'N/A'}</TableCell>
              <TableCell>
                <Badge
                  className={`capitalize ${
                    o.status === 'APPROVED' 
                      ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                      : ''
                  }`}
                  variant={o.status === 'APPROVED' ? 'secondary' : o.status === 'CANCELLED' ? 'destructive' : 'outline'}
                >
                  {o.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(o)}>
                  {texts?.viewDetails || 'View Details'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          {texts.pageIndicator
            ? texts.pageIndicator.replace('{currentPage}', page.toString()).replace('{totalPages}', totalPages.toString())
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
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        texts={texts}
        onStatusUpdated={load}
      />
    </>
  );
}
