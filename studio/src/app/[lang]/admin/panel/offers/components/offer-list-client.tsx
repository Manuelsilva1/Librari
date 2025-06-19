"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { Offer } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, PlusCircle, BookOpenCheck, Percent, CalendarDays } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface OfferListClientProps {
  offers: Offer[];
  onDeleteOffer: (offerId: string | number) => Promise<void>;
  texts: any; 
  lang: string;
}

export function OfferListClient({ offers, onDeleteOffer, texts, lang }: OfferListClientProps) {
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const handleDeleteConfirmation = async () => {
    if (offerToDelete && offerToDelete.id) {
      await onDeleteOffer(offerToDelete.id);
      setOfferToDelete(null); // Close dialog
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <AlertDialog open={!!offerToDelete} onOpenChange={(open) => { if (!open) setOfferToDelete(null); }}>
      <div className="space-y-6">
        <div className="flex justify-end items-center">
          <Button asChild>
            <Link href={`/${lang}/admin/panel/offers?action=add`}>
              <PlusCircle className="mr-2 h-4 w-4" /> {texts.addNewOffer || "Add New Offer"}
            </Link>
          </Button>
        </div>

        {offers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{texts.tableHeaderDescription || "Description"}</TableHead>
                <TableHead className="text-center">{texts.tableHeaderDiscount || "Discount"}</TableHead>
                <TableHead>{texts.tableHeaderStartDate || "Start Date"}</TableHead>
                <TableHead>{texts.tableHeaderEndDate || "End Date"}</TableHead>
                <TableHead className="text-center">{texts.tableHeaderBooks || "Books"}</TableHead>
                <TableHead className="text-center">{texts.tableHeaderActions || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium max-w-xs truncate" title={offer.descripcion}>
                    {offer.descripcion}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      <Percent className="mr-1 h-3 w-3" /> {(offer.descuento * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <CalendarDays className="mr-2 h-4 w-4 inline-block text-muted-foreground" />
                    {formatDate(offer.fechaInicio)}
                  </TableCell>
                  <TableCell>
                    <CalendarDays className="mr-2 h-4 w-4 inline-block text-muted-foreground" />
                    {formatDate(offer.fechaFin)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/${lang}/admin/panel/offers?manageBooks=${offer.id}`} passHref legacyBehavior>
                       <Button variant="outline" size="sm" title={texts.offerBooksLabel || "Manage Books"}>
                         <BookOpenCheck className="mr-2 h-4 w-4" /> {offer.libroIds?.length || 0}
                       </Button>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center space-x-1">
                    <Button asChild variant="ghost" size="icon" title={texts.editOffer || "Edit Offer"}>
                      <Link href={`/${lang}/admin/panel/offers?action=edit&id=${offer.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title={texts.deleteButton || "Delete Offer"} onClick={() => setOfferToDelete(offer)} disabled={!offer.id}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <Percent className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{texts.noOffersFound || "No offers found."}</p>
             <Button asChild variant="link" className="mt-2">
                <Link href={`/${lang}/admin/panel/offers?action=add`}>
                    {texts.addNewOffer || "Add New Offer"}
                </Link>
            </Button>
          </div>
        )}
        
        {offerToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{texts.deleteConfirmationTitle || "Are you sure?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {(texts.deleteConfirmationMessage || "This action cannot be undone. This will permanently delete the offer \"{description}\".").replace('{description}', offerToDelete.descripcion)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOfferToDelete(null)}>{texts.cancelButton || "Cancel"}</AlertDialogCancel>
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
