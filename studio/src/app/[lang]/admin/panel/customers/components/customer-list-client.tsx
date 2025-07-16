"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, PlusCircle, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface CustomerListClientProps {
  customers: User[];
  onDeleteCustomer: (id: string | number) => Promise<void>;
  lang: string;
  texts: any;
}

export function CustomerListClient({ customers, onDeleteCustomer, lang, texts }: CustomerListClientProps) {
  const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);

  const handleDelete = async () => {
    if (customerToDelete) {
      await onDeleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  return (
    <AlertDialog open={!!customerToDelete} onOpenChange={open => { if (!open) setCustomerToDelete(null); }}>
      <div className="space-y-6">
        <div className="flex justify-end items-center">
          <Link href={`/${lang}/admin/panel/customers?action=add`} passHref legacyBehavior>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> {texts.addNewCustomer}</Button>
          </Link>
        </div>
        {customers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{texts.tableHeaderName}</TableHead>
                <TableHead>{texts.tableHeaderEmail}</TableHead>
                <TableHead>{texts.tableHeaderRegistered}</TableHead>
                <TableHead>{texts.tableHeaderStatus}</TableHead>
                <TableHead className="text-center">{texts.tableHeaderActions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.fechaRegistro ? format(new Date(c.fechaRegistro), 'yyyy-MM-dd') : '-'}</TableCell>
                  <TableCell>{c.activo ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-center space-x-1">
                    <Link href={`/${lang}/admin/panel/customers?action=edit&id=${c.id}`} passHref legacyBehavior>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setCustomerToDelete(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{texts.noCustomersFound}</p>
            <Link href={`/${lang}/admin/panel/customers?action=add`} passHref legacyBehavior>
              <Button variant="link" className="mt-2">{texts.addNewCustomer}</Button>
            </Link>
          </div>
        )}

        {customerToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{texts.deleteConfirmationTitle}</AlertDialogTitle>
              <AlertDialogDescription>{texts.deleteConfirmationMessage.replace('{name}', customerToDelete.nombre)}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>{texts.cancelButton}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {texts.deleteButton}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>
    </AlertDialog>
  );
}
