import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/api-auth';
import { eventSchema } from '@/lib/validations/event';
import { revalidateEventPages } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get a single event
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 },
    );
  }
}

// PUT /api/events/[id] - Update an event (staff required)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaff();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const event = await prisma.event.update({
      where: { id },
      data: parsed.data,
    });

    revalidateEventPages(id);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 },
    );
  }
}

// DELETE /api/events/[id] - Delete an event (staff required)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaff();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.event.delete({ where: { id } });

    revalidateEventPages(id);

    return NextResponse.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 },
    );
  }
}
