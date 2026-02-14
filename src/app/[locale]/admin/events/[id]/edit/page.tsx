import { notFound } from 'next/navigation';
import ItemForm from '@/components/ItemForm';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { getEventById } from '@/lib/queries/events';

export const dynamic = 'force-dynamic';

interface EditEventPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: EditEventPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  try {
    const event = await getEventById(id);
    if (!event) return { title: dict.metadata.eventNotFound };
    return {
      title: `${dict.admin.editMetaTitle} ${event.title} | ${siteConfig.brandName}`,
    };
  } catch {
    return { title: `${dict.admin.editMetaTitle} | ${siteConfig.brandName}` };
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.admin;

  let event;
  try {
    event = await getEventById(id);
  } catch (error) {
    console.error('Failed to fetch event:', error);
  }

  if (!event) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{event.title}</h2>
        <p className="text-muted-foreground">{t.editSubtitle}</p>
      </div>
      <ItemForm initialData={event} locale={locale} translations={t} />
    </div>
  );
}
