import { auth, hasStaffAccess } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminHeader from './AdminHeader';
import AccessDenied from './AccessDenied';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error:', error);
  }

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/' + locale + '/admin');
  }

  // Double-check staff role on the server side (admin or manager)
  const hasAccess = await hasStaffAccess(session.user.email);
  if (!hasAccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-8">
          <AccessDenied
            locale={locale}
            user={session.user}
            translations={dict.accessDenied}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AdminHeader user={session.user} translations={dict.admin} />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
