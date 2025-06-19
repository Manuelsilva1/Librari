
// src/app/[lang]/layout.tsx
import type { ReactNode } from 'react';
import { ClientLayoutProviders } from './components/client-layout-providers';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import type { Metadata, Viewport } from 'next';

interface LangLayoutProps {
  children: ReactNode;
  params: { lang: string };
}

export async function generateMetadata({ params: { lang } }: LangLayoutProps): Promise<Metadata> {
  try {
    const dictionary = await getDictionary(lang);
    return {
      title: {
        default: dictionary.siteName,
        template: `%s | ${dictionary.siteName}`,
      },
      description: dictionary.description,
    };
  } catch (error) {
    console.error(`Failed to load dictionary for metadata (lang: ${lang}):`, error);
    // Fallback metadata in case of error
    return {
      title: {
        default: 'Librería 33',
        template: '%s | Librería 33',
      },
      description: 'Error loading page content. Welcome to Librería 33.',
    };
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
};

export default function LangLayout({ children, params }: LangLayoutProps) {
  return (
    <div data-lang={params.lang} className="flex-1 flex flex-col">
      <ClientLayoutProviders>
        {children}
      </ClientLayoutProviders>
    </div>
  );
}
