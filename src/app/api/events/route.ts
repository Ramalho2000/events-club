import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/api-auth';
import { eventSchema } from '@/lib/validations/event';
import { revalidateEventPages } from '@/lib/revalidate';

// GET /api/events - List all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 },
    );
  }
}

// POST /api/events - Create a new event (staff required)
export async function POST(request: Request) {
  try {
    const session = await requireStaff();
    if (session instanceof NextResponse) return session;

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

    const event = await prisma.event.create({ data: parsed.data });

    revalidateEventPages();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 },
    );
  }
}
