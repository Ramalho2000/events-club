import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';
import { STAFF_ROLES, STAFF_ROLE_ERROR_MESSAGE } from '@/constants/user';
import { revalidateUserPages } from '@/lib/revalidate';

const addStaffSchema = z.object({
  email: z.string().email('A valid email is required'),
  role: z.enum(STAFF_ROLES, {
    message: STAFF_ROLE_ERROR_MESSAGE,
  }),
});

// GET /api/admin/users — List all staff (admins & managers)
export async function GET() {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

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

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 },
    );
  }
}

// POST /api/admin/users — Add a new admin or manager by email
export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const parsed = addStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: { role: parsed.data.role },
      create: {
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
      },
    });

    revalidateUserPages();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error adding staff member:', error);
    return NextResponse.json(
      { error: 'Failed to add staff member' },
      { status: 500 },
    );
  }
}
