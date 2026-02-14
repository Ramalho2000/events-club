import { notFound } from 'next/navigation';
import GalleryAlbumForm from '@/components/GalleryAlbumForm';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { getAlbumById } from '@/lib/queries/gallery';

export const dynamic = 'force-dynamic';

interface EditAlbumPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: EditAlbumPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  try {
    const album = await getAlbumById(id);
    if (!album) return { title: dict.metadata.galleryTitle };
    return {
      title: `${dict.admin.editMetaTitle} ${album.title} | ${siteConfig.brandName}`,
    };
  } catch {
    return {
      title: `${dict.admin.editMetaTitle} | ${siteConfig.brandName}`,
    };
  }
}

export default async function EditAlbumPage({ params }: EditAlbumPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.admin;

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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{album.title}</h2>
        <p className="text-muted-foreground">{t.editAlbumSubtitle}</p>
      </div>
      <GalleryAlbumForm initialData={album} locale={locale} translations={t} />
    </div>
  );
}
