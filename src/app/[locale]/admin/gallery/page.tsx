import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, ImageIcon, Camera, AlertCircle } from 'lucide-react';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { prisma } from '@/lib/prisma';
import type { GalleryAlbum } from '@/generated/prisma/client';
import AdminAlbumTable from './AdminAlbumTable';

export const dynamic = 'force-dynamic';

interface AdminGalleryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminGalleryPage({
  params,
}: AdminGalleryPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.admin;

  let albums: GalleryAlbum[] = [];
  let dbAvailable = true;

  try {
    albums = await prisma.galleryAlbum.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch albums:', error);
    dbAvailable = false;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {t.manageGallery}
          </h2>
          <p className="text-muted-foreground text-sm">
            {albums.length} {t.albumsCount}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}${siteConfig.routes.adminNewAlbum}`}>
            <Plus className="mr-2 h-4 w-4" />
            {t.addAlbum}
          </Link>
        </Button>
      </div>

      {!dbAvailable ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold">{t.dbUnavailable}</h3>
          <p className="text-sm text-muted-foreground">
            {t.dbUnavailableHint}
          </p>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Camera className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{t.noAlbums}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {t.noAlbumsHint}
          </p>
          <Button asChild>
            <Link href={`/${locale}${siteConfig.routes.adminNewAlbum}`}>
              <Plus className="mr-2 h-4 w-4" />
              {t.addFirstAlbum}
            </Link>
          </Button>
        </div>
      ) : (
        <AdminAlbumTable
          albums={albums.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            coverImage: a.coverImage,
            images: a.images,
            videos: a.videos,
          }))}
          locale={locale}
          galleryApiBasePath={siteConfig.galleryApiBasePath}
                        translations={{
            searchPlaceholder: t.searchAlbumPlaceholder,
            image: t.image,
            albumTitle: t.albumTitle,
            photos: dict.gallery.photos,
            videos: dict.gallery.videos,
            actions: t.actions,
            deleteAlbumTitle: t.deleteAlbumTitle,
                          deleteDescription: t.deleteDescription,
                          deleteConfirm: t.deleteConfirm,
                          cancel: t.cancel,
                          delete: t.delete,
            albumDeleteFailed: t.albumDeleteFailed,
                        }}
                      />
      )}
    </div>
  );
}
