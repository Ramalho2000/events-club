'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Shield, ArrowLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  translations: {
    dashboard: string;
    signOut: string;
  };
}

export default function AdminHeader({
  user,
  translations: t,
}: AdminHeaderProps) {
  const pathname = usePathname();
  // Show back button if not on the main admin page (e.g., /admin/events/new, /admin/users)
  const isMainAdminPage = pathname?.match(/\/[^/]+\/admin$/);
  const showBackButton = pathname && !isMainAdminPage;
  const locale = pathname?.split('/')[1] || 'pt';

  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button asChild variant="ghost" size="sm" className="mr-2">
              <Link href={`/${locale}/admin`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{t.dashboard}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name || user.email}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t.signOut}
          </Button>
        </div>
      </div>
    </div>
  );
}
