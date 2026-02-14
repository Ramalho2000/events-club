import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { STAFF_ROLES, STAFF_ROLE_ERROR_MESSAGE } from '@/constants/user';
import { revalidateUserPages } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateRoleSchema = z.object({
  role: z.enum(STAFF_ROLES, {
    message: STAFF_ROLE_ERROR_MESSAGE,
  }),
});

// PATCH /api/admin/users/[id] — Change a staff member's role
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from demoting themselves
    if (
      target.email === session.user!.email?.toLowerCase() &&
      parsed.data.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'You cannot demote yourself' },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });

    revalidateUserPages();

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] — Revoke staff access (set role to "user")
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    // Prevent removing yourself
    const target = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.email === session.user!.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot remove your own staff access' },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id },
      data: { role: 'user' },
    });

    revalidateUserPages();

    return NextResponse.json({ message: 'Staff access revoked' });
  } catch (error) {
    console.error('Error revoking staff access:', error);
    return NextResponse.json(
      { error: 'Failed to revoke staff access' },
      { status: 500 },
    );
  }
}
