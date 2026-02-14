import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { STAFF_ROLES } from '@/constants/user';
import type { UserRole } from '@/types/user';

export type { UserRole } from '@/types/user';

const seedAdmin = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();

/**
 * Get the role of a user by email.
 * The seed admin (env) always returns "admin".
 */
export async function getUserRole(
  email: string | null | undefined,
): Promise<UserRole> {
  if (!email) return 'user';
  const normalized = email.toLowerCase();

  // The seed admin always has the admin role
  if (seedAdmin && normalized === seedAdmin) return 'admin';

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { role: true },
  });
  return (user?.role as UserRole) || 'user';
}

/**
 * Check whether a given email has full admin privileges.
 * Only admins can manage users/roles.
 */
export async function isAdmin(
  email: string | null | undefined,
): Promise<boolean> {
  return (await getUserRole(email)) === 'admin';
}

/**
 * Check whether a given email has staff access (admin OR manager).
 * Staff can access the admin panel and manage cars.
 */
export async function hasStaffAccess(
  email: string | null | undefined,
): Promise<boolean> {
  const role = await getUserRole(email);
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Auto-create / update user record on every sign-in
      if (user.email) {
        const normalized = user.email.toLowerCase();
        const isSeed = seedAdmin && normalized === seedAdmin;
        await prisma.user.upsert({
          where: { email: normalized },
          update: { name: user.name, image: user.image },
          create: {
            email: normalized,
            name: user.name,
            image: user.image,
            role: isSeed ? 'admin' : 'user',
          },
        });
      }
      return true;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Match /{locale}/admin paths
      const isOnAdmin = /^\/[a-z]{2}\/admin/.test(nextUrl.pathname);
      if (isOnAdmin) {
        // Require login; role check is handled in the admin layout
        // so non-staff users see a proper "Access Denied" page
        if (!isLoggedIn || !auth?.user?.email) return false;
        return true;
      }
      return true;
    },
  },
});
