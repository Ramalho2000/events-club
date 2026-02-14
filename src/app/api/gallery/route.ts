import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/api-auth';
import { galleryAlbumSchema } from '@/lib/validations/gallery';
import { revalidateGalleryPages } from '@/lib/revalidate';

// GET /api/gallery - List all albums
export async function GET() {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 },
    );
  }
}

// POST /api/gallery - Create a new album (staff required)
export async function POST(request: Request) {
  try {
    const session = await requireStaff();
    if (session instanceof NextResponse) return session;

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

    const album = await prisma.galleryAlbum.create({
      data: {
        ...parsed.data,
        imageCount: parsed.data.images?.length ?? 0,
      },
    });

    revalidateGalleryPages();

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json(
      { error: 'Failed to create album' },
      { status: 500 },
    );
  }
}
