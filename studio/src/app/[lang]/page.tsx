
import Link from 'next/link';
import { CorreoLibroLogo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/public-layout';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';

interface SplashPageProps {
  params: {
    lang: string;
  };
}

export default async function SplashPage({ params: { lang } }: SplashPageProps) {
  let dictionary: Dictionary | null = null;
  let dictionaryError: string | null = null;

  try {
    dictionary = await getDictionary(lang);
  } catch (error: any) {
    console.error("Error loading dictionary in SplashPage:", error);
    dictionaryError = error.message || "Failed to load page content.";
    // Fallback to a minimal dictionary structure to prevent further errors
    // This structure should match what PublicLayout and its children expect at a minimum.
    dictionary = {
      siteName: "Librería 33",
      description: "Error loading content.",
      locale: lang,
      header: { catalog: "Catalog", cart: "Cart", admin: "Admin", toggleTheme: "Toggle Theme", changeLanguage: "Change Language" },
      footer: { copyright: "© {year} Librería 33. All rights reserved." },
      splashPage: { welcome: "Error", tagline: "Could not load content.", enterCatalog: "Try Catalog" },
      languages: { english: "English", spanish: "Español" },
      // Ensure all top-level keys expected by any component rendered by PublicLayout are present
      // even if they are empty objects or strings, to prevent 'cannot read property of undefined'.
      cartPage: {} as any, // Add fallbacks for all dictionary sections
      catalogPage: {} as any,
      bookDetailPage: {} as any,
      checkoutForm: {} as any,
      loginPage: {} as any,
      adminPanel: {
        sidebar: {} as any,
        header: {} as any,
        footer: {} as any,
        dashboardPage: {} as any,
        booksPage: {} as any,
        editorialsPage: {} as any,
        categoriesPage: {} as any,
        posPage: { ticketDialog: {} } as any,
        salesPage: { months: {} } as any,
        statsPage: {} as any,
        reportsPage: {} as any,
      } as any,
    } as Dictionary; // Use 'as Dictionary' for the overall fallback structure
  }

  // This explicit check for null dictionary is important.
  if (!dictionary) {
     // This case should ideally be hit if the try-catch failed AND the fallback assignment failed.
     // Render a very minimal error page or component that doesn't rely on the dictionary.
    return (
      <div>
        <h1>Critical Error</h1>
        <p>Failed to load essential page data. Please try again later.</p>
      </div>
    );
  }

  if (dictionaryError) {
    // Render an error state if dictionary loading failed but we have a fallback dictionary
    return (
      <PublicLayout lang={lang} dictionary={dictionary}>
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 py-16">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Content Load Error</h1>
          <p className="text-muted-foreground">{dictionaryError}</p>
          <Link href={`/${lang}/catalog`} passHref legacyBehavior>
            <Button variant="outline" className="mt-6">
              Go to Catalog
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout lang={lang} dictionary={dictionary}>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 py-16">
        <CorreoLibroLogo className="h-48 w-48 text-primary mb-8" />
        <h1 className="font-headline text-5xl md:text-6xl font-bold mb-6 text-primary">
          {dictionary.splashPage.welcome}
        </h1>
        <p className="text-xl text-foreground/80 mb-12 max-w-2xl">
          {dictionary.splashPage.tagline}
        </p>
        <Link href={`/${lang}/catalog`} passHref legacyBehavior>
          <Button size="lg" className="font-headline text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            {dictionary.splashPage.enterCatalog} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
