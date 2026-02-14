import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimateIn from '@/components/AnimateIn';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { getAlbumById } from '@/lib/queries/gallery';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface AlbumDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: AlbumDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  try {
    const album = await getAlbumById(id);
    if (!album) return { title: dict.metadata.galleryTitle };
    return {
      title: `${album.title} | ${siteConfig.brandName}`,
      description: album.description || dict.metadata.galleryDescription,
    };
  } catch {
    return { title: dict.metadata.galleryTitle };
  }
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);

  let album;
  try {
    album = await getAlbumById(id);
  } catch (error) {
    console.error('Failed to fetch album:', error);
  }

  if (!album) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back button */}
      <AnimateIn immediate>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground"
        >
          <Link href={`/${locale}/gallery`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dict.gallery.backToGallery}
          </Link>
        </Button>
      </AnimateIn>

      <AnimateIn className="space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">{album.title}</h1>
          {album.description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {album.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            <Camera className="inline h-4 w-4 mr-1" />
            {album.images.length} {dict.gallery.photos}
          </p>
        </div>

        {/* Photo Grid */}
        {album.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {album.images.map((img, i) => (
              <AnimateIn key={i} delay={i * 50}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer">
                  <Image
                    src={img}
                    alt={`${album.title} - ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </AnimateIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>{dict.gallery.noAlbums}</p>
          </div>
        )}

        {/* Videos */}
        {album.videos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
              {dict.gallery.videos}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {album.videos.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-xl overflow-hidden border"
                >
                  <iframe
                    src={url}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimateIn>
    </div>
  );
}
