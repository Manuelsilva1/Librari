
// src/app/layout.tsx
import type { ReactNode } from 'react';
import './globals.css'; // Import global styles
import { Roboto, Open_Sans, Source_Code_Pro } from 'next/font/google';

// Font setup for the whole application
const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const openSans = Open_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
});

interface RootLayoutProps {
  children: ReactNode;
}

// Metadata and viewport here are for the absolute root,
// they can be overridden by [lang]/layout.tsx if needed,
// but [lang]/layout.tsx will primarily handle its own metadata.
export const metadata = {
  title: 'Librería 33', // Generic fallback
  description: 'Your friendly online bookstore for a great reading experience.', // Generic fallback
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // The lang attribute will be dynamically set by the [lang] segment's layout
    // by Next.js convention if [lang]/layout.tsx included <html>.
    // Since we're following the user's structure of <html> only in root,
    // this 'en' is a static fallback. Actual language context is via params.lang.
    // suppressHydrationWarning is added here to prevent issues with next-themes
    <html lang="en" className={`${roboto.variable} ${openSans.variable} ${sourceCodePro.variable}`} suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
