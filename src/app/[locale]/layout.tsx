import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDictionary } from '@/i18n/getDictionary';
import { locales, type Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ScrollToTop from '@/components/ScrollToTop';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.homeTitle,
    description: dict.metadata.homeDescription,
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar
          locale={locale}
          brandName={siteConfig.brandName}
          brandIcon={siteConfig.brandIcon}
          translations={dict.nav}
        />
        <main className="flex-1">{children}</main>
        <Footer
          locale={locale}
          brandName={siteConfig.brandName}
          brandIcon={siteConfig.brandIcon}
          contactInfo={siteConfig.contact}
          translations={dict.footer}
        />
        <ScrollToTop />
        <SpeedInsights />
      </body>
    </html>
  );
}
