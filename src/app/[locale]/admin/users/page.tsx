import { prisma } from '@/lib/prisma';
import { auth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import type { Metadata } from 'next';
import AdminUserList from './AdminUserList';
import { STAFF_ROLES } from '@/constants/user';

export const dynamic = 'force-dynamic';

interface AdminUsersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminUsersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return { title: dict.metadata.adminTitle };
}

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.adminUsers;

  // Only admins can access this page — managers cannot
  const session = await auth();
  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    redirect('/' + locale + '/admin');
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: [...STAFF_ROLES] } },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">{t.title}</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {staff.length} {t.staffWithAccess}
        </p>
      </div>
      <AdminUserList initialStaff={staff} translations={t} />
    </div>
  );
}
