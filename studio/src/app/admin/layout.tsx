import type { ReactNode } from 'react';
import Link from 'next/link';
import { CorreoLibroLogo } from '@/components/icons/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookCopy, Users, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: ReactNode;
}

// Simple Admin Header
function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <CorreoLibroLogo className="h-8 w-8" />
          <span className="font-headline text-xl font-bold">CorreoLibro Admin</span>
        </Link>
        <div className="flex items-center space-x-2">
          <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" size="sm"><Home className="mr-2 h-4 w-4"/>Storefront</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// Simple Admin Sidebar Navigation
function AdminSidebarNav() {
  return (
    <nav className="flex flex-col space-y-2 p-4">
      <Link href="/admin" passHref legacyBehavior>
        <Button variant="ghost" className="justify-start w-full">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </Button>
      </Link>
      <Link href="/admin/books" passHref legacyBehavior>
        <Button variant="ghost" className="justify-start w-full">
          <BookCopy className="mr-2 h-4 w-4" /> Manage Books
        </Button>
      </Link>
      {/* Add more admin links here if needed */}
       <Button variant="ghost" className="justify-start w-full" disabled>
          <Users className="mr-2 h-4 w-4" /> Manage Users (Soon)
        </Button>
    </nav>
  );
}


export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="container mx-auto flex-1 px-0 md:px-4">
        <div className="grid md:grid-cols-[240px_1fr] gap-0 md:gap-8">
          <aside className="hidden md:block border-r py-6">
            <AdminSidebarNav />
          </aside>
          <main className="py-6 px-4 md:px-0">{children}</main>
        </div>
      </div>
       <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Admin Panel - CorreoLibro &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
