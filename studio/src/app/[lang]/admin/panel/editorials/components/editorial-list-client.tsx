
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Editorial } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, PlusCircle, Building2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface EditorialListClientProps {
  editorials: Editorial[]; // Changed from initialEditorials
  onDeleteEditorial: (editorialId: string | number) => Promise<void>; // ID can be string or number
  lang: string;
  texts: any; // Dictionary texts for editorials
}

export function EditorialListClient({ editorials, onDeleteEditorial, lang, texts }: EditorialListClientProps) {
  // Removed local editorials state, use prop directly
  const [editorialToDelete, setEditorialToDelete] = useState<Editorial | null>(null);
  const { toast } = useToast();

  // No longer need useEffect to setEditorials

  const handleDeleteConfirmation = async () => {
    if (editorialToDelete && editorialToDelete.id) { // Ensure ID exists
      try {
        await onDeleteEditorial(editorialToDelete.id); 
        // Parent component will re-fetch and pass updated 'editorials'
        toast({ title: texts.toastEditorialDeleted || "Publisher Deleted", description: `${editorialToDelete.nombre} has been deleted.` }); // Use nombre
      } catch (error) {
        // Error toast is handled by parent
        // toast({ title: texts.toastError || "Error", description: `Failed to delete ${editorialToDelete.nombre}.`, variant: "destructive" });
      } finally {
        setEditorialToDelete(null);
      }
    }
  };

  return (
    <AlertDialog open={!!editorialToDelete} onOpenChange={(open) => { if (!open) setEditorialToDelete(null); }}>
      <div className="space-y-6">
        <div className="flex justify-end items-center">
          <Link href={`/${lang}/admin/panel/editorials?action=add`} passHref legacyBehavior>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {texts.addNewEditorial || "Add New Publisher"}
            </Button>
          </Link>
        </div>

        {editorials.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow><TableHead>{texts.tableHeaderName || "Name"}</TableHead>
                <TableHead>{texts.tableHeaderRut || 'RUT'}</TableHead>
                <TableHead>{texts.tableHeaderCelular || 'Cellphone'}</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="text-center">{texts.tableHeaderActions || "Actions"}</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {editorials.map((editorial) => (
                <TableRow key={editorial.id}><TableCell className="font-medium">{editorial.nombre}</TableCell> {/* Use nombre */}
                  <TableCell>{editorial.rut || '-'}</TableCell>
                  <TableCell>{editorial.celular || '-'}</TableCell>
                  <TableCell>
                    {editorial.sitioWeb ? (
                      <a href={editorial.sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {editorial.sitioWeb}
                      </a>
                    ) : '-'}
                  </TableCell>
                  {/* <TableCell>{editorial.email || '-'}</TableCell> */}
                  <TableCell className="text-center space-x-1">
                    <Link href={`/${lang}/admin/panel/editorials?action=edit&id=${editorial.id}`} passHref legacyBehavior>
                      <Button variant="ghost" size="icon" title={texts.editEditorial || "Edit Publisher"}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" title={texts.deleteButton || "Delete Publisher"} onClick={() => setEditorialToDelete(editorial)} disabled={!editorial.id}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{texts.noEditorialsFound || "No publishers found."}</p>
            <Link href={`/${lang}/admin/panel/editorials?action=add`} passHref legacyBehavior>
                <Button variant="link" className="mt-2">{texts.addNewEditorial || "Add New Publisher"}</Button>
            </Link>
          </div>
        )}
        
        {editorialToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{texts.deleteConfirmationTitle || "Are you sure?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {(texts.deleteConfirmationMessage || "This action cannot be undone. This will permanently delete the publisher \"{name}\".").replace('{name}', editorialToDelete.nombre)} {/* Use nombre */}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEditorialToDelete(null)}>{texts.cancelButton || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {texts.deleteButton || "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </div>
    </AlertDialog>
  );
}
