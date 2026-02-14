'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Globe } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import LanguageSwitcher, { localeFlags } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

interface NavLink {
  href: string;
  label: string;
  exact?: boolean;
}

interface NavbarProps {
  locale: string;
  brandName: string;
  brandIcon?: ReactNode;
  navLinks?: NavLink[];
  translations: {
    home: string;
    events: string;
    gallery: string;
    about: string;
  };
}

export default function Navbar({
  locale,
  brandName,
  brandIcon,
  navLinks: customNavLinks,
  translations: t,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const pathname = usePathname();

  const navLinks = customNavLinks || [
    { href: `/${locale}`, label: t.home, exact: true },
    { href: `/${locale}/events`, label: t.events, exact: false },
    { href: `/${locale}/gallery`, label: t.gallery, exact: false },
    { href: `/${locale}/about`, label: t.about, exact: false },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60 animate-fade-in-down">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {brandIcon || <span className="font-bold text-xl">{brandName}</span>}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent/50',
                isActive(link.href, link.exact)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
              {isActive(link.href, link.exact) && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
          <div className="ml-3">
            {mounted ? (
              <LanguageSwitcher locale={locale} />
            ) : (
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="text-sm">{localeFlags[locale as Locale]}</span>
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted ? (
            <>
              <LanguageSwitcher locale={locale} />
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>
                      Main site navigation links
                    </SheetDescription>
                  </VisuallyHidden>
                  <nav className="flex flex-col gap-2 mt-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'text-lg font-medium px-4 py-3 rounded-lg transition-colors',
                          isActive(link.href, link.exact)
                            ? 'text-foreground bg-accent/50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/30',
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="text-sm">{localeFlags[locale as Locale]}</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
