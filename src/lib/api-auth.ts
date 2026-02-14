import { NextResponse } from 'next/server';
import { auth, isAdmin, hasStaffAccess } from '@/lib/auth';
import type { Session } from 'next-auth';

/**
 * Require the caller to be a full admin.
 * Returns the session on success, or a 401 NextResponse on failure.
 *
 * Usage:
 *   const session = await requireAdmin();
 *   if (session instanceof NextResponse) return session;
 */
export async function requireAdmin(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

/**
 * Require the caller to have staff access (admin OR manager).
 * Returns the session on success, or a 401 NextResponse on failure.
 *
 * Usage:
 *   const session = await requireStaff();
 *   if (session instanceof NextResponse) return session;
 */
export async function requireStaff(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user || !(await hasStaffAccess(session.user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}
