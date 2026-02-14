export const locales = ['pt', 'en', 'es', 'fr'] as const;
export const defaultLocale = 'pt' as const;

export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
