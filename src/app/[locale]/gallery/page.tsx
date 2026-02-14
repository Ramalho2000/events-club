import AnimateIn from '@/components/AnimateIn';
import GalleryAlbumViewer from '@/components/GalleryAlbumViewer';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { getAllAlbumSummaries, getDefaultAlbumId } from '@/lib/queries/gallery';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.galleryTitle,
    description: dict.metadata.galleryDescription,
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  let albums: Awaited<ReturnType<typeof getAllAlbumSummaries>> = [];
  let defaultAlbumId: string | null = null;
  try {
    [albums, defaultAlbumId] = await Promise.all([
      getAllAlbumSummaries(),
      getDefaultAlbumId(),
    ]);
  } catch (error) {
    console.error('Failed to fetch albums:', error);
  }

  return (
    <div className="container mx-auto px-4 py-14">
      {/* Header */}
      <AnimateIn className="text-center mb-12 space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {dict.gallery.title}
        </h1>
        <p className="text-muted-foreground text-lg">
          {dict.gallery.subtitle}
        </p>
      </AnimateIn>

      <GalleryAlbumViewer
        albums={albums}
        defaultAlbumId={defaultAlbumId}
        translations={{
          selectAlbum: dict.gallery.selectAlbum,
          photos: dict.gallery.photos,
          videos: dict.gallery.videos,
          noPhotosInAlbum: dict.gallery.noPhotosInAlbum,
          noAlbums: dict.gallery.noAlbums,
          noAlbumsHint: dict.gallery.noAlbumsHint,
          loadMore: dict.gallery.loadMore,
        }}
      />
    </div>
  );
}
