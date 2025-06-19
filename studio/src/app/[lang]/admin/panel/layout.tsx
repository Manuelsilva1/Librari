
import type { ReactNode } from 'react';
import Link from 'next/link';
import { CorreoLibroLogo } from '@/components/icons/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, buttonVariants } from '@/components/ui/button'; 
import { LayoutDashboard, BookCopy, Users, Home, Store, Receipt, Building2, Menu, Tags, BarChart3, FileSpreadsheet } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from '@/components/ui/sheet'; 
import { cn } from '@/lib/utils'; 

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
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={adminTexts.navigationMenuTitle}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 pt-6 w-[250px] sm:w-[300px] top-16 h-[calc(100vh-4rem)]" 
            >
              <SheetHeader>
                <SheetTitle className="sr-only">{adminTexts.navigationMenuTitle}</SheetTitle>
              </SheetHeader>
              <AdminPanelSidebarNav lang={lang} dictionary={dictionary} />
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
        </div>
      </div>
    </header>
  );
}

async function AdminPanelSidebarNav({ lang, dictionary }: { lang: string, dictionary: Dictionary }) {
  const sidebarTexts = dictionary.adminPanel?.sidebar || { 
    dashboard: "Dashboard", 
    manageBooks: "Manage Books", 
    manageUsers: "Manage Users",
    statusSoon: "(Soon)",
    pointOfSale: "Point of Sale",
    sales: "Sales", 
    manageEditorials: "Manage Publishers",
    manageCategories: "Manage Categories",
    statistics: "Statistics",
    reports: "Reports"
  };

  const navLinkClasses = cn(
    "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", 
    "hover:bg-accent hover:text-accent-foreground", 
    "h-10 py-2", 
    "justify-start w-full pl-2 pr-4" 
  );

  return (
    <nav className="flex flex-col space-y-2 py-4">
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel`} 
          scroll={false}
          className={navLinkClasses}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.dashboard}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/books`} 
          scroll={false}
          className={navLinkClasses}
        >
          <BookCopy className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.manageBooks}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/categories`} 
          scroll={false}
          className={navLinkClasses}
        >
          <Tags className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.manageCategories}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/editorials`} 
          scroll={false}
          className={navLinkClasses}
        >
          <Building2 className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.manageEditorials}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/pos`} 
          scroll={false}
          className={navLinkClasses}
        >
          <Store className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.pointOfSale}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/sales`} 
          scroll={false}
          className={navLinkClasses}
        >
          <Receipt className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.sales}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/stats`} 
          scroll={false}
          className={navLinkClasses}
        >
          <BarChart3 className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.statistics}</span>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link 
          href={`/${lang}/admin/panel/reports`} 
          scroll={false}
          className={navLinkClasses}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> <span className="text-left">{sidebarTexts.reports}</span>
        </Link>
      </SheetClose>
       <SheetClose asChild>
        <Button 
          variant="ghost" 
          className="justify-start w-full h-auto py-2 items-start pl-2" 
          disabled
        >
          <Users className="mr-2 h-4 w-4 mt-1 flex-shrink-0" /> 
          <div className="flex flex-col text-left">
            <span>{sidebarTexts.manageUsers}</span>
            <span className="text-xs text-muted-foreground">{sidebarTexts.statusSoon}</span>
          </div>
        </Button>
      </SheetClose>
    </nav>
  );
}


export default async function AdminPanelLayout({ children, params: { lang } }: AdminPanelLayoutProps) {
  const dictionary = await getDictionary(lang);
  const currentYear = new Date().getFullYear();
  const footerText = dictionary.adminPanel?.footer?.text || "Admin Panel";

  return (
    <div className="flex min-h-screen flex-col">
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
  );
}

