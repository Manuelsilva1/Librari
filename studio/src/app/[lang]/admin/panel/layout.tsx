
import type { ReactNode } from 'react';
import Link from 'next/link';
import { CorreoLibroLogo } from '@/components/icons/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Home, Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AuthUserMenu } from '@/components/auth-user-menu';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from '@/components/admin/sidebar-nav';

interface AdminPanelLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

async function AdminPanelHeader({ lang, dictionary }: { lang: string, dictionary: Dictionary }) {
  const adminTexts = dictionary.adminPanel?.header || { 
    titleSuffix: "Admin", 
    storefrontLink: "Storefront",
    navigationMenuTitle: "Navigation Menu"
  };
  
  return (
    <header className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur h-16">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label={adminTexts.navigationMenuTitle}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="md:hidden p-0 pt-6 w-[250px] sm:w-[300px] top-16 h-[calc(100vh-4rem)] transition-transform duration-300 ease-out"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">{adminTexts.navigationMenuTitle}</SheetTitle>
              </SheetHeader>
              <SidebarNav lang={lang} />
            </SheetContent>
          </Sheet>
          <Link href={`/${lang}/admin/panel`} className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <CorreoLibroLogo className="h-8 w-8" />
            <span className="font-headline text-xl font-bold">{dictionary.siteName} {adminTexts.titleSuffix}</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/${lang}/`} passHref legacyBehavior>
            <Button variant="ghost" size="sm"><Home className="mr-2 h-4 w-4"/>{adminTexts.storefrontLink}</Button>
          </Link>
          <ThemeToggle />
          <LanguageSwitcher dictionary={dictionary}/>
          <AuthUserMenu lang={lang} dictionary={dictionary} />
        </div>
      </div>
    </header>
  );
}


export default async function AdminPanelLayout({ children, params: { lang } }: AdminPanelLayoutProps) {
  const dictionary = await getDictionary(lang);
  const currentYear = new Date().getFullYear();
  const footerText = dictionary.adminPanel?.footer?.text || "Admin Panel";

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:block md:w-64 border-r bg-background">
        <SidebarNav lang={lang} />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        <AdminPanelHeader lang={lang} dictionary={dictionary} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <footer className="border-t py-4 text-center text-sm text-muted-foreground">
          {footerText} - {dictionary.footer.copyright.replace('{year}', currentYear.toString())}
        </footer>
      </div>
    </div>
  );
}

