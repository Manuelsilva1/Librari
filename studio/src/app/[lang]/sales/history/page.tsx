"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { getUserSales } from '@/services/api';
import type { Sale, ApiResponseError, Dictionary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, ShoppingBag, ExternalLink, History } from 'lucide-react';
import { PublicLayout } from '@/components/layout/public-layout'; // Assuming PublicLayout can be used
import { getDictionary } from '@/lib/dictionaries'; // To fetch dictionary

// Mock dictionary for standalone development, replace with actual props in production
const mockDictionary: Dictionary = {
  siteName: "CorreoLibro",
  description: "Your favorite online bookstore.",
  locale: "en",
  header: { catalog: "Catalog", cart: "Cart", admin: "Admin Panel", toggleTheme: "Toggle Theme", changeLanguage: "Change Language" },
  footer: { copyright: "© 2023 CorreoLibro. All rights reserved." },
  splashPage: { welcome: "Welcome to CorreoLibro", tagline: "Discover your next great read.", enterCatalog: "Enter Catalog" },
  languages: { english: "English", spanish: "Español" },
  salesHistoryPage: { // Add this section to your actual dictionary files
    title: "My Order History",
    loginPrompt: "Please log in to view your order history.",
    loading: "Loading your orders...",
    noOrders: "You have no past orders.",
    error: "Failed to load order history.",
    orderId: "Order ID",
    date: "Date",
    total: "Total",
    items: "Items",
    viewDetails: "View Details",
    shopNow: "Shop Now"
  }
  // ... other dictionary sections
} as unknown as Dictionary; // Cast to avoid filling all dictionary fields for mock

interface SalesHistoryPageProps {
  params: { lang: string };
  // dictionary: Dictionary; // Will be passed by Next.js if using getStaticProps/getServerSideProps
}

// This is a client component, so we can't use async directly on export default function
// We'll fetch dictionary inside if needed or assume it's passed if part of a larger app structure
export default function SalesHistoryPage({ params }: SalesHistoryPageProps) {
  const { lang } = params;
  const { isAuthenticated, user, token } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState<Dictionary>(mockDictionary); // Use mock initially

  // Fetch actual dictionary - this approach is for client components.
  // If this page were primarily a server component, dictionary would be passed as prop.
  useEffect(() => {
    async function fetchDictionary() {
      try {
        const loadedDict = await getDictionary(lang as 'en' | 'es'); // Cast lang if necessary
        setDictionary(loadedDict);
      } catch (e) {
        console.warn("Could not load dictionary for sales history page, using fallback.", e);
        // mockDictionary is already set
      }
    }
    fetchDictionary();
  }, [lang]);
  
  const texts = dictionary.salesHistoryPage || mockDictionary.salesHistoryPage;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      // Error state or specific message handled by UI conditional logic
      return;
    }

    const fetchSales = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userSales = await getUserSales(page, 10);
        setSales(userSales);
      } catch (err) {
        const apiError = err as ApiResponseError;
        console.error("Failed to fetch sales history:", apiError);
        setError(apiError.message || texts.error || "Failed to load sales history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, [isAuthenticated, token, texts.error, page]); // Depend on page and token

  if (!isAuthenticated) {
    return (
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto px-4 py-12 text-center">
          <History className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-semibold mb-4">{texts.title}</h1>
          <p className="text-muted-foreground mb-6">{texts.loginPrompt}</p>
          <Link href={`/${lang}/login`} passHref legacyBehavior>
            <Button>{dictionary.loginPage?.loginButton || "Login"}</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-xl text-muted-foreground">{texts.loading}</p>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto px-4 py-12 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
          <h1 className="text-2xl font-semibold mb-4 text-destructive">{texts.error}</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout lang={lang} dictionary={dictionary}>
      <div className="container mx-auto px-4 py-12">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center">
              <History className="mr-3 h-8 w-8 text-primary" /> {texts.title}
            </CardTitle>
            <CardDescription>
              Here you can find all the orders you have placed with us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
                <p className="text-xl text-muted-foreground mb-6">{texts.noOrders}</p>
                <Link href={`/${lang}/catalog`} passHref legacyBehavior>
                  <Button variant="default" size="lg">{texts.shopNow}</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N.º Ticket</TableHead>
                    <TableHead>{texts.date}</TableHead>
                    <TableHead className="text-right">{texts.total}</TableHead>
                    <TableHead className="text-center">{texts.items}</TableHead>
                    <TableHead className="text-right">{texts.viewDetails}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.numeroTicket}</TableCell>
                      <TableCell>{new Date(sale.fecha).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                      <TableCell className="text-right">UYU {sale.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{sale.items.length}</TableCell>
                      <TableCell className="text-right">
                        {/* Link to a detailed sale page - to be implemented later */}
                        <Link href={`/${lang}/sales/history/${sale.id}`} passHref legacyBehavior>
                          <Button variant="outline" size="sm">
                            {texts.viewDetails} <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Anterior</Button>
              <Button variant="outline" onClick={() => setPage(p => p + 1)}>Siguiente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
