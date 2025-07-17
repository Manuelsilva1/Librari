import type { ReactNode } from 'react';
import Link from 'next/link';
import { CorreoLibroLogo } from '@/components/icons/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, buttonVariants } from '@/components/ui/button';
import { LayoutDashboard, BookCopy, Users, Home, Store, Receipt, Building2, Menu, Tags, BarChart3, FileSpreadsheet } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AuthUserMenu } from '@/components/auth-user-menu';
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
    <header className="sticky top-0 z-[60] w-full border-b bg-background/90 backdrop-blur h-16 shadow-sm">
      <div className="container flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={adminTexts.navigationMenuTitle}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 pt-6 w-[250px] sm:w-[300px] top-16 h-[calc(100vh-4rem)] bg-background"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">{adminTexts.navigationMenuTitle}</SheetTitle>
              </SheetHeader>
              <AdminPanelSidebarNav lang={lang} dictionary={dictionary} />
            </SheetContent>
          </Sheet>
          <Link href={`/${lang}/admin/panel`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <CorreoLibroLogo className="h-9 w-9" />
            <span className="font-headline text-xl font-bold">{dictionary.siteName} {adminTexts.titleSuffix}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${lang}/`} passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="gap-1">
              <Home className="h-4 w-4" /> {adminTexts.storefrontLink}
            </Button>
          </Link>
          <ThemeToggle />
          <LanguageSwitcher dictionary={dictionary} />
          <AuthUserMenu lang={lang} dictionary={dictionary} />
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
    "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "hover:bg-accent hover:text-accent-foreground",
    "h-10 py-2 px-3 justify-start w-full"
  );

  return (
    <nav className="flex flex-col space-y-1 py-4 px-2">
      {[
        { href: `/admin/panel`, icon: LayoutDashboard, label: sidebarTexts.dashboard },
        { href: `/admin/panel/books`, icon: BookCopy, label: sidebarTexts.manageBooks },
        { href: `/admin/panel/categories`, icon: Tags, label: sidebarTexts.manageCategories },
        { href: `/admin/panel/editorials`, icon: Building2, label: sidebarTexts.manageEditorials },
        { href: `/admin/panel/pos`, icon: Store, label: sidebarTexts.pointOfSale },
        { href: `/admin/panel/orders`, icon: Receipt, label: sidebarTexts.orders },
        { href: `/admin/panel/sales`, icon: Receipt, label: sidebarTexts.sales },
        { href: `/admin/panel/stats`, icon: BarChart3, label: sidebarTexts.statistics },
        { href: `/admin/panel/reports`, icon: FileSpreadsheet, label: sidebarTexts.reports },
      ].map(({ href, icon: Icon, label }) => (
        <SheetClose asChild key={label}>
          <Link
            href={`/${lang}${href}`}
            scroll={false}
            className={cn(navLinkClasses)}
          >
            <Icon className="mr-2 h-4 w-4" /> <span>{label}</span>
          </Link>
        </SheetClose>
      ))}

      <SheetClose asChild>
        <Link
          href={`/${lang}/admin/panel/customers`}
          scroll={false}
          className={cn(navLinkClasses)}
        >
          <Users className="mr-2 h-4 w-4" /> <span>{sidebarTexts.manageUsers}</span>
        </Link>
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

      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-background">
        {footerText} – {dictionary.footer?.copyright.replace('{year}', currentYear.toString())}
      </footer>
    </div>
  );
}
