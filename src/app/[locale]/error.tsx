'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useClientDictionary } from '@/i18n/getClientDictionary';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { dict, locale } = useClientDictionary();
  const t = dict.error;

  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground max-w-md">{t.description}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          <RotateCcw className="mr-2 h-4 w-4" />
          {t.tryAgain}
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${locale}`}>{t.goHome}</Link>
        </Button>
      </div>
    </div>
  );
}
