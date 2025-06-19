
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from '@/types'; // Updated import

interface LanguageSwitcherProps {
  dictionary: Dictionary; 
}

export function LanguageSwitcher({ dictionary }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const getLocalizedPath = (locale: string) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'es')) {
      segments[1] = locale;
    } else {
      if (pathname === '/') return `/${locale}`;
      segments.splice(1, 0, locale); 
    }
    return segments.join('/') || '/';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={dictionary.header.changeLanguage}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={getLocalizedPath('en')}>{dictionary.languages.english}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getLocalizedPath('es')}>{dictionary.languages.spanish}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
