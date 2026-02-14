import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getCloudinaryImagesByFolder } from '@/lib/cloudinary';

/**
 * Lightweight: returns albums with imageCount from the DB (no Cloudinary calls).
 * Used by the gallery listing page to avoid overfetching.
 */
const DEFAULT_ALBUM_CLOUDINARY_ID = 'ce2eae77b0890e4671789564672d02410d';

/**
 * Get the DB id of the default album (O NAC).
 */
export const getDefaultAlbumId = cache(async (): Promise<string | null> => {
  const album = await prisma.galleryAlbum.findFirst({
    where: { cloudinaryId: DEFAULT_ALBUM_CLOUDINARY_ID },
    select: { id: true },
  });
  return album?.id ?? null;
});

export const getAllAlbumSummaries = cache(async () => {
  const albums = await prisma.galleryAlbum.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      imageCount: true,
      videos: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return albums.map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description,
    coverImage: album.coverImage,
    imageCount: album.imageCount,
    videoCount: album.videos.length,
  }));
});

/**
 * Full fetch for a single album by ID (used by the album detail page).
 */
export const getAlbumById = cache(async (id: string) => {
  const album = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!album) return null;

  // If the album uses Cloudinary and has no stored images, fetch them
  if (album.cloudinaryPath && album.images.length === 0) {
    const { images: cloudImages } = await getCloudinaryImagesByFolder(
      album.cloudinaryPath,
    );
    return {
      ...album,
      images: cloudImages,
      coverImage: album.coverImage || cloudImages[0] || null,
    };
  }

  return album;
});
