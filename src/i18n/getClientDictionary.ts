import { usePathname } from 'next/navigation';
import { locales, defaultLocale, type Locale } from './config';

import ptDict from './dictionaries/pt.json';
import enDict from './dictionaries/en.json';
import esDict from './dictionaries/es.json';
import frDict from './dictionaries/fr.json';

const dictionaries = { pt: ptDict, en: enDict, es: esDict, fr: frDict };

/**
 * Client-side hook that extracts the locale from the URL pathname
 * and returns the corresponding dictionary.
 *
 * Useful for client components that don't receive `params`
 * (e.g. error.tsx, not-found.tsx).
 */
export function useClientDictionary() {
  const pathname = usePathname();
  const segment = pathname?.split('/')[1] || '';
  const locale = locales.includes(segment as Locale)
    ? (segment as Locale)
    : defaultLocale;
  return { dict: dictionaries[locale], locale };
}
