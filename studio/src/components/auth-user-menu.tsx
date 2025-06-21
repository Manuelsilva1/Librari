'use client';

import type { Dictionary } from '@/types';
import { useAuth } from '@/context/auth-provider';
import { UserMenu } from '@/components/user-menu';

interface AuthUserMenuProps {
  lang: string;
  dictionary: Dictionary;
}

export function AuthUserMenu({ lang, dictionary }: AuthUserMenuProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <UserMenu lang={lang} dictionary={dictionary} />;
}
