// src/app/[lang]/admin/panel/offers/page.tsx
import { Suspense } from 'react';
import type { Dictionary } from '@/types';
import { getDictionary } from '@/lib/dictionaries';
import { Loader2 } from 'lucide-react';
import { ManageOffersContent } from './components/manage-offers-content';

interface ManageOffersPageProps {
  params: any;
}

// Texts that would ideally come from the dictionary
const mockOfferTexts = {
  title: "Manage Offers",
  addNewOffer: "Add New Offer",
  editOffer: "Edit Offer",
  offerDescriptionLabel: "Description",
  offerDescriptionPlaceholder: "e.g., Summer Sale, 20% off all fiction books",
  offerDiscountLabel: "Discount Percentage (e.g., 0.1 for 10%)",
  offerDiscountPlaceholder: "0.20",
  offerStartDateLabel: "Start Date",
  offerEndDateLabel: "End Date",
  offerBooksLabel: "Manage Books in Offer",
  deleteConfirmationTitle: "Are you sure?",
  deleteConfirmationMessage: "This will permanently delete the offer \"{description}\". This action cannot be undone.",
  deleteButton: "Delete Offer",
  cancelButton: "Cancel",
  saveButton: "Save Offer",
  addButton: "Add Offer",
  noOffersFound: "No offers found.",
  tableHeaderDescription: "Description",
  tableHeaderDiscount: "Discount",
  tableHeaderStartDate: "Start Date",
  tableHeaderEndDate: "End Date",
  tableHeaderBooks: "Books in Offer",
  tableHeaderActions: "Actions",
  toastOfferSaved: "Offer Saved!",
  toastOfferDeleted: "Offer Deleted!",
  toastError: "An error occurred",
  offerNotFound: "Offer not found or failed to load."
};


export default async function ManageOffersPage({ params }: ManageOffersPageProps) {
  // const dictionary: Dictionary = await getDictionary(params.lang);
  // const offerTexts = dictionary.adminPanel?.offersPage || mockOfferTexts; // Use mock for now
  const offerTexts = mockOfferTexts; // Using mock for simplicity in this step

  // Initial data fetching on the server can be done here if needed,
  // but ManageOffersContent will fetch client-side.
  // const initialOffersData = await apiGetOffers(); // Example, if using server fetch for initial load

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{offerTexts.title}</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <ManageOffersContent
            params={params}
            // initialOffers={initialOffersData || []} // Pass if fetched server-side
            texts={offerTexts}
        />
      </Suspense>
    </div>
  );
}
