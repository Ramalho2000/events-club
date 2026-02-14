'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX, Home } from 'lucide-react';
import { useClientDictionary } from '@/i18n/getClientDictionary';

export default function NotFound() {
  const { dict, locale } = useClientDictionary();
  const t = dict.error;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 text-center animate-fade-in-up">
      <div className="rounded-full bg-muted p-6 shadow-inner">
        <SearchX className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        <h2 className="text-6xl font-bold tracking-tighter">404</h2>
        <p className="text-xl text-muted-foreground">{t.notFoundTitle}</p>
        <p className="text-muted-foreground max-w-md">
          {t.notFoundDescription}
        </p>
      </div>
      <Button asChild size="lg" className="shadow-sm">
        <Link href={`/${locale}`}>
          <Home className="mr-2 h-4 w-4" />
          {t.goHome}
        </Link>
      </Button>
    </div>
  );
}
