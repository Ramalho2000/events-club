import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCloudinaryImagesByFolder } from '@/lib/cloudinary';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const PAGE_SIZE = 30;

// GET /api/gallery/[id]/images?cursor=xxx — paginated image fetch
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cursor =
      request.nextUrl.searchParams.get('cursor') ?? undefined;

    const album = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 },
      );
    }

    // If the album has manually stored images, return them all (no pagination)
    if (album.images.length > 0) {
      return NextResponse.json({
        images: album.images,
        nextCursor: null,
        totalCount: album.images.length,
        videos: album.videos,
      });
    }

    // Otherwise fetch from Cloudinary with pagination
    if (album.cloudinaryPath) {
      const result = await getCloudinaryImagesByFolder(
        album.cloudinaryPath,
        { limit: PAGE_SIZE, cursor },
      );
      return NextResponse.json({
        ...result,
        videos: album.videos,
      });
    }

    return NextResponse.json({
      images: [],
      nextCursor: null,
      totalCount: 0,
      videos: album.videos,
    });
  } catch (error) {
    console.error('Error fetching album images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 },
    );
  }
}
