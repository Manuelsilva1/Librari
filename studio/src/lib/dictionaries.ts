
import type { Dictionary } from '@/types'; // Import Dictionary type from @/types

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default as Dictionary),
  es: () => import('@/dictionaries/es.json').then((module) => module.default as Dictionary),
};

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  if (locale === 'es') {
    return dictionaries.es();
  }
  // Default to English if locale is not 'es' or if it's undefined/invalid
  return dictionaries.en();
};
