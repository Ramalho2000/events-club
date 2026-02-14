import GalleryAlbumForm from '@/components/GalleryAlbumForm';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';

interface NewAlbumPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewAlbumPage({ params }: NewAlbumPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.admin;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t.addNewAlbumTitle}</h2>
        <p className="text-muted-foreground">{t.addNewAlbumSubtitle}</p>
      </div>
      <GalleryAlbumForm locale={locale} translations={t} />
    </div>
  );
}
