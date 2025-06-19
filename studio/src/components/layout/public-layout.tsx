
import type { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import type { Dictionary } from '@/types'; // Updated import

interface PublicLayoutProps {
  children: ReactNode;
  lang: string;
  dictionary: Dictionary;
}

export function PublicLayout({ children, lang, dictionary }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={lang} dictionary={dictionary} />
      <main className="flex-1">{children}</main>
      <Footer dictionary={dictionary} />
    </div>
  );
}
