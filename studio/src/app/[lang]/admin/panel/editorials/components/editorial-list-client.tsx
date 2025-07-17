"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { Editorial } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, PlusCircle, Building2, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface EditorialListClientProps {
  editorials: Editorial[];
  onDeleteEditorial: (editorialId: string | number) => Promise<void>;
  lang: string;
  texts: any;
}

export function EditorialListClient({ editorials, onDeleteEditorial, lang, texts }: EditorialListClientProps) {
  const [editorialToDelete, setEditorialToDelete] = useState<Editorial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();

  const handleDeleteConfirmation = async () => {
    if (editorialToDelete && editorialToDelete.id) {
      try {
        await onDeleteEditorial(editorialToDelete.id);
        toast({
          title: texts.toastEditorialDeleted || 'Publisher Deleted',
          description: `${editorialToDelete.nombre} has been deleted.`,
        });
      } finally {
        setEditorialToDelete(null);
      }
    }
  };

  const filtered = editorials.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.rut && e.rut.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.celular && e.celular.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AlertDialog
      open={!!editorialToDelete}
      onOpenChange={open => {
        if (!open) setEditorialToDelete(null);
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Input
              type="text"
              placeholder="Search publishers..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Link href={`/${lang}/admin/panel/editorials?action=add`} passHref legacyBehavior>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {texts.addNewEditorial || 'Add New Publisher'}
            </Button>
          </Link>
        </div>

        {filtered.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{texts.tableHeaderName || 'Name'}</TableHead>
                  <TableHead>{texts.tableHeaderRut || 'RUT'}</TableHead>
                  <TableHead>{texts.tableHeaderCelular || 'Cellphone'}</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-center">{texts.tableHeaderActions || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map(editorial => (
                  <TableRow key={editorial.id}>
                    <TableCell className="font-medium">{editorial.nombre}</TableCell>
                    <TableCell>{editorial.rut || '-'}</TableCell>
                    <TableCell>{editorial.celular || '-'}</TableCell>
                    <TableCell>
                      {editorial.sitioWeb ? (
                        <a href={editorial.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {editorial.sitioWeb}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Link href={`/${lang}/admin/panel/editorials?action=edit&id=${editorial.id}`} passHref legacyBehavior>
                        <Button variant="ghost" size="icon" title={texts.editEditorial || 'Edit Publisher'}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={texts.deleteButton || 'Delete Publisher'}
                        onClick={() => setEditorialToDelete(editorial)}
                        disabled={!editorial.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{texts.noEditorialsFound || 'No publishers found.'}</p>
            <Link href={`/${lang}/admin/panel/editorials?action=add`} passHref legacyBehavior>
              <Button variant="link" className="mt-2">{texts.addNewEditorial || 'Add New Publisher'}</Button>
            </Link>
          </div>
        )}

        {editorialToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{texts.deleteConfirmationTitle || 'Are you sure?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {(texts.deleteConfirmationMessage || 'This action cannot be undone. This will permanently delete the publisher "{name}".').replace('{name}', editorialToDelete.nombre)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEditorialToDelete(null)}>{texts.cancelButton || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {texts.deleteButton || 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>
    </AlertDialog>
  );
}
