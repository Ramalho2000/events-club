import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Tag, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ImageGallery from '@/components/ImageGallery';
import AnimateIn from '@/components/AnimateIn';
import { getDictionary } from '@/i18n/getDictionary';
import type { Locale } from '@/i18n/config';
import { siteConfig } from '@/config/site';
import { getEventById } from '@/lib/queries/events';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface EventDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);
  try {
    const event = await getEventById(id);
    if (!event) return { title: dict.metadata.eventNotFound };
    return {
      title: `${event.title} | ${siteConfig.brandName}`,
      description: event.description.substring(0, 160),
    };
  } catch {
    return { title: dict.metadata.eventNotFound };
  }
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);

  let event;
  try {
    event = await getEventById(id);
  } catch (error) {
    console.error('Failed to fetch event:', error);
  }

  if (!event) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryLabel =
    dict.admin.categories[
      event.category as keyof typeof dict.admin.categories
    ] || event.category;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Back button */}
      <AnimateIn immediate>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground"
        >
          <Link href={`/${locale}/events`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {dict.events.backToEvents}
          </Link>
        </Button>
      </AnimateIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <AnimateIn>
          <ImageGallery
            images={event.images}
            alt={event.title}
            badge={event.featured ? dict.events.featured : undefined}
          />
        </AnimateIn>

        {/* Event Info */}
        <AnimateIn delay={100}>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <Badge variant="secondary" className="mt-3">
                {categoryLabel}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <CalendarDays className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {formatDate(event.date)} · {formatTime(event.date)}
                  </p>
                  {event.endDate && (
                    <p className="text-sm">
                      {dict.eventDetail.endDate}: {formatDate(event.endDate)} ·{' '}
                      {formatTime(event.endDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <p className="font-medium text-foreground">{event.location}</p>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Tag className="h-5 w-5 flex-shrink-0" />
                <p className="font-medium text-foreground">{categoryLabel}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">
                {dict.eventDetail.description}
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>

            <Separator />

            {/* CTA */}
            <div className="rounded-xl border bg-muted/30 p-6 space-y-3">
              <h3 className="font-semibold">
                {dict.eventDetail.interestedTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {dict.eventDetail.interestedSubtitle}
              </p>
              <Button asChild>
                <Link href={`/${locale}/about`}>
                  <Mail className="mr-2 h-4 w-4" />
                  {dict.eventDetail.contactUs}
                </Link>
              </Button>
            </div>
          </div>
        </AnimateIn>
      </div>
    </div>
  );
}
