
"use client";

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-provider';
import { CartProvider } from '@/context/cart-provider';

interface ClientLayoutProvidersProps {
  children: ReactNode;
}

export function ClientLayoutProviders({ children }: ClientLayoutProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* This inner div helps with flex layouts if children need to expand */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
