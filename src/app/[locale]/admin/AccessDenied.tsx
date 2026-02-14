'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShieldX, LogIn, Home } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AccessDeniedProps {
  locale: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  translations: {
    title: string;
    description: string;
    signedInAs: string;
    switchAccount: string;
    goHome: string;
  };
}

export default function AccessDenied({
  locale,
  user,
  translations: t,
}: AccessDeniedProps) {
  const handleSwitchAccount = () => {
    signOut({ callbackUrl: `/api/auth/signin?callbackUrl=/${locale}/admin` });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <p className="text-muted-foreground max-w-lg">{t.description}</p>
      </div>

      {/* Current user info */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || ''}
            width={36}
            height={36}
            className="rounded-full"
          />
        )}
        <div className="text-left">
          <p className="text-xs text-muted-foreground">{t.signedInAs}</p>
          <p className="text-sm font-medium">{user.name || user.email}</p>
          {user.name && user.email && (
            <p className="text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSwitchAccount}>
          <LogIn className="mr-2 h-4 w-4" />
          {t.switchAccount}
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${locale}`}>
            <Home className="mr-2 h-4 w-4" />
            {t.goHome}
          </Link>
        </Button>
      </div>
    </div>
  );
}
