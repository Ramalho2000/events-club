import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/api-auth';
import { galleryAlbumSchema } from '@/lib/validations/gallery';
import { revalidateGalleryPages } from '@/lib/revalidate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/gallery/[id] - Get a single album
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const album = await prisma.galleryAlbum.findUnique({ where: { id } });

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 },
    );
  }
}

// PUT /api/gallery/[id] - Update an album (staff required)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaff();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await request.json();
    const parsed = galleryAlbumSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: {
        ...parsed.data,
        imageCount: parsed.data.images?.length ?? 0,
      },
    });

    revalidateGalleryPages(id);

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 },
    );
  }
}

// DELETE /api/gallery/[id] - Delete an album (staff required)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireStaff();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.galleryAlbum.delete({ where: { id } });

    revalidateGalleryPages(id);

    return NextResponse.json({ message: 'Album deleted' });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 },
    );
  }
}
